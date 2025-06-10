import { Typography } from "@mui/material";

type EmptyMessageProps = {
  message: string;
};

const EmptyMessage = ({ message }: EmptyMessageProps) => {
  return (
    <Typography
      variant="caption"
      sx={{
        display: "block",
        color: "text.disabled",
        my: 1,
      }}
    >
      — No {message} found —
    </Typography>
  );
};

export default EmptyMessage;
