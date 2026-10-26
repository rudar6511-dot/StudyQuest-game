import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });
const env = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error("Missing Supabase secret: " + key);
  return value;
};
const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  try {
    const url = env("SUPABASE_URL");
    const anonKey = env("SUPABASE_ANON_KEY");
    const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
    const adminDb = createClient(url, serviceKey, { auth: { persistSession: false } });
    const body = await req.json();
    const action = String(body.action || "");

    // Gmail approval links use a random, expiring, single-use token; no sign-in needed to review.
    if (action === "reviewEmailToken") {
      const token = String(body.token || "");
      if (token.length < 32) return json({ error: "Invalid or missing review token." }, 400);
      const tokenHash = await sha256(token);
      const { data: row, error: tokenError } = await adminDb.from("sq_guild_review_tokens")
        .select("id,application_id,decision,expires_at,used_at")
        .eq("token_hash", tokenHash).maybeSingle();
      if (tokenError) throw tokenError;
      if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
        return json({ error: "This review link is invalid, expired, or already used." }, 410);
      }
      const { data: app, error: appError } = await adminDb.from("sq_guild_applications")
        .select("id,guild_id,applicant_id,status").eq("id", row.application_id).single();
      if (appError) throw appError;
      if (app.status !== "pending") return json({ error: "This application has already been reviewed." }, 409);
      const now = new Date().toISOString();
      const { error: updateError } = await adminDb.from("sq_guild_applications")
        .update({ status: row.decision, reviewed_at: now }).eq("id", app.id).eq("status", "pending");
      if (updateError) throw updateError;
      if (row.decision === "accepted") {
        const { error: memberError } = await adminDb.from("sq_guild_members")
          .upsert({ guild_id: app.guild_id, user_id: app.applicant_id }, { onConflict: "guild_id,user_id" });
        if (memberError) throw memberError;
      }
      const { error: markError } = await adminDb.from("sq_guild_review_tokens")
        .update({ used_at: now }).eq("application_id", app.id).is("used_at", null);
      if (markError) throw markError;
      return json({ ok: true, decision: row.decision, message: row.decision === "accepted" ? "Applicant accepted and added to the guild." : "Applicant rejected." });
    }

    // All other actions require a valid signed-in Supabase user.
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Sign in with Supabase Auth first." }, 401);
    const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Your session is invalid or expired. Please sign in again." }, 401);

    if (action === "listGuilds") {
      const { data, error } = await adminDb.from("sq_guilds").select("id,name,description,admin_email,created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return json({ guilds: data || [] });
    }

    if (action === "createGuild") {
      const name = String(body.name || "").trim();
      const description = String(body.description || "").trim();
      const adminEmail = String(body.adminEmail || "").trim().toLowerCase();
      const questions = body.questions;
      if (name.length < 3 || name.length > 40 || description.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
        return json({ error: "Enter a guild name (3–40 chars), description, and valid admin email." }, 400);
      }
      if (!Array.isArray(questions) || questions.length !== 20 || questions.some((q: any) => !q.question || !Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(q.correctOption) || q.correctOption < 0 || q.correctOption > 3 || !["Maths","Science","English","Reasoning"].includes(q.subject))) {
        return json({ error: "Provide exactly 20 complete questions (5 per subject), each with four options and one correct answer." }, 400);
      }
      const { data: guild, error } = await adminDb.from("sq_guilds").insert({
        name, description, admin_id: user.id, admin_email: adminEmail
      }).select("id,name,description,admin_email,created_at").single();
      if (error) {
        if (error.code === "23505") return json({ error: "A guild with this name already exists." }, 409);
        throw error;
      }
      const rows = questions.map((q: any, i: number) => ({
        guild_id: guild.id, question_no: i + 1, subject: q.subject,
        question: String(q.question).slice(0, 500), options: q.options.map((o: unknown) => String(o).slice(0, 200)),
        correct_option: q.correctOption
      }));
      const { error: qError } = await adminDb.from("sq_guild_questions").insert(rows);
      if (qError) {
        await adminDb.from("sq_guilds").delete().eq("id", guild.id);
        throw qError;
      }
      await adminDb.from("sq_guild_members").upsert({ guild_id: guild.id, user_id: user.id }, { onConflict: "guild_id,user_id" });
      return json({ guild });
    }

    if (action === "getEntranceTest") {
      const guildId = String(body.guildId || "");
      const { data: questions, error } = await adminDb.from("sq_guild_questions")
        .select("id,question_no,subject,question,options").eq("guild_id", guildId).order("question_no");
      if (error) throw error;
      if (!questions || questions.length !== 20) return json({ error: "This guild's entrance test is not ready." }, 404);
      return json({ questions });
    }

    if (action === "apply") {
      const guildId = String(body.guildId || "");
      const applicantName = String(body.applicantName || "").trim().slice(0, 60);
      const applicantEmail = String(body.applicantEmail || user.email || "").trim().toLowerCase();
      const answers = body.answers;
      if (!applicantName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail) || !Array.isArray(answers) || answers.length !== 20 || answers.some((a: unknown) => !Number.isInteger(a) || Number(a) < 0 || Number(a) > 3)) {
        return json({ error: "Enter your name and valid email, then answer all 20 questions." }, 400);
      }
      const { data: guild, error: guildError } = await adminDb.from("sq_guilds").select("id,name,admin_email").eq("id", guildId).single();
      if (guildError) throw guildError;
      if (guild.admin_email === applicantEmail) return json({ error: "Guild admins cannot apply to their own guild using the admin email." }, 400);
      const { data: qs, error: qError } = await adminDb.from("sq_guild_questions").select("question_no,correct_option").eq("guild_id", guildId).order("question_no");
      if (qError) throw qError;
      if (!qs || qs.length !== 20) return json({ error: "Entrance test unavailable." }, 404);
      const score = qs.reduce((sum: number, q: any, i: number) => sum + (Number(answers[i]) === q.correct_option ? 1 : 0), 0);
      const { data: application, error: insertError } = await adminDb.from("sq_guild_applications").upsert({
        guild_id: guildId, applicant_id: user.id, applicant_name: applicantName, applicant_email: applicantEmail,
        answers, score, status: "pending", submitted_at: new Date().toISOString(), reviewed_at: null
      }, { onConflict: "guild_id,applicant_id" }).select("id,score,status,submitted_at").single();
      if (insertError) throw insertError;

      // Create one-time review tokens; only token hashes are stored in the database.
      const acceptToken = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
      const rejectToken = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, "0")).join("");
      const tokenInsert = await adminDb.from("sq_guild_review_tokens").insert([
        { application_id: application.id, token_hash: await sha256(acceptToken), decision: "accepted", expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
        { application_id: application.id, token_hash: await sha256(rejectToken), decision: "rejected", expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString() }
      ]);
      if (tokenInsert.error) throw tokenInsert.error;
      const siteUrl = env("SITE_URL").replace(/\/$/, "");
      const resendKey = env("RESEND_API_KEY");
      const fromEmail = env("GUILD_FROM_EMAIL");
      const acceptUrl = siteUrl + "/guild-review.html?token=" + acceptToken;
      const rejectUrl = siteUrl + "/guild-review.html?token=" + rejectToken;
      const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;color:#171b35"><h2>StudyQuest Guild application</h2><p><b>Guild:</b> ${escapeHtml(guild.name)}</p><p><b>Applicant:</b> ${escapeHtml(applicantName)}</p><p><b>Applicant email:</b> ${escapeHtml(applicantEmail)}</p><p><b>Entrance score:</b> ${score}/20</p><p>These review links expire in 7 days and can only be used once.</p><p><a href="${acceptUrl}" style="background:#15803d;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Accept applicant</a> &nbsp; <a href="${rejectUrl}" style="background:#b91c1c;color:white;padding:12px 18px;border-radius:8px;text-decoration:none">Reject applicant</a></p><p>If you did not expect this message, ignore it.</p></div>`;
      const mailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + resendKey, "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromEmail, to: [guild.admin_email], subject: "StudyQuest: " + guild.name + " guild application (" + score + "/20)", html: emailHtml })
      });
      if (!mailResponse.ok) {
        const detail = await mailResponse.text();
        console.error("Resend email failure:", detail);
        return json({ error: "Your test was scored and saved, but the notification email could not be sent. Contact the site administrator." }, 502);
      }
      return json({ application: { id: application.id, score, status: "pending" }, message: "Application submitted. The guild admin has been emailed your score." });
    }

    if (action === "myApplications") {
      const { data, error } = await adminDb.from("sq_guild_applications")
        .select("id,guild_id,applicant_id,applicant_name,applicant_email,score,status,submitted_at,reviewed_at,sq_guilds(name)")
        .or("applicant_id.eq." + user.id + ",guild_id.in.(" + (await adminDb.from("sq_guilds").select("id").eq("admin_id", user.id)).data?.map((g: any) => g.id).join(",") + ")");
      if (error) throw error;
      return json({ applications: data || [] });
    }
    return json({ error: "Unknown action." }, 400);
  } catch (error) {
    console.error("guild-email function error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
