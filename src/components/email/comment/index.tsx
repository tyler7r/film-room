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
  EmailAuthorType,
  PlayType,
  VideoType,
} from "~/utils/types";

type EmailProps = {
  author: EmailAuthorType;
  play: PlayType;
  video: VideoType;
  comment: CommentType;
  // NEW: Number of other unread notifications
  unreadNotificationCount: number;
};

const CommentEmailTemplate = ({
  author,
  comment,
  video,
  play,
  unreadNotificationCount,
}: EmailProps) => {
  const commentLink = `https://www.inside-break.com/play/${comment.play_id}?comment=${comment.id}`;
  const homepageLink = `https://inside-break.com/`;

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
              New Comment on Your Play
            </Heading>

            <Text className="text-[14px] leading-[24px] text-black">
              **{author.name}** just left a new comment on your play, "
              {play.title}" (from video: *{video.title}*).
            </Text>

            <Section className="my-[15px] border-l-4 border-purple-500 bg-gray-50 p-3">
              <Text className="m-0 text-[14px] italic leading-[20px] text-black">
                "{comment.comment}"
              </Text>
            </Section>

            {/* NEW: Conditional message about other notifications */}

            <Section className="my-[30px] text-center">
              <Button
                className="rounded bg-[#000000] p-2 text-center text-[12px] font-semibold text-white no-underline"
                href={commentLink}
              >
                Review Comment
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
              This notification was sent because {author.name} commented on a
              play you created.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default CommentEmailTemplate;
