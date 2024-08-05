import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, IconButton, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { validatePwdMatch } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { MessageType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

type NewPasswordType = {
  password: string;
  confirmPwd: string;
};

const ResetPassword = () => {
  const { colorText } = useIsDarkContext();
  const router = useRouter();

  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [newPassword, setNewPassword] = useState<NewPasswordType>({
    password: "",
    confirmPwd: "",
  });
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState<boolean>(false);

  useEffect(() => {
    const { password, confirmPwd } = newPassword;
    const pwdMatch = validatePwdMatch(password, confirmPwd);

    if (password === "" || password.length < 8) {
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
  }, [newPassword]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setNewPassword({
      ...newPassword,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidForm(false);

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword.password,
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
        text: `Password has been successfully updated.`,
        status: "success",
      });
      setTimeout(() => {
        void router.push("/");
      }, 1000);
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <PageTitle size="x-large" title="Reset Password" />
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 flex-col items-center justify-center gap-4 text-center"
      >
        <TextField
          className="w-full md:w-4/5 lg:w-3/5"
          name="password"
          autoComplete="password"
          required
          id="password"
          label="Password"
          type={showPwd ? "text" : "password"}
          autoFocus
          onChange={handleInput}
          value={newPassword.password}
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
        <TextField
          className="w-full md:w-4/5 lg:w-3/5"
          name="confirmPwd"
          autoComplete="confirmPwd"
          required
          id="confirmPwd"
          label="Confirm Password"
          type={showConfirmPwd ? "text" : "password"}
          onChange={handleInput}
          value={newPassword.confirmPwd}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                aria-label="toggle password visibility"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              >
                {showConfirmPwd ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            ),
          }}
        />
        <div className={`${colorText} text-sm font-bold`}>
          *Password must be at least 8 characters*
        </div>
        <FormMessage message={message} />
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={!isValidForm}
          sx={{ fontSize: "24px", lineHeight: "32px" }}
        >
          Reset Password
        </Button>
        <Button
          variant="outlined"
          sx={{ fontSize: "24px", lineHeight: "32px" }}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
