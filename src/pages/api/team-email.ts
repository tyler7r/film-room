import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import RequestNotificationEmail from "~/components/email/request";
import DecisionNotificationEmail from "~/components/email/request-decision";
import type { TeamEmailNotificationType } from "~/utils/types";

// --- SUPABASE SETUP (Service Role Client for RLS bypass) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
// --- END SUPABASE SETUP ---

// Cooldown Period: 1 hour in milliseconds (60 minutes * 60 seconds * 1000 milliseconds)
const NOTIFICATION_COOLDOWN_MS = 3600000;

// Define a type for the profile data we expect back from Supabase
type ProfileData = {
  last_notified: string | null;
};

interface ExtendedNextApiRequest extends NextApiRequest {
  body: TeamEmailNotificationType;
}

/**
 * Handles email sending for team-related notifications (requests, acceptance, rejection).
 * Throttles owner notifications.
 */
export default async function POST(
  request: ExtendedNextApiRequest,
  res: NextApiResponse,
) {
  const data = request.body;
  const recipientId = data.recipient.id;

  // 0. CRITICAL VALIDATION CHECK
  if (!recipientId) {
    console.error("Recipient ID is missing from the payload. Cannot proceed.");
    return res
      .status(400)
      .json({ error: "Recipient ID (data.recipient.id) is required." });
  }

  // Check if this is a notification to the owner (who needs throttling)
  const isOwnerNotification = data.type === "new_request";

  if (isOwnerNotification) {
    // 1. CHECK COOLDOWN PERIOD USING SUPABASE
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("last_notified")
      .eq("id", recipientId)
      .single<ProfileData>();

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
  }

  // 2. Initialize SES Client
  const sesClient = new SESClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // 3. Generate Email HTML content based on notification type
  let emailHtml: string | undefined;

  if (data.type === "new_request") {
    // Owner Notification
    // We assume data.requests.length is > 0 here
    emailHtml = await render(
      RequestNotificationEmail({
        team: data.team,
        requestCount: data.requestCount,
        latestRequester: data.latestRequester,
      }),
    );
  } else if (data.type === "acceptance" || data.type === "rejection") {
    // Player Decision Notification
    emailHtml = await render(
      DecisionNotificationEmail({
        team: data.team,
        player: data.player,
        isAccepted: data.type === "acceptance",
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

  // 4. Construct SES SendEmailCommand Input
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

  // 5. Send Email via SES AND update last_notified timestamp (if owner notification)
  try {
    const response = await sesClient.send(command);

    // --- POST-SEND ACTION: Update last_notified (ONLY for owner notifications) ---
    if (isOwnerNotification) {
      try {
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
          console.error(
            `Supabase update FAILED for owner ${recipientId}. Error: ${updateError.message}`,
            status,
          );
        } else if (rowsAffected === 0) {
          console.error(
            `Supabase update FAILED: 0 rows updated for ID ${recipientId}. Check if ID exists or is correctly formatted (UUID).`,
          );
        }
      } catch (updateException) {
        console.error(
          `CRITICAL: Unhandled exception during Supabase update for owner ${recipientId}:`,
          updateException,
        );
      }
    }
    // --- END POST-SEND ACTION ---

    return res.status(200).json({
      message: "Team email sent successfully",
      messageId: response.MessageId,
      throttled: false,
    });
  } catch (err) {
    console.error("SES Team email send error:", err);

    return res.status(500).json({
      error: "Failed to send team email via SES",
      details: (err as Error).message || "Unknown error",
    });
  }
}
