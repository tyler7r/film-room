import styles from "./button.module.css";

type ButtonProps = {
  primary: boolean;
  size: "small" | "medium" | "large";
  label: string;
};

export const Button = ({ primary, size, label, ...props }: ButtonProps) => {
  return (
    <button
      className={`${styles[primary ? "primary" : "secondary"]} ${styles[size]}`}
      {...props}
    >
      {label}
    </button>
  );
};
