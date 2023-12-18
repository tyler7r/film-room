import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Button, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormMessage from "~/components/form-message";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { MessageType } from "~/utils/types";

const TeamLogo = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pubURL, setPubURL] = useState<string>("");

  const handleChange = async (files: FileList | null) => {
    console.log(files);
    if (files === null) return;
    const file = files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      const { data, error } = await supabase.storage
        .from("team_logos")
        .upload(`logos/${user.currentAffiliation}.png`, file, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("teams")
      .update({ logo: pubURL })
      .eq("id", `${user.currentAffiliation}`);
    if (error) {
      setMessage({
        text: `There was an issue updating the logo to the team account. ${error.message}`,
        status: "error",
      });
    } else {
      setMessage({
        text: `Successfully finished setting up the team account!`,
        status: "success",
      });
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center">
      <Typography variant="h1" fontSize={48}>
        Add Team Logo
      </Typography>
      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col items-center justify-center gap-3"
      >
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
        >
          {imagePreview === "" ? "Upload Logo" : "Change Logo"}
          <input
            id="file_upload"
            type="file"
            onChange={(e) => {
              handleChange((e.target as HTMLInputElement).files);
            }}
            style={{ display: "none" }}
          />
        </Button>
        {imagePreview !== "" && (
          <Image
            className={`rounded-full border-4 border-solid border-stone-300`}
            src={imagePreview}
            alt="Site logo"
            height={250}
            width={250}
            priority={true}
          />
        )}
        <div className="flex flex-col items-center justify-center">
          <Button
            className="mb-1"
            type="submit"
            variant="contained"
            disabled={imagePreview === "" ? true : false}
          >
            Submit
          </Button>
          <Typography variant="overline" fontSize="small">
            OR
          </Typography>
          <Button
            className="p-0"
            type="button"
            variant="text"
            size="medium"
            onClick={() => router.push("/")}
          >
            Skip
          </Button>
        </div>
      </form>
      <FormMessage message={message} />
    </div>
  );
};

export default TeamLogo;
