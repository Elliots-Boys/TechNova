import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char] as string));

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Supabase server configuration is missing." }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured." }), {
        status: 503,
        headers: corsHeaders,
      });
    }

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return new Response(JSON.stringify({ error: "You must be signed in." }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData?.user;

    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: "Could not verify the signed-in user." }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const body = await req.json().catch(() => ({}));
    const eventId = Number(body?.event_id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return new Response(JSON.stringify({ error: "A valid event ID is required." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const [{ data: event, error: eventError }, { data: registration, error: registrationError }] =
      await Promise.all([
        admin
          .from("events")
          .select("id,title,event_date,event_time,location,event_type")
          .eq("id", eventId)
          .single(),
        admin
          .from("event_registrations")
          .select("id,created_at")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "The event could not be found." }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (registrationError || !registration) {
      return new Response(JSON.stringify({ error: "No event registration was found for this account." }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const rawName =
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email.split("@")[0] ||
      "TechNova member";

    let formattedDate = String(event.event_date || "");
    try {
      if (event.event_date) {
        formattedDate = new Intl.DateTimeFormat("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Europe/London",
        }).format(new Date(`${event.event_date}T12:00:00Z`));
      }
    } catch {
      // Keep the stored date when formatting is unavailable.
    }

    const formattedTime = event.event_time
      ? String(event.event_time).slice(0, 5)
      : "Time to be confirmed";

    const fromEmail =
      Deno.env.get("RESEND_FROM_EMAIL") ||
      "TechNova <onboarding@resend.dev>";

    const ticketUrl = "https://technova-bmm.pages.dev/pages/tickets.html";

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;background:#0b1422;color:#eaf4ff;padding:32px;border-radius:18px">
        <div style="font-size:13px;font-weight:800;letter-spacing:.12em;color:#32d6ff">TECHNOVA EVENT CONFIRMATION</div>
        <h1 style="margin:12px 0 8px;font-size:30px">You're registered.</h1>
        <p style="color:#aab9ca;line-height:1.6">Hi ${escapeHtml(rawName)}, your place has been confirmed for <strong style="color:#fff">${escapeHtml(event.title)}</strong>.</p>

        <div style="margin:24px 0;background:#101f33;border:1px solid #29415e;border-radius:14px;padding:18px">
          <p style="margin:0 0 9px"><strong>Event:</strong> ${escapeHtml(event.title)}</p>
          <p style="margin:0 0 9px"><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
          <p style="margin:0 0 9px"><strong>Time:</strong> ${escapeHtml(formattedTime)}</p>
          <p style="margin:0 0 9px"><strong>Location:</strong> ${escapeHtml(event.location || "To be confirmed")}</p>
          <p style="margin:0"><strong>Ticket number:</strong> ${escapeHtml(registration.id)}</p>
        </div>

        <p style="color:#aab9ca;line-height:1.6">Your TechNova ticket is available in your account.</p>
        <p style="margin:26px 0">
          <a href="${ticketUrl}" style="display:inline-block;background:#32d6ff;color:#06101d;text-decoration:none;font-weight:800;padding:12px 18px;border-radius:10px">View my ticket</a>
        </p>
        <p style="font-size:12px;color:#7f91a6">This email was sent because this TechNova account registered for an event.</p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: `TechNova registration confirmed: ${event.title}`,
        html,
      }),
    });

    const resendResult = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      console.error("Resend email error:", resendResult);
      return new Response(
        JSON.stringify({
          error:
            resendResult?.message ||
            resendResult?.error ||
            "The confirmation email could not be sent.",
        }),
        { status: 502, headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: resendResult?.id || null,
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Event confirmation email error:", error);
    return new Response(
      JSON.stringify({ error: "The confirmation email could not be sent." }),
      { status: 500, headers: corsHeaders },
    );
  }
});
