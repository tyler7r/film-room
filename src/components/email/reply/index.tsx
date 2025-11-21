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
  CommentType,
  CondensedVideoType,
  EmailAuthorType,
  EmailPlayType,
  PlayType,
  ReplyType,
  VideoType,
} from "~/utils/types";

type EmailProps = {
  author: EmailAuthorType;
  video: VideoType | CondensedVideoType;
  reply: ReplyType;
  comment: CommentType;
  play: PlayType | EmailPlayType;
  // NEW: Number of other unread notifications
  unreadNotificationCount: number;
};

const ReplyEmailTemplate = ({
  author,
  reply,
  comment,
  video,
  play,
  unreadNotificationCount, // <-- Destructure the new prop
}: EmailProps) => {
  const replyLink = `https://www.inside-break.com/play/${comment.play_id}?comment=${comment.id}`;
  const homepageLink = `https://www.inside-break.com/`;

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
              New Reply to Your Comment
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">
              **{author.name}** just replied to your comment on the play "
              {play.title}" (from video: *{video.title}*).
            </Text>

            {/* Original Comment Section */}
            <Section className="my-[10px] border-l-2 border-gray-300 bg-gray-50 p-3">
              <Text className="m-0 text-[10px] font-bold uppercase text-[#666666]">
                Your Original Comment:
              </Text>
              <Text className="m-0 text-[14px] italic leading-[20px] text-black">
                "{comment.comment}"
              </Text>
            </Section>

            {/* New Reply Section */}
            <Section className="my-[10px] border-l-4 border-purple-500 bg-purple-50 p-3">
              <Text className="m-0 text-[10px] font-bold uppercase text-purple-700">
                {author.name}'s Reply:
              </Text>
              <Text className="m-0 text-[14px] italic leading-[20px] text-black">
                "{reply.reply}"
              </Text>
            </Section>

            <Section className="my-[30px] text-center">
              <Button
                className="rounded bg-[#000000] p-2 text-center text-[12px] font-semibold text-white no-underline"
                href={replyLink}
              >
                View Conversation
              </Button>
            </Section>

            {unreadNotificationCount > 0 && (
              <Section className="mt-[15px] rounded bg-yellow-100 p-3">
                <Text className="m-0 text-[14px] font-semibold text-yellow-800">
                  🔔 {otherNotificationsText} Visit the site to see them all!
                </Text>
                <Button
                  className="rounded bg-[#000000] p-2 text-center text-[10px] font-semibold text-white no-underline"
                  href={homepageLink}
                >
                  Visit Site
                </Button>
              </Section>
            )}

            <Hr className="my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
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

export default ReplyEmailTemplate;
