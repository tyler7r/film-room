import { supabase } from "~/utils/supabase";

// --- Type Definitions for Mention/Team Functionality ---

/** Defines the structure for a user who can be mentioned or returned from the API. */
export type MentionUser = {
  id: string;
  name: string;
};

/** Defines the structure for inserting a notification into the 'notifications' table. */
type NotificationPayload = {
  recipient_id: string;
  sender_id: string;
  entity_id: string;
  entity_type: "comment" | "reply" | string;
  message: string;
  is_read: boolean;
};

// Define the shape of the data needed for the email recipient
type RecipientProfile = {
  id: string;
  name: string;
  email: string;
};

// Define the minimal payload to send to the NEW email API
type MentionEmailApiPayload = {
  title: string;
  recipient: { id: string; email: string; name: string };
  senderId: string;
  entityId: string;
  entityType: "comment" | "reply";
};

// --- Core Functions ---

/**
 * Sends notifications to all mentioned users and triggers email notifications.
 * @param senderId - The ID of the user who made the comment.
 * @param recipientIds - Array of user IDs to notify.
 * @param entityId - The ID of the newly created comment/reply.
 * @param entityType - The type of entity ('comment' or 'reply').
 */
export const sendMentionNotifications = async (
  senderId: string,
  recipientIds: string[],
  entityId: string,
  entityType: "comment" | "reply",
): Promise<void> => {
  if (!recipientIds || recipientIds.length === 0) {
    return;
  }

  // 1. Prepare Recipients and DB Insert Payload
  const uniqueRecipients: string[] = [...new Set(recipientIds)].filter(
    (id) => id !== senderId,
  );

  const notifications: NotificationPayload[] = uniqueRecipients.map(
    (recipientId): NotificationPayload => ({
      recipient_id: recipientId,
      sender_id: senderId,
      entity_id: entityId,
      entity_type: entityType,
      message: `mentioned you in a ${entityType}`,
      is_read: false,
    }),
  );

  if (notifications.length === 0) {
    return;
  }

  // 2. Insert Notifications into Database
  const { error: dbError } = await supabase
    .from("notifications")
    .insert(notifications);

  if (dbError) {
    console.error("Error sending mention notifications:", dbError);
    return; // Stop if DB insert failed
  }

  // 3. Fetch Email Details for Recipients
  const { data: recipientProfiles, error: fetchError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .in("id", uniqueRecipients)
    .returns<RecipientProfile[]>();

  if (fetchError ?? (!recipientProfiles || recipientProfiles.length === 0)) {
    console.warn(
      "Could not fetch recipient profiles for email, skipping email step.",
      fetchError,
    );
    return;
  }

  // 4. Send Email to each Recipient using the NEW API endpoint
  const MENTION_EMAIL_API_URL = "/api/send-mention-email"; // New dedicated API endpoint

  for (const recipient of recipientProfiles) {
    if (!recipient.email) {
      console.warn(
        `Skipping email for user ${recipient.id}: Email address missing.`,
      );
      continue;
    }

    const emailPayload: MentionEmailApiPayload = {
      title: `You were mentioned in a ${entityType}`,
      recipient: {
        id: recipient.id,
        email: recipient.email,
        name: recipient.name,
      },
      senderId: senderId,
      entityId: entityId,
      entityType: entityType,
    };

    // Kick off the email process asynchronously (non-blocking)
    void fetch(MENTION_EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    })
      .then((response) => {
        if (!response.ok) {
          void response.json().then((result) => {
            console.error(
              `Mention Email API failed for user ${recipient.id}. Status: ${response.status}`,
              result,
            );
          });
        }
      })
      .catch((e) => {
        console.error(
          `Failed to connect to Mention Email API for user ${recipient.id}:`,
          e,
        );
      });
  }
};
/**
 * Fetches all verified members (profiles) associated with a given team.
 * This uses the 'affiliations' table to filter.
 * @param teamId - The ID of the current team.
 * @returns A promise resolving to an array of MentionUser objects.
 */
export const fetchTeamMembers = async (
  teamId: string | null,
): Promise<MentionUser[]> => {
  if (!teamId) return [];

  // Define the expected structure from the Supabase query (selects user_id from affiliations
  // and joins to profiles, selecting id and name)
  type SupabaseAffiliation = {
    user_id: string;
    profiles: {
      id: string;
      name: string;
    } | null;
  };

  // Use a join query to get profiles of users who are verified members of the team.
  const { data, error } = await supabase
    .from("affiliations")
    .select<string, SupabaseAffiliation>( // Explicitly type the result set
      `
      user_id,
      profiles (
        id,
        name
      )
    `,
    )
    .eq("team_id", teamId)
    .eq("verified", true); // Only show verified members for tagging

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }

  // Flatten the response into the desired MentionUser format
  const members: MentionUser[] =
    data?.map(
      (aff): MentionUser => ({
        id: aff.profiles?.id ?? "",
        name: aff.profiles?.name ?? "",
      }),
    ) || [];

  // Filter out any profiles that might have a null or empty name/id
  return members.filter((member) => member.id && member.name);
};
