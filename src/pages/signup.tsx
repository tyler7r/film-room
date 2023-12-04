import { Button, TextField, Typography } from "@mui/material";
import { useState } from "react";

const Signup = () => {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center">
      <Typography variant="h1" fontSize={72}>
        Sign Up
      </Typography>
      <form
        onSubmit={handleSubmit}
        className="flex w-4/5 flex-col items-center justify-center text-center"
      >
        <TextField
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
        <Button variant="contained" size="large" type="submit">
          Signup
        </Button>
      </form>
    </div>
  );
};

export default Signup;
