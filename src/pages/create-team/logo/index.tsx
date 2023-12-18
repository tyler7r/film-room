import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Button, Input, Typography } from "@mui/material";
import { useState } from "react";
import FormMessage from "~/components/form-message";
import { supabase } from "~/utils/supabase";
import { MessageType } from "~/utils/types";

const TeamLogo = () => {
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pubURL, setPubURL] = useState<string>("");

  const handleChange = async (files: FileList | null) => {
    if (files === null) return;
    const file = files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      const { data, error } = await supabase.storage
        .from("team_logos")
        .upload(`logos/team.png`, file, {
          upsert: true,
        });
      if (data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("team_logos").getPublicUrl(data.path);
        setPubURL(publicUrl);
      } else {
        setMessage({
          text: `There was an error with the image you chose to upload. ${error.message}`,
          status: "error",
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center">
      <Typography variant="h1" fontSize={48}>
        Add Team Logo
      </Typography>
      <form onSubmit={handleSubmit}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          Upload Logo
          <Input
            type="file"
            onChange={(e) => {
              handleChange((e.target as HTMLInputElement).files);
            }}
            style={{ display: "none" }}
          />
        </Button>
      </form>
      <FormMessage message={message} />
    </div>
  );
};

export default TeamLogo;
