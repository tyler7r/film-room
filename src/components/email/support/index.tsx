import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

// Assuming types for team, player, and requestCount
interface SupportEmailProps {
  senderEmail: string;
  title: string;
  content: string;
}

const SupportEmailTemplate = ({
  senderEmail,
  title,
  content,
}: SupportEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto my-[40px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Heading className="text-[18px] font-bold text-black">
              New Support Ticket
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hi Tyler,
            </Text>

            <Text className="text-[14px] leading-[12px] text-black">
              *{senderEmail}* just submitted a new support ticket: {title}
            </Text>

            <Section className="text-center text-[12px] text-black">
              <Text className="text-[14px] font-bold text-black">Message</Text>
              <Text>"{content}"</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default SupportEmailTemplate;
