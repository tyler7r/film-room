import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { type SupportEmailApiPayload } from "~/pages/api/send-support-email";
import { validateEmail } from "~/utils/helpers";

// --- TYPE DEFINITIONS ---

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional: Pass the logged-in user's email if available
  userEmail: string | undefined;
}

interface FormData {
  subject: string;
  email: string;
  message: string;
}

const sendSupportEmail = async (data: FormData): Promise<void> => {
  const SUPPORT_EMAIL_API_URL = "/api/send-support-email"; // New dedicated API endpoint

  const emailPayload: SupportEmailApiPayload = {
    title: data.subject,
    senderEmail: data.email,
    content: data.message,
  };

  // Kick off the email process asynchronously (non-blocking)
  void fetch(SUPPORT_EMAIL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
  })
    .then((response) => {
      if (!response.ok) {
        void response.json().then((result) => {
          console.error(
            `Support Email API failed. Status: ${response.status}`,
            result,
          );
        });
      }
    })
    .catch((e) => {
      console.error(`Failed to connect to Support Email API:`, e);
    });
};

const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const { user } = useAuthContext();
  const defaultEmail = userEmail ?? user.email;
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    subject: "",
    email: defaultEmail ?? "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    const isValidEmail = validateEmail(formData.email);
    const isValidSubject = formData.subject === "" ? false : true;
    if (!isValidEmail || !isValidSubject) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    try {
      await sendSupportEmail(formData);
      setStatus("success");
      // Optionally clear the form after success
      setFormData({ subject: "", email: defaultEmail ?? "", message: "" });
    } catch (error) {
      console.error("Support submission failed:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setStatus("idle");
      }, 1000);
    }
  };

  // Modal styling for centering and responsiveness
  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: 450, md: 500 },
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="support-ticket-title"
      aria-describedby="support-ticket-description"
    >
      <Box sx={style}>
        <Button
          onClick={onClose}
          size="small"
          variant="text"
          color="inherit"
          sx={{ position: "absolute", right: 2, top: 5 }}
        >
          <CloseIcon />
        </Button>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            id="support-ticket-title"
            variant="h5"
            fontWeight="bold"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Submit Ticket
          </Typography>
        </Stack>
        <Typography
          id="support-ticket-description"
          sx={{ mb: 3 }}
          color="text.secondary"
        >
          Please reach out with any feedback: bugs, feature ideas or general app
          support. Let me know!
        </Typography>

        {status === "success" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Your support ticket has been sent! We'll be in touch soon.
          </Alert>
        )}

        {status === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to send ticket. Please try again or email me directly at
            tyler7r@gmail.com.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Your Email"
              name="email"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={handleChange}
              InputLabelProps={{ shrink: formData.email ? true : false }}
            />
            <TextField
              label="Subject"
              name="subject"
              required
              fullWidth
              value={formData.subject}
              onChange={handleChange}
            />
            <TextField
              label="Message"
              name="message"
              multiline
              rows={6}
              fullWidth
              value={formData.message}
              onChange={handleChange}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                onClick={() =>
                  void router.push(
                    "https://docs.google.com/document/d/1gtX8PoVhk4h7tLvIHVtz-p6np1GPwnyoD9faZFrM1zw/edit?tab=t.0",
                  )
                }
                variant="outlined"
                size="small"
                fullWidth
              >
                Inside Break Manual / FAQ
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon />
                  )
                }
                disabled={isLoading || status === "success" || !isValid}
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                {isLoading ? "Sending..." : "Send Ticket"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default SupportModal;
