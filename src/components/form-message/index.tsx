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
    border: `1px solid ${
      isDark ? theme.palette.error.dark : theme.palette.error.light
    }`,
    color: `${theme.palette.error.main}`,
  };

  const successStyle = {
    border: `1px solid ${colors.green[700]}`,
    color: colors.green[700],
  };

  return (
    text && (
      <div
        className="text-md rounded-md p-2 px-3"
        style={status === "error" ? errorStyle : successStyle}
      >
        {text}
      </div>
    )
  );
};

export default FormMessage;
