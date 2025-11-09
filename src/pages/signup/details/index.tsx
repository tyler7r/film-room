import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, IconButton, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { validatePwdMatch } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type MessageType } from "~/utils/types";

type DetailsType = {
  password: string;
  confirmPwd: string;
};

const SignupDetails = () => {
  const { user } = useAuthContext();
  const { colorText } = useIsDarkContext();

  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    status: "error",
    text: undefined,
  });
  const [data, setData] = useState<DetailsType>({
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
      return false;
    } else return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidForm(false);

    if (!user.userId) {
      void router.push("/login");
      return;
    }

    const checkValidPassword = await updatePassword();

    if (checkValidPassword) {
      setMessage({
        status: "success",
        text: "Successfully updated your password!",
      });
      setTimeout(() => {
        void router.push("/team-select");
      }, 1000);
    }
  };

  useEffect(() => {
    const { password, confirmPwd } = data;
    const pwdMatch = validatePwdMatch(password, confirmPwd);

    if (password === "" || password.length < 8) {
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
    <div className="flex w-full flex-col items-center justify-center gap-8 p-4 text-center">
      <PageTitle title="Finish Account" size="x-large" />
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 max-w-screen-md flex-col items-center justify-center gap-6 text-center"
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
          value={data.password}
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
          autoFocus
          onChange={handleInput}
          value={data.confirmPwd}
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
        <div className={`${colorText} text-sm font-bold tracking-tight`}>
          *Password must be at least 8 characters*
        </div>
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
