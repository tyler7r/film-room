import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import type { NextApiRequest, NextApiResponse } from "next";

// --- SUPABASE IMPORTS & SETUP (SERVER-SIDE) ---
import SupportEmailTemplate from "~/components/email/support";

// Define the expected input from the calling utility function
export interface SupportEmailApiPayload {
  title: string; // Subject line
  senderEmail: string;
  content: string; // ID of the comment or reply
}

interface ExtendedNextApiRequest extends NextApiRequest {
  body: SupportEmailApiPayload;
}

interface SupportEmailTemplate {
  senderEmail: string;
  title: string;
  content: string;
}

/**
 * API route to handle sending email notifications specifically for user mentions.
 * Includes a 1-hour cooldown period check against the recipient's profile.
 */
export default async function POST(
  request: ExtendedNextApiRequest,
  res: NextApiResponse,
) {
  const data = request.body;

  if (request.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${request.method} Not Allowed`);
  }

  const templateProps: SupportEmailTemplate = {
    senderEmail: data.senderEmail,
    title: data.title,
    content: data.content,
  };

  let emailHtml: string | undefined;
  try {
    emailHtml = await render(SupportEmailTemplate(templateProps));
  } catch (e) {
    console.error("Error rendering email template:", e);
    return res.status(500).json({ error: "Failed to render email content." });
  }

  // 5. SEND EMAIL VIA SES
  const sesClient = new SESClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const SENDER_EMAIL = process.env.SES_SENDER_EMAIL!;
  const SENDER_NAME = "Inside Break Support";
  const friendlySource = `${SENDER_NAME} <${SENDER_EMAIL}>`;

  const command = new SendEmailCommand({
    Source: friendlySource,
    Destination: { ToAddresses: ["tyler7r@gmail.com"] },
    Message: {
      Subject: { Charset: "UTF-8", Data: data.title },
      Body: { Html: { Charset: "UTF-8", Data: emailHtml } },
    },
  });

  try {
    const response = await sesClient.send(command);

    return res.status(200).json({
      message: "Email sent via SES successfully",
      messageId: response.MessageId,
      throttled: false,
    });
  } catch (err) {
    console.error("SES Email send error:", err);
    return res.status(500).json({
      error: "Failed to send email via SES",
      details: (err as Error).message || "Unknown error",
    });
  }
}
