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

// Assuming types for team, player, and requestCount
interface RequestNotificationProps {
  team: { full_name: string; id: string };
  latestRequester: { name: string };
  requestCount: number;
}

const RequestNotificationEmail = ({
  team,
  latestRequester,
  requestCount,
}: RequestNotificationProps) => {
  //   const previewText = `New team join requests for ${team.full_name}`;
  const isBatched = requestCount > 1;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-[40px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="text-[18px] font-bold text-black">
              New Join Request{isBatched ? "s" : ""}
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello Team Owner,
            </Text>

            {isBatched ? (
              <Text className="text-[14px] leading-[24px] text-black">
                **{latestRequester.name}** just submitted a request to join{" "}
                {team.full_name}. You currently have **{requestCount}** pending
                requests that require your attention.
              </Text>
            ) : (
              <Text className="text-[14px] leading-[24px] text-black">
                **{latestRequester.name}** just submitted a request to join{" "}
                {team.full_name}.
              </Text>
            )}

            <Section className="my-[30px] text-center">
              <Button
                className="rounded bg-[#000000] p-2 text-center text-[12px] font-semibold text-white no-underline"
                href={`https://www.inside-break.com/team-hub/${team.id}`}
              >
                Review Requests
              </Button>
            </Section>

            <Hr className="my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              This notification was sent to you because you are listed as the
              owner of {team.full_name}.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default RequestNotificationEmail;
