import type { EmailNotificationType } from "./types";

const sendEmail = async (data: EmailNotificationType) => {
  const apiEndpoint = "/api/email";

  const res = fetch(apiEndpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((res) => res.json())
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });

  return await res;
};

export default sendEmail;
