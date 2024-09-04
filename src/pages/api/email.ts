import { render } from "@react-email/components";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import EmailTemplate from "~/components/email";
import type { EmailNotificationType } from "~/utils/types";
interface ExtendedNextApiRequest extends NextApiRequest {
  body: EmailNotificationType;
}

export default async function POST(
  request: ExtendedNextApiRequest,
  res: NextApiResponse,
) {
  const data = request.body;

  const transport = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.MY_EMAIL!,
      pass: process.env.MY_PWD!,
    },
  });

  const emailHtml = await render(
    EmailTemplate({
      title: data.title,
      video: data.video,
      link: data.link,
      play: data.play,
    }),
  );

  const mailOptions: Mail.Options = {
    from: process.env.MY_EMAIL!,
    to: data.recipient,
    // cc: email, (uncomment this line if you want to send a copy to the sender)
    subject: data.title,
    html: emailHtml,
  };

  const sendMailPromise = () =>
    new Promise<string>((resolve, reject) => {
      transport.sendMail(mailOptions, function (err) {
        if (!err) {
          resolve("Email sent");
        } else {
          reject(err.message);
        }
      });
    });

  try {
    await sendMailPromise().then(() => {
      res.status(200);
      return res.json({ message: "Email sent" });
    });
  } catch (err) {
    res.status(500);
    return res.json({ error: err });
  }
}
