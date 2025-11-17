import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import LockIcon from "@mui/icons-material/Lock";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PublicIcon from "@mui/icons-material/Public";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  type Theme,
} from "@mui/material";
import { useRouter } from "next/navigation";
// Note: Assuming these external dependencies are available in the runtime environment
// import { useRouter } from "next/navigation";
import { Logo } from "~/components/navbar/logo/logo";

const GuestHome = () => {
  const router = useRouter();
  const theme: Theme = useTheme();

  const isDesktop: boolean = useMediaQuery(theme.breakpoints.up("md"));

  const handleNavigation = (path: string) => router.push(path);
  const handleSignUp = () => router.push("/signup");

  // --- Feature Data ---
  const features = [
    {
      icon: RocketLaunchIcon,
      title: "Efficient Film Workflow",
      description:
        "Stop juggling links and tabs. Clip plays, add notes, and keep all analysis within a single, integrated platform for maximum efficiency. Associate notes instantly, without copy/pasting links.",
    },
    {
      icon: AlternateEmailIcon,
      title: "Targeted Feedback with Player Mentions",
      description:
        "Utilize player mentions to instantly alert teammates when a clip is relevant to them, ensuring focused, actionable feedback and dramatically increasing player film engagement.",
    },
    {
      icon: ViewListIcon,
      title: "Intelligent Scouting & Play Collections",
      description:
        "Easily create custom collections for opponent scouting or internal development (e.g., 'Good Reset Defense' or 'Player Matchups'). View key moments in a quick, digestible, scrollable feed.",
    },
    {
      icon: LockIcon,
      title: "Private Team Strategy & Security",
      description:
        "All uploaded film, analysis, and collections can be secured and private. Only confirmed members of your team can view your private content, keeping your strategy safe from opponents.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // Use theme default background color
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* <GuestNav /> */}

      <main>
        {/* 1. Hero Section: Value Proposition & Primary CTA */}
        <Box
          sx={{
            textAlign: "center",
            // Use theme paper background color
            backgroundColor: theme.palette.background.paper,
            // Use theme divider color for border
            borderBottom: `1px solid ${theme.palette.divider}`,
            py: 4,
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Logo size={isDesktop ? "large" : "medium"} />
            <Typography
              variant="overline"
              color="primary"
              sx={{ letterSpacing: 1.5, fontWeight: "bold" }}
            >
              Better Analysis. Better Ball Knowledge.
            </Typography>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                mt: 1,
                mb: 2,
                lineHeight: { xs: 1.2, md: 1.1 },
                fontSize: { xs: "2.6rem", md: "4rem" },
              }}
            >
              The Collaborative Film Analysis Tool.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Inside Break helps you dissect, discuss, and document every play
              with your entire team in one secure, focused platform.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleSignUp}
                startIcon={<PersonAddAltIcon />}
                sx={{
                  fontWeight: "bold",
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  // Use theme-aware shadow
                  boxShadow: theme.shadows[6],
                }}
              >
                Join Inside Break Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() =>
                  handleNavigation(
                    "https://docs.google.com/document/d/1gtX8PoVhk4h7tLvIHVtz-p6np1GPwnyoD9faZFrM1zw/edit?usp=sharing",
                  )
                }
                sx={{ fontWeight: "bold", py: 1.5, px: 4, borderRadius: 3 }}
              >
                Learn How It Works
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* 2. Features Section: Why You Need to Join */}
        <Box
          sx={{
            py: { xs: 4, md: 6 },
            // Use theme default background color
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              component="h2"
              textAlign="center"
              fontWeight={700}
              // Ensure text color adapts
              color="text.primary"
              sx={{ mb: { xs: 4, md: 6 } }}
            >
              Highlighted Features on Inside Break
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={6} key={index}>
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 4,
                      p: 2,
                      minHeight: "250px",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      // Ensure Card background and text color adapt
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      "&:hover": {
                        transform: "translateY(-5px)",
                        // Use a theme-aware shadow on hover
                        boxShadow: theme.shadows[10],
                      },
                    }}
                  >
                    <CardContent>
                      <feature.icon
                        sx={{
                          fontSize: 48,
                          mb: 2,
                          // Icon background will adapt based on theme primary color
                          backgroundColor: "primary.light",
                          color: theme.palette.primary.contrastText, // Ensure contrast color for icon
                          borderRadius: "50%",
                          p: 1,
                        }}
                      />
                      <Typography
                        variant="h5"
                        component="h3"
                        fontWeight={700}
                        gutterBottom
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* 3. Secondary CTA */}
        <Box
          sx={{
            py: { xs: 4, md: 6 },
            // Use theme primary color for dark contrast block
            backgroundColor: theme.palette.primary.dark,
            // Ensure text color contrasts with the dark background
            color: theme.palette.getContrastText(theme.palette.primary.dark),
            textAlign: "center",
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h4"
              component="h2"
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              Stop Waiting. Start Analyzing.
            </Typography>
            <Typography variant="h6" sx={{ mb: 4 }}>
              Get started today and see the competitive difference focused
              analysis makes.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleNavigation("/public")}
              startIcon={<PublicIcon />}
              sx={{
                // Explicitly use paper/main background for an inverted button look
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.primary.main,
                "&:hover": {
                  // Use a theme-aware hover color (slightly darker/lighter background.paper)
                  backgroundColor: theme.palette.background.default,
                },
                fontWeight: "bold",
                py: 1.5,
                px: 3,
                borderRadius: 3,
              }}
            >
              Browse Public Feed
            </Button>
          </Container>
        </Box>
      </main>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          // Use a very dark gray that contrasts with default background in both modes
          backgroundColor: theme.palette.grey[900],
          color: theme.palette.common.white,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            &copy; 2024 Inside Break. All rights reserved.
            <Button
              onClick={() => handleNavigation("/public")}
              color="inherit"
              sx={{
                ml: 2,
                textTransform: "none",
                // Ensure link color contrasts well against the dark footer
                color: theme.palette.primary.light,
              }}
            >
              Browse Public Content
            </Button>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default GuestHome;
