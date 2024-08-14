import { Button, TextField } from "@mui/material";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "~/components/navbar/logo/logo";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { validateEmail } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      host: context.req.headers.host,
    },
  };
}

const Signup = ({ host }: { host: string }) => {
  useEffect(() => {
    console.log(host);
  }, []);
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
      setIsValidForm(false);
    } else {
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
        emailRedirectTo: `http://${host}/signup/details/`,
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
    <div className="flex w-full flex-col items-center justify-center gap-6 p-4 text-center">
      <Logo size="small" />
      <PageTitle size="x-large" title="Signup" />
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
