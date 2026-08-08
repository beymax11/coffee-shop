import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const DEFAULT_SENDER =
  process.env.RESEND_FROM ||
  (process.env.SMTP_USER
    ? `"Antonioni Grounds" <${process.env.SMTP_USER}>`
    : "Antonioni Grounds <onboarding@resend.dev>");

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  includeStandardAttachments?: boolean;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_SENDER,
  includeStandardAttachments = true,
}: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  console.log("[Resend] Attempting to send email...");
  console.log("[Resend] From:", from);
  console.log("[Resend] To:", to);
  console.log("[Resend] API Key Present:", !!apiKey);

  if (!apiKey) {
    console.error("[Resend Error] RESEND_API_KEY is not configured in environment variables.");
    return { success: false, error: "RESEND_API_KEY missing" };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];

    const attachments: Array<{ filename: string; content: Buffer }> = [];

    const client = new Resend(apiKey);

    const response = await client.emails.send({
      from,
      to: recipients,
      subject,
      html,
      text,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log("[Resend Response]", JSON.stringify(response, null, 2));

    if (response.error) {
      console.error("[Resend API Error]:", response.error);
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  } catch (err) {
    console.error("[Resend Exception]:", err);
    return { success: false, error: String(err) };
  }
}
