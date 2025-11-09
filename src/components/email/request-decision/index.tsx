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

interface DecisionNotificationProps {
  team: { full_name: string; id: string };
  player: { name: string };
  isAccepted: boolean;
}

const DecisionNotificationEmail = ({
  team,
  player,
  isAccepted,
}: DecisionNotificationProps) => {
  const status = isAccepted ? "Accepted" : "Rejected";
  const color = isAccepted ? "bg-green-500" : "bg-red-500";
  const message = isAccepted
    ? `Great news, your request to join ${team.full_name} has been accepted!`
    : `We regret to inform you that your request to join ${team.full_name} has been rejected.`;
  const buttonText = isAccepted ? "View Your Team" : "Browse Teams";
  const buttonLink = isAccepted
    ? `https://www.inside-break.com/team-hub/${team.id}`
    : `https://www.inside-break.com/team-select`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-[40px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="text-[24px] font-normal text-black">
              Team Request {status}
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hello {player.name},
            </Text>

            <Text className="text-[14px] leading-[24px] text-black">
              {message}
            </Text>

            <Section className="my-[30px] text-center">
              <Button
                className={`rounded ${color} p-2 text-center text-[12px] font-semibold text-white no-underline`}
                href={buttonLink}
              >
                {buttonText}
              </Button>
            </Section>

            <Hr className="my-[26px] w-full border border-solid border-[#eaeaea]" />
            <Text className="text-[12px] leading-[24px] text-[#666666]">
              This is an automated notification from the team management system.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DecisionNotificationEmail;
