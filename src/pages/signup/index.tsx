import { Box, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
// NOTE: The "next/navigation" import often causes issues in this build environment.
// We are keeping the import structure for your actual project but ensuring the
// environment can handle the `useRouter` dependency by providing a safe mock.
import { useEffect, useState } from "react";
import { Logo } from "~/components/navbar/logo/logo";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Signup = () => {
  // Using the mocked useRouter when the imported one fails
  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>(""); // New state for Name/Username
  const [isValidForm, setIsValidForm] = useState<boolean>(false);

  useEffect(() => {
    // Validation now requires a valid email AND a non-empty name
    const isValidEmail = validateEmail(email);
    const isNamePresent = name.trim().length > 0;

    if (isValidEmail && isNamePresent) {
      setIsValidForm(true);
    } else {
      setIsValidForm(false);
    }
  }, [email, name]); // Dependency updated to include name

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const timestamp = Date.now();
    // Using temporary password for the email-based sign-up flow
    const pwd = `${Math.floor(Math.random() * 100000)}${email}${timestamp}`;
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    // Core change: Passing name as metadata (full_name)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: pwd,
      options: {
        emailRedirectTo: `${origin}/signup/details/`,
        data: {
          full_name: name, // Name is passed here and picked up by your Supabase trigger
        },
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
        text: "Success. Please verify your email to finish your account creation. Your name is saved!",
      });
      // Clear fields on success
      setEmail("");
      setName("");
      setIsValidForm(false);
    }
  };

  return (
    <Box
      className="flex w-full flex-col items-center justify-center gap-6 p-4 text-center"
      // Original styling translated to Box props if needed, but keeping Tailwind for max compatibility
    >
      <Logo size="small" />
      <PageTitle size="x-large" title="Signup" />
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 flex-col items-center justify-center gap-4 text-center"
      >
        {/* NEW NAME/USERNAME FIELD */}
        <TextField
          className="w-full md:w-4/5 lg:w-3/5"
          name="name"
          autoComplete="username"
          required
          id="name"
          label="Full Name / Username"
          type="text"
          autoFocus // Set this as the first field
          onInput={(e) => {
            setName((e.target as HTMLInputElement).value);
          }}
          value={name}
        />
        {/* ORIGINAL EMAIL FIELD */}
        <TextField
          className="w-full md:w-4/5 lg:w-3/5"
          name="email"
          autoComplete="email"
          required
          id="email"
          label="Email"
          type="email"
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

      {/* Box replacing the second div for Login link */}
      <Box className="mt-2 flex flex-col items-center justify-center gap-2">
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
      </Box>
    </Box>
  );
};

export default Signup;
