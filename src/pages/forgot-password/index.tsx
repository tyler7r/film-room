import { Button, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { validateEmail } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { MessageType } from "~/utils/types";

const ForgotPassword = () => {
  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [email, setEmail] = useState<string>("");
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  useEffect(() => {
    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      setIsValidForm(false);
    } else {
      setIsValidForm(true);
    }
  }, [email]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidForm(false);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage({
        text: `${error.message}. Try again.`,
        status: "error",
      });
      setIsValidForm(true);
    }
    if (data) {
      setMessage({
        text: `Reset email sent to ${email}. Make sure to check spam.`,
        status: "success",
      });
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <PageTitle size="x-large" title="Forgot Password" />
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 flex-col items-center justify-center gap-4 text-center"
      >
        <TextField
          className="w-full md:w-4/5 lg:w-3/5"
          name="email"
          autoComplete="email"
          required
          id="email"
          label="Email"
          type="email"
          autoFocus
          onChange={handleInput}
          value={email}
        />
        <FormMessage message={message} />
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={!isValidForm}
          sx={{ fontSize: "24px", lineHeight: "32px" }}
        >
          Send Reset Email
        </Button>
      </form>
      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        <div className="text-xl font-light tracking-tight">
          Need to make an account?
        </div>
        <Button
          variant="outlined"
          size="large"
          onClick={() => router.push("/signup")}
          sx={{ fontSize: "18px", lineHeight: "28px", fontWeight: "300" }}
        >
          Signup
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
