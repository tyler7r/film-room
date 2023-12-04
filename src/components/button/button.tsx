import { Button as Btn } from "@mui/material";

type ButtonProps = {
  variant: "text" | "contained" | "outlined";
  size: "small" | "medium" | "large";
  label: string;
  disabled?: boolean;
  href?: string;
};

export const Button = ({
  variant,
  size,
  label,
  disabled,
  href,
  ...props
}: ButtonProps) => {
  return (
    <Btn
      href={href}
      variant={variant}
      disabled={disabled}
      size={size}
      {...props}
    >
      {label}
    </Btn>
  );
};
