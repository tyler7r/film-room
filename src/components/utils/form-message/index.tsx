import { Alert } from "@mui/material";
import { type MessageType } from "~/utils/types";

type FormMessageType = {
  message: MessageType;
};

const FormMessage = ({ message }: FormMessageType) => {
  const { text, status } = message;
  return text ? <Alert severity={status}>{text}</Alert> : null;
};

export default FormMessage;
