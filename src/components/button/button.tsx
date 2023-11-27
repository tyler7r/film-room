import { Button as Btn } from "@mui/material";

type ButtonProps = {
  variant: "text" | "contained" | "outlined";
  size: "small" | "medium" | "large";
  label: string;
  disabled: boolean;
};

export const Button = ({
  variant,
  size,
  label,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <Btn
      variant={variant}
      disabled={disabled}
      size={size}
      // className={`${styles[primary ? "primary" : "secondary"]} ${styles[size]}`}
      {...props}
    >
      {label}
    </Btn>
  );
};
