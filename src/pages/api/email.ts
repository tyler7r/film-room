import { render } from "@react-email/components";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import CommentEmailTemplate from "~/components/email/comment";
import PlayEmailTemplate from "~/components/email/play";
import ReplyEmailTemplate from "~/components/email/reply";
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

  const emailHtml =
    data.reply && data.comment && data.play
      ? await render(
          ReplyEmailTemplate({
            video: data.video,
            reply: data.reply,
            author: data.author,
            play: data.play,
            comment: data.comment,
          }),
        )
      : data.comment && data.play
        ? await render(
            CommentEmailTemplate({
              video: data.video,
              comment: data.comment,
              author: data.author,
              play: data.play,
            }),
          )
        : data.play &&
          (await render(
            PlayEmailTemplate({
              video: data.video,
              play: data.play,
              author: data.author,
            }),
          ));

  const mailOptions: Mail.Options = {
    from: process.env.MY_EMAIL!,
    to: data.recipient.email!,
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
