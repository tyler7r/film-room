import { Box, Button, TextField } from "@mui/material";
import { useForm } from "react-hook-form";

const Signup = () => {
  const { register, handleSubmit } = useForm();

  const handleFormSubmit = (formData: any) => {
    console.log("form data is ", formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <TextField
        required
        fullWidth
        id="email"
        label="Email"
        type="email"
        autoFocus
        {...register("email")}
      />
      <Button variant="contained" size="large">
        Signup
      </Button>
    </Box>
  );
};

export default Signup;
