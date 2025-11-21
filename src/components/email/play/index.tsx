import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import type {
  CondensedVideoType,
  EmailAuthorType,
  EmailPlayType,
  PlayType,
  VideoType,
} from "~/utils/types";

// Note: The EmailProps type definition is updated to include the new prop.
type EmailProps = {
  author: EmailAuthorType;
  video: VideoType | CondensedVideoType;
  play: PlayType | EmailPlayType;
  // NEW: Number of other unread notifications
  unreadNotificationCount: number;
};

const PlayEmailTemplate = ({
  author,
  play,
  video,
  unreadNotificationCount, // <-- Destructure the new prop
}: EmailProps) => {
  const isPrivate = play.private;

  const otherNotificationsText =
    unreadNotificationCount === 1
      ? "You have 1 other notification waiting for you."
      : `You have ${unreadNotificationCount} other notifications waiting for you.`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-[40px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="text-[18px] font-bold text-black">
              New Play Mention
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">
              **{author.name}** just mentioned you in a play titled:
              {play.title}.
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              This play is from the video: *{video.title}*.
            </Text>

            {/* Displaying the note if it exists, otherwise a simple placeholder */}
            {play.note && (
              <Text className="text-[14px] italic leading-[20px] text-black">
                Note: "{play.note}"
              </Text>
            )}

            <Section className="my-[30px] text-center">
              <Button
                className="rounded bg-[#000000] p-2 text-center text-[12px] font-semibold text-white no-underline"
                href={`https://www.inside-break.com/play/${play.id}`}
              >
                View Play in Theatre
              </Button>
            </Section>

            {/* NEW: Conditional message about other notifications */}
            {unreadNotificationCount > 0 && (
              <Section className="mt-[15px] rounded bg-yellow-100 p-3">
                <Text className="m-0 text-[14px] font-semibold text-yellow-800">
                  🔔 {otherNotificationsText} Visit the site to see them all!
                </Text>
                <Button
                  className="rounded bg-[#000000] p-2 text-center text-[10px] font-semibold text-white no-underline"
                  href={`https://www.inside-break.com/`}
                >
                  Visit Site
                </Button>
              </Section>
            )}

            <Hr className="my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              {isPrivate &&
                " Note: This play is set to private and may only be viewable when you are logged in."}{" "}
              You received this email because you have notifications turned on
              for Inside Break. To turn them off navigate to your profile and
              click the settings icon.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PlayEmailTemplate;
