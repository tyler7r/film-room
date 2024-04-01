import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, IconButton, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/form-message";
import { useAuthContext } from "~/contexts/auth";
import { validatePwdMatch } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

type DetailsType = {
  name: string;
  password: string;
  confirmPwd: string;
};

const SignupDetails = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [data, setData] = useState<DetailsType>({
    name: "",
    password: "",
    confirmPwd: "",
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(true);
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState<boolean>(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const updateUserData = async () => {
    const { error } = await supabase.auth.updateUser({
      data: {
        name: `${data.name}`,
      },
    });
    if (error) {
      setMessage({
        text: `There was an error updating your user data. ${error.message}`,
        status: "error",
      });
      setIsValidForm(true);
      return "error";
    } else return true;
  };

  const updateUserName = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ name: data.name })
      .eq("id", `${user.userId}`);
    if (error) {
      setMessage({
        status: "error",
        text: `There was a problem adding your details. ${error.message}`,
      });
      setIsValidForm(true);
      return "error";
    } else return true;
  };

  const updatePassword = async () => {
    const { error } = await supabase.auth.updateUser({
      password: `${data.password}`,
    });
    if (error) {
      setMessage({
        status: "error",
        text: `There was an issue updating your password. ${error.message}`,
      });
      setIsValidForm(true);
      return "error";
    } else return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidForm(false);

    const ensureUpdate = await updateUserData();
    const checkValidName = await updateUserName();
    const checkValidPassword = await updatePassword();

    if (ensureUpdate && checkValidName && checkValidPassword) {
      setMessage({
        status: "success",
        text: "Successfully updated your profile!",
      });
      setTimeout(() => {
        router.push("/team-select");
      }, 1000);
    }
  };

  useEffect(() => {
    // Update form validity and form message as necessary
    const { name, password, confirmPwd } = data;
    const pwdMatch = validatePwdMatch(password, confirmPwd);

    if (name === "") {
      setMessage({ status: "error", text: "Please enter your name!" });
      setIsValidForm(false);
    } else if (password === "") {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(false);
    } else if (!pwdMatch) {
      setMessage({
        status: "error",
        text: "Please ensure that the passwords match!",
      });
      setIsValidForm(false);
    } else {
      setMessage({ status: "error", text: undefined });
      setIsValidForm(true);
    }
  }, [data]);

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <Typography variant="h1" fontSize={54}>
        Finish Account
      </Typography>
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 max-w-screen-md flex-col items-center justify-center gap-6 text-center"
      >
        <TextField
          className="w-full"
          name="name"
          autoComplete="full-name"
          required
          id="full-name"
          label="Name"
          type="text"
          autoFocus
          onChange={handleInput}
          value={data.name}
        />
        <TextField
          className="w-full"
          name="password"
          autoComplete="password"
          required
          id="password"
          label="Password"
          type={showPwd ? "text" : "password"}
          autoFocus
          onChange={handleInput}
          value={data.password}
          InputProps={{
            endAdornment: (
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            ),
          }}
        />
        <TextField
          className="w-full"
          name="confirmPwd"
          autoComplete="confirmPwd"
          required
          id="confirmPwd"
          label="Confirm Password"
          type={showConfirmPwd ? "text" : "password"}
          autoFocus
          onChange={handleInput}
          value={data.confirmPwd}
          InputProps={{
            endAdornment: (
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              >
                {showConfirmPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
          endIcon={<KeyboardDoubleArrowRightIcon />}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};

export default SignupDetails;
