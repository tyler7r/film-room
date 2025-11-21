import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import type { NextApiRequest, NextApiResponse } from "next";
import CommentEmailTemplate from "~/components/email/comment";
import PlayEmailTemplate from "~/components/email/play";
import ReplyEmailTemplate from "~/components/email/reply";
import type { EmailNotificationType } from "~/utils/types";

// --- SUPABASE IMPORTS & SETUP (SERVER-SIDE) ---
// We initialize a client here using the Service Role Key to bypass RLS,
// ensuring the update to 'last_notified' persists from the server.
import { createClient } from "@supabase/supabase-js";

// Define a type for the profile data we expect back
type ProfileData = {
  last_notified: string | null;
};

// Assume these ENV vars are available for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// IMPORTANT: Use the Service Role key for secure, bypass-RLS operations on the server.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
// --- END SUPABASE SETUP ---

// Cooldown Period: 1 hour in milliseconds (60 minutes * 60 seconds * 1000 milliseconds)
const NOTIFICATION_COOLDOWN_MS = 3600000;

interface ExtendedNextApiRequest extends NextApiRequest {
  body: EmailNotificationType;
}

/**
 * Handles email sending using Amazon Simple Email Service (SES).
 * Includes a 1-hour cooldown period check against the recipient's "last_notified" profile field.
 */
export default async function POST(
  request: ExtendedNextApiRequest,
  res: NextApiResponse,
) {
  const data = request.body;
  const recipientId = data.recipient.id;

  // 0. CRITICAL VALIDATION CHECK
  if (!recipientId) {
    console.error(
      "Recipient ID is missing from the payload. Cannot perform cooldown check or update profile.",
    );
    return res
      .status(400)
      .json({ error: "Recipient ID (data.recipient.id) is required." });
  }

  // 1. CHECK COOLDOWN PERIOD USING SUPABASE (Service Role Client used for Read)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("last_notified")
    .eq("id", recipientId)
    .single<ProfileData>(); // Use the ProfileData type for safety

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 means 'No rows found'
    console.error(
      "Supabase error fetching profile for cooldown check:",
      profileError,
    );
    return res.status(500).json({
      error: "Failed to retrieve recipient profile for cooldown check.",
    });
  }

  // Type safe date conversion using explicit null check
  const lastNotified = profile?.last_notified
    ? new Date(profile.last_notified).getTime()
    : 0;

  const currentTime = new Date().getTime();
  const timeSinceLastNotification = currentTime - lastNotified;

  if (timeSinceLastNotification < NOTIFICATION_COOLDOWN_MS) {
    // Cooldown is active. Skip email but return success to the caller.
    return res.status(200).json({
      message: "Email throttled successfully due to 1-hour cooldown.",
      throttled: true,
    });
  }

  // 2. FETCH UNREAD NOTIFICATION COUNT
  let unreadNotificationCount = 0;
  try {
    // Assuming 'notifications' table with 'recipient_id' and 'is_read' columns
    const { count, error: countError } = await supabase
      .from("user_notifications_view")
      .select("*", { count: "exact" }) // Select count for performance
      .eq("receiver_id", recipientId)
      .neq("actor_id", recipientId)
      .eq("viewed", false);

    if (countError) {
      console.error(
        "Supabase error fetching unread notification count:",
        countError,
      );
    } else {
      // The count includes the current notification that triggered the email.
      // We subtract 1 to only report on *other* unread notifications.
      unreadNotificationCount = Math.max(0, count! - 1);
    }
  } catch (e) {
    console.error("Exception during unread notification count fetch:", e);
  }

  // 3. Initialize SES Client
  const sesClient = new SESClient({
    region: process.env.AWS_REGION!, // e.g., 'us-east-1'
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // 4. Generate Email HTML content based on notification type
  let emailHtml: string | undefined;

  // Common props including the new count
  const commonEmailProps = {
    video: data.video,
    author: data.author,
    unreadNotificationCount,
  };

  if (data.reply && data.comment && data.play) {
    emailHtml = await render(
      ReplyEmailTemplate({
        ...commonEmailProps,
        reply: data.reply,
        play: data.play,
        comment: data.comment,
      }),
    );
  } else if (data.comment && data.play) {
    emailHtml = await render(
      CommentEmailTemplate({
        ...commonEmailProps,
        comment: data.comment,
        play: data.play,
      }),
    );
  } else if (data.play) {
    emailHtml = await render(
      PlayEmailTemplate({
        ...commonEmailProps,
        play: data.play,
      }),
    );
  }

  if (!emailHtml) {
    return res
      .status(400)
      .json({ error: "Could not generate valid email content." });
  }

  const SENDER_EMAIL = process.env.SES_SENDER_EMAIL!;
  const SENDER_NAME = "Inside Break"; // Fallback name

  // Format: "Friendly Name" <email@address.com>
  const friendlySource = `${SENDER_NAME} <${SENDER_EMAIL}>`;

  // 5. Construct SES SendEmailCommand Input
  const params = {
    Source: friendlySource,
    Destination: {
      ToAddresses: [data.recipient.email!],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: data.title,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: emailHtml,
        },
      },
    },
  };

  const command = new SendEmailCommand(params);

  // 6. Send Email via SES AND update last_notified timestamp
  try {
    const response = await sesClient.send(command);

    // --- POST-SEND ACTION: Update last_notified with nested try/catch ---
    // Service Role Client used for Write
    try {
      // IMPORTANT: .select("id") is necessary to force the update to commit and return reliable data back.
      const {
        error: updateError,
        data,
        status,
      } = await supabase
        .from("profiles")
        .update({ last_notified: new Date().toISOString() })
        .eq("id", recipientId)
        .select("id");

      const rowsAffected = data?.length ?? 0;

      if (updateError) {
        // Error returned from Supabase call
        console.error(
          `Supabase update FAILED for user ${recipientId}. Error: ${updateError.message}`,
          status,
        );
      } else if (rowsAffected === 0) {
        // No row was updated (ID didn't match anything)
        console.error(
          `Supabase update FAILED: 0 rows updated for ID ${recipientId}. Check if ID exists or is correctly formatted (UUID).`,
        );
      }
    } catch (updateException) {
      // CRITICAL: Catches unhandled runtime exceptions (like network or client issues)
      console.error(
        `CRITICAL: Unhandled exception during Supabase update for user ${recipientId}:`,
        updateException,
      );
    }
    // --- END POST-SEND ACTION ---

    // Return success response
    return res.status(200).json({
      message: "Email sent via SES successfully",
      messageId: response.MessageId,
      throttled: false,
    });
  } catch (err) {
    console.error("SES Email send error:", err);

    // Return detailed error response
    return res.status(500).json({
      error: "Failed to send email via SES",
      details: (err as Error).message || "Unknown error",
    });
  }
}
