import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, IconButton, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import PageTitle from "~/components/page-title";
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
    <div className="flex w-full flex-col items-center justify-center gap-8 p-4 text-center">
      <PageTitle size="x-large" title="Login" />
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
          value={formData.email}
        />
        <TextField
          className="w-full md:w-4/5 lg:w-3/5"
          name="password"
          autoComplete="email"
          required
          id="password"
          label="Password"
          type={showPwd ? "text" : "password"}
          onChange={handleInput}
          value={formData.password}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                aria-label="toggle password visibility"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            ),
          }}
        />
        <FormMessage message={message} />
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={!isValidForm}
          sx={{ fontSize: "24px", lineHeight: "32px" }}
        >
          Login
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
      <div className="flex items-center justify-center gap-1">
        <div className="text-lg font-light tracking-tight">
          Forgot your password?
        </div>
        <Button
          variant="text"
          onClick={() => void router.push("/forgot-password")}
          size="large"
        >
          RESET
        </Button>
      </div>
    </div>
  );
};

export default Login;
