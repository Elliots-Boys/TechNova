import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const hookSecret = Deno.env
  .get("SEND_SMS_HOOK_SECRET")
  ?.replace(/^v1,whsec_/, "");

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: {
          http_code: 400,
          message: "Only POST requests are allowed.",
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (!hookSecret) {
    console.error("SEND_SMS_HOOK_SECRET is missing.");

    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: "SMS hook secret is not configured.",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    const webhook = new Webhook(hookSecret);

    const { user, sms } = webhook.verify(payload, headers) as {
      user: {
        phone: string;
      };
      sms: {
        otp: string;
      };
    };

    let phone = user?.phone;

if (phone) {
  phone = phone.replace(/\s+/g, '');

  // Convert UK numbers such as 07726834587 → +447726834587
  if (phone.startsWith('07')) {
    phone = '+44' + phone.substring(1);
  }

  // Convert 447726834587 → +447726834587
  if (phone.startsWith('44') && !phone.startsWith('+')) {
    phone = '+' + phone;
  }
}

console.log('Phone being sent to Webex:', phone);
    const otp = sms?.otp;

    if (!phone || !otp) {
      throw new Error("Supabase did not provide a phone number or OTP.");
    }

    const apiKey = Deno.env.get("WEBEX_INTERACT_API_KEY");
    const sender = Deno.env.get("WEBEX_INTERACT_SENDER");

    if (!apiKey || !sender) {
      throw new Error("Webex Interact secrets are not configured.");
    }

    const messageBody =
      `Your TechNova verification code is ${otp}. ` +
      `It expires in 10 minutes.`;

    const smsResponse = await fetch(
      "https://api.webexinteract.com/v1/sms",
      {
        method: "POST",
        headers: {
          "X-AUTH-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message_body: messageBody,
          from: sender,
          to: [
            {
              phone: [phone],
            },
          ],
        }),
      },
    );

    const smsText = await smsResponse.text();

    let smsResult: unknown = null;

    try {
      smsResult = JSON.parse(smsText);
    } catch {
      smsResult = smsText;
    }

    console.log("Webex Interact response:", {
      status: smsResponse.status,
      result: smsResult,
    });

    if (!smsResponse.ok) {
      throw new Error(
        `Webex Interact rejected the SMS request (${smsResponse.status}).`,
      );
    }

    // Supabase Auth expects an empty JSON object for a successful hook.
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Send SMS Hook error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to send verification SMS.";

    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message,
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
});