import { Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { validateEmail } from "~/utils/helpers";
import { MessageType } from "~/utils/types";

const Signup = () => {
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [email, setEmail] = useState<string>("");
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  // Checks for valid email after every input and updates form message as needed
  useEffect(() => {
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      setMessage({ ...message, text: "Please enter a valid email address!" });
      setIsValidForm(false);
    } else {
      setMessage({ ...message, text: undefined });
      setIsValidForm(true);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <Typography variant="h1" fontSize={72}>
        Sign Up
      </Typography>
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 flex-col items-center justify-center gap-4 text-center"
      >
        <TextField
          className="w-full"
          name="email"
          autoComplete="email"
          required
          id="email"
          label="Email"
          type="email"
          autoFocus
          onInput={(e) => {
            setEmail((e.target as HTMLInputElement).value);
          }}
          value={email}
        />
        <FormMessage message={message} />
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={!isValidForm}
        >
          Signup
        </Button>
      </form>
      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        <div className="">Already have an account?</div>
        <Button variant="outlined" size="small">
          Login
        </Button>
      </div>
    </div>
  );
};

export default Signup;
