import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { validateEmail } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

const Login = () => {
  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [showPwd, setShowPwd] = useState<boolean>(false);

  useEffect(() => {
    const isValidEmail = validateEmail(formData.email);
    if (!isValidEmail || formData.password === "") {
      setIsValidForm(false);
    } else {
      setIsValidForm(true);
    }
  }, [formData]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidForm(false);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setMessage({
        text: `${error.message}. Try again.`,
        status: "error",
      });
      setIsValidForm(true);
    } else {
      setMessage({
        text: `Logged in!`,
        status: "success",
      });
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <Typography variant="h1" fontSize={72}>
        Log In
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
          onChange={handleInput}
          value={formData.email}
        />
        <TextField
          className="w-full"
          name="password"
          autoComplete="email"
          required
          id="password"
          label="Password"
          type={showPwd ? "text" : "password"}
          onChange={handleInput}
          value={formData.password}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showPwd}
              onChange={() => setShowPwd(!showPwd)}
              size="medium"
            />
          }
          labelPlacement="end"
          label="Show Password?"
        />
        <FormMessage message={message} />
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={!isValidForm}
          className="text-xl"
        >
          Login
        </Button>
      </form>
      <div className="mt-2 flex flex-col items-center justify-center gap-2">
        <div className="">Need to make an account?</div>
        <Button
          variant="outlined"
          size="medium"
          onClick={() => router.push("/signup")}
          className="lg:text-lg"
        >
          Signup
        </Button>
      </div>
    </div>
  );
};

export default Login;
