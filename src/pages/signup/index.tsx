import { Button, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { validateEmail } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

const Signup = () => {
  const router = useRouter();
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
      setMessage({
        status: "error",
        text: "Please enter a valid email address!",
      });
      setIsValidForm(false);
    } else {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(true);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Create initial random pwd
    const timestamp = Date.now();
    const pwd = `${Math.floor(Math.random() * 100000)}${email}${timestamp}`;

    //Signup in supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: pwd,
      options: {
        emailRedirectTo: "http://localhost:3000/signup/details",
      },
    });
    if (error) {
      setMessage({
        status: "error",
        text: `There was a problem creating the user. ${error.message}`,
      });
    } else if (data.user?.identities?.length === 0) {
      setMessage({
        status: "error",
        text: `User already registered with this email!`,
      });
    } else {
      setMessage({
        status: "success",
        text: "Success. Please verify your email to finish your account creation.",
      });
      setIsValidForm(false);
    }
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
          sx={{ fontSize: "20px", lineHeight: "28px" }}
        >
          Signup
        </Button>
      </form>
      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        <div className="text-xl font-light tracking-tight">
          Already have an account?
        </div>
        <Button
          variant="outlined"
          size="large"
          onClick={() => router.push("/login")}
          sx={{ fontSize: "18px", lineHeight: "28px", fontWeight: "300" }}
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default Signup;
