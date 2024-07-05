import { colors, useTheme } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { type MessageType } from "~/utils/types";

type FormMessageType = {
  message: MessageType;
};

const FormMessage = ({ message }: FormMessageType) => {
  const { text, status } = message;
  const theme = useTheme();
  const { isDark } = useIsDarkContext();

  const errorStyle = {
    border: `2px solid ${
      isDark ? theme.palette.error.dark : theme.palette.error.light
    }`,
    color: `${theme.palette.error.main}`,
  };

  const successStyle = {
    border: `2px solid ${colors.green[700]}`,
    color: colors.green[700],
  };

  return (
    text && (
      <div
        className="rounded-md p-2 font-bold"
        style={status === "error" ? errorStyle : successStyle}
      >
        {text}
      </div>
    )
  );
};

export default FormMessage;
