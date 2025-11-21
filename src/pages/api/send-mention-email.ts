import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/components";
import type { NextApiRequest, NextApiResponse } from "next";
import MentionEmailTemplate, {
  type MentionEmailContent,
} from "~/components/email/mention";
import type {
  CommentType,
  PlayType,
  ReplyType,
  UserType,
  VideoType,
} from "~/utils/types";

// --- SUPABASE IMPORTS & SETUP (SERVER-SIDE) ---
import { createClient } from "@supabase/supabase-js";

// Define a type for the profile data we expect back from Supabase
type ProfileData = {
  last_notified: string | null;
  email: string;
  name: string;
};

// Define the type for the dynamic data needed for a mention email
type MentionContextData = {
  comment?: CommentType | null;
  reply?: ReplyType | null;
  play?: PlayType | null;
  video?: VideoType | null;
  senderProfile?: UserType | null;
};

// Define the expected input from the calling utility function
interface MentionEmailApiPayload {
  title: string; // Subject line
  recipient: { id: string; email: string; name: string };
  senderId: string;
  entityId: string; // ID of the comment or reply
  entityType: "comment" | "reply";
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
// --- END SUPABASE SETUP ---

// Cooldown Period: 1 hour in milliseconds
const NOTIFICATION_COOLDOWN_MS = 3600000;

interface ExtendedNextApiRequest extends NextApiRequest {
  body: MentionEmailApiPayload;
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
  const recipientId = data.recipient.id;

  if (request.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${request.method} Not Allowed`);
  }

  // 1. CHECK COOLDOWN PERIOD
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("last_notified, email, name")
    .eq("id", recipientId)
    .single<ProfileData>();

  if (profileError && profileError.code !== "PGRST116") {
    console.error(
      "Supabase error fetching profile for cooldown check:",
      profileError,
    );
    return res.status(500).json({
      error: "Failed to retrieve recipient profile for cooldown check.",
    });
  }

  const recipientEmail = data.recipient.email || profile?.email;
  const recipientName = data.recipient.name || profile?.name;

  if (!recipientEmail || !recipientName) {
    return res
      .status(400)
      .json({ error: "Recipient email or name is missing." });
  }

  const lastNotified = profile?.last_notified
    ? new Date(profile.last_notified).getTime()
    : 0;

  const timeSinceLastNotification = new Date().getTime() - lastNotified;

  if (timeSinceLastNotification < NOTIFICATION_COOLDOWN_MS) {
    return res.status(200).json({
      message: "Email throttled successfully due to 1-hour cooldown.",
      throttled: true,
    });
  }

  // 2. FETCH UNREAD NOTIFICATION COUNT
  let unreadNotificationCount = 0;
  try {
    const { count, error: countError } = await supabase
      .from("user_notifications_view")
      .select("*", { count: "exact" })
      .eq("receiver_id", recipientId)
      .neq("actor_id", recipientId)
      .eq("viewed", false);

    if (!countError && count !== null) {
      // The count includes the current notification that triggered the email.
      unreadNotificationCount = Math.max(0, count - 1);
    }
  } catch (e) {
    console.error("Exception during unread notification count fetch:", e);
  }

  // 3. FETCH CONTEXTUAL DATA FOR MENTION EMAIL
  const context: MentionContextData = {};
  let relatedPlayId: string | undefined;

  // A. Fetch the source entity (Comment or Reply)
  if (data.entityType === "comment") {
    const { data: commentData } = await supabase
      .from("comments")
      .select("*")
      .eq("id", data.entityId)
      .single<CommentType>();

    if (commentData) {
      context.comment = commentData;
      relatedPlayId = commentData.play_id;
    }
  } else if (data.entityType === "reply") {
    const { data: replyData } = await supabase
      .from("replies")
      .select("id, reply, comment_id")
      .eq("id", data.entityId)
      .single<ReplyType>();

    if (replyData) {
      context.reply = replyData;

      // Fetch the related comment to find the play_id
      if (replyData.comment_id) {
        const { data: parentCommentData } = await supabase
          .from("comments")
          .select("play_id")
          .eq("id", replyData.comment_id)
          .single<{ play_id: string }>();
        relatedPlayId = parentCommentData?.play_id;
      }
    }
  }

  // B. Fetch Play, Video, and Sender Profile
  if (relatedPlayId) {
    const { data: playData } = await supabase
      .from("plays")
      .select("*")
      .eq("id", relatedPlayId)
      .single<PlayType>();
    context.play = playData;

    if (playData?.video_id) {
      const { data: videoData } = await supabase
        .from("videos")
        .select("*")
        .eq("id", playData.video_id)
        .single<VideoType>();
      context.video = videoData;
    }
  }

  const { data: senderData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.senderId)
    .single<UserType>();
  context.senderProfile = senderData;

  // 4. VALIDATE AND RENDER EMAIL
  if (
    !context.play ||
    !context.video ||
    !context.senderProfile ||
    (!context.comment && !context.reply)
  ) {
    console.error("Missing context to generate mention email. Aborting.", {
      data,
      context,
    });
    return res
      .status(500)
      .json({ error: "Failed to gather complete context for mention email." });
  }

  const templateProps: MentionEmailContent = {
    unreadNotificationCount,
    author: {
      name: context.senderProfile.name,
      email: context.senderProfile.email!,
    },
    recipientName: recipientName,
    entityType: data.entityType,
    play: context.play,
    video: context.video,
    sourceComment: context.comment as CommentType | null,
    sourceReply: context.reply as ReplyType | null,
  };

  let emailHtml: string | undefined;
  try {
    emailHtml = await render(MentionEmailTemplate(templateProps));
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
  const SENDER_NAME = "Inside Break";
  const friendlySource = `${SENDER_NAME} <${SENDER_EMAIL}>`;

  const command = new SendEmailCommand({
    Source: friendlySource,
    Destination: { ToAddresses: [recipientEmail] },
    Message: {
      Subject: { Charset: "UTF-8", Data: data.title },
      Body: { Html: { Charset: "UTF-8", Data: emailHtml } },
    },
  });

  try {
    const response = await sesClient.send(command);

    // POST-SEND ACTION: Update last_notified timestamp (Service Role Client used for Write)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ last_notified: new Date().toISOString() })
      .eq("id", recipientId);

    if (updateError) {
      console.error(
        `Supabase update FAILED for user ${recipientId}. Error: ${updateError.message}`,
      );
    }

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
