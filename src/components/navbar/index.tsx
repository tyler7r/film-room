import {
  AppBar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  type Theme,
} from "@mui/material";
import React, { useState } from "react";

// Icons
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"; // New Support Icon
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MailOutlineIcon from "@mui/icons-material/MailOutline"; // New Inbox Icon
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import Inbox from "../inbox";
import TeamLogo from "../teams/team-logo";
import { Logo } from "./logo/logo";
import SupportModal from "./support-btn";
import TeamProfileBtn from "./team-profile-btn";

// --- TYPE DEFINITIONS ---

// Define the shape of the props the AppNavbar accepts
interface AppNavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Define the type for the navigation link objects
interface NavLink {
  name: string;
  path: string;
  icon: React.ElementType;
  action: () => void;
}

/**
 * The main application navigation bar that handles all 4 states:
 * Guest/User x Mobile/Desktop, and includes the Inbox toggle.
 */
const AppNavbar: React.FC<AppNavbarProps> = ({ isDarkMode, toggleTheme }) => {
  const { user, affiliations } = useAuthContext();
  const { toggleOpen, unreadCount } = useInboxContext();
  const { hoverBorder } = useIsDarkContext();
  const theme: Theme = useTheme();
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false); // New state for Support Modal

  // Check if the screen size is medium or larger (desktop breakpoint)
  const isDesktop: boolean = useMediaQuery(theme.breakpoints.up("md"));
  const isLoggedIn: boolean = user.isLoggedIn; // Convenience variable

  // --- Navigation Handlers ---
  const handleNavigation = (path: string): void => {
    void router.push(path);
    setIsDrawerOpen(false); // Close menu drawer on navigation
  };

  const handleSignIn = (): void => handleNavigation("/login");
  const handleSignUp = (): void => handleNavigation("/signup");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    void router.push("/login");
    setIsDrawerOpen(false);
  };

  const openSupportModal = () => {
    setIsDrawerOpen(false); // Close the mobile drawer if open
    setIsSupportModalOpen(true);
  };

  // Primary Navigation Links
  const navLinks: NavLink[] = [
    {
      name: "Film Room",
      path: "/film-room",
      icon: PlayCircleOutlineIcon,
      action: () => handleNavigation("/film-room"),
    },
    {
      name: "Search",
      path: "/search/users",
      icon: SearchIcon,
      action: () => handleNavigation("/search/users"),
    },
  ];

  // --- Mobile Drawer Content ---
  const MobileDrawer = (
    <Drawer
      anchor="right"
      open={isDrawerOpen}
      onClose={() => setIsDrawerOpen(false)}
      PaperProps={{ sx: { width: 250 } }}
    >
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          flexDirection: "column",
          pt: 2,
          gap: 0.5,
        }}
      >
        <Logo size="mobile-drawer" />
        <Button
          onClick={() => handleNavigation("/public")}
          variant="outlined"
          size="small"
          startIcon={<PublicOutlinedIcon />}
          sx={{ fontWeight: "bold", fontSize: 12 }}
        >
          Public Feed
        </Button>
      </Box>
      {/* List items will scroll with the drawer */}
      <List>
        {isLoggedIn && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              justifyContent: "start",
              gap: 0.25,
              width: "100%",
              borderBottom: `1px solid ${theme.palette.primary.main}`,
              pb: 1,
            }}
          >
            <ListItem disablePadding>
              {/* Inbox Toggle inside the Hamburger menu (Secondary placement) */}
              <ListItemButton onClick={toggleOpen}>
                <ListItemIcon>
                  <MailOutlineIcon />
                  <Badge
                    badgeContent={unreadCount}
                    color="primary"
                    sx={{ alignSelf: "start" }}
                  />
                </ListItemIcon>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "-0.025em", // Converted from tracking-tight
                    lineHeight: "inherit",
                    fontSize: 14,
                  }}
                >
                  Inbox
                </Typography>
              </ListItemButton>
            </ListItem>
            {affiliations && affiliations.length > 0 ? (
              affiliations?.map((aff) => (
                <ListItem
                  disablePadding
                  key={aff.team.id}
                  onClick={() => handleNavigation(`/team-hub/${aff.team.id}`)}
                  sx={{
                    display: "flex",
                    width: "100%",
                    flexWrap: "wrap",
                    cursor: "pointer",
                    borderRadius: "8px", // Apply some border radius
                    transition:
                      "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out", // Smooth transition
                    "&:hover": {
                      borderColor: hoverBorder, // Apply hover border color
                      backgroundColor: "action.hover", // Subtle background on hover
                    },
                  }}
                >
                  <ListItemButton>
                    <ListItemIcon>
                      <TeamLogo tm={aff.team} size={25} />
                    </ListItemIcon>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        letterSpacing: "-0.025em", // Converted from tracking-tight
                        lineHeight: "inherit",
                        fontSize: 14,
                      }}
                    >
                      {aff.team.full_name}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem
                disablePadding
                onClick={() => handleNavigation(`/team-select`)}
                sx={{
                  display: "flex",
                  width: "100%",
                  flexWrap: "wrap",
                  cursor: "pointer",
                  borderRadius: "8px", // Apply some border radius
                  transition:
                    "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out", // Smooth transition
                  "&:hover": {
                    borderColor: hoverBorder, // Apply hover border color
                    backgroundColor: "action.hover", // Subtle background on hover
                  },
                }}
              >
                <ListItemButton>
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      letterSpacing: "-0.025em", // Converted from tracking-tight
                      lineHeight: "inherit",
                      fontSize: 14,
                    }}
                  >
                    Join New Team
                  </Typography>
                </ListItemButton>
              </ListItem>
            )}
          </Box>
        )}
        {/* Core Navigation Links */}
        {navLinks.map((item: NavLink) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton onClick={item.action}>
              <ListItemIcon>
                <item.icon color="primary" />
              </ListItemIcon>
              <Typography
                sx={{
                  fontWeight: "bold",
                  letterSpacing: "-0.025em", // Converted from tracking-tight
                  lineHeight: "inherit",
                  fontSize: 14,
                }}
              >
                {item.name}
              </Typography>
              {/* <ListItemText primary={item.name} sx={{ fontWeight: "bold" }} /> */}
            </ListItemButton>
          </ListItem>
        ))}
        {isLoggedIn ? (
          // Logged In Mobile Actions
          <Box>
            <ListItem disablePadding>
              {/* Inbox Toggle inside the Hamburger menu (Secondary placement) */}
              <ListItemButton
                onClick={() => handleNavigation(`/profile/${user.userId}`)}
              >
                <ListItemIcon>
                  <AccountCircleIcon color="primary" />
                </ListItemIcon>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "-0.025em", // Converted from tracking-tight
                    lineHeight: "inherit",
                    fontSize: 14,
                  }}
                >
                  Profile
                </Typography>
              </ListItemButton>
            </ListItem>
          </Box>
        ) : null}
      </List>

      <Divider />

      <List>
        {/* Theme Toggle */}
        <ListItem disablePadding>
          <ListItemButton onClick={openSupportModal}>
            <ListItemIcon>
              <HelpOutlineIcon />
            </ListItemIcon>
            <Typography
              sx={{
                fontWeight: "bold",
                letterSpacing: "-0.025em", // Converted from tracking-tight
                lineHeight: "inherit",
                fontSize: 14,
              }}
            >
              Support / Help
            </Typography>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon>
              {isDarkMode ? (
                <LightModeOutlinedIcon />
              ) : (
                <DarkModeOutlinedIcon />
              )}
            </ListItemIcon>
            <Typography
              sx={{
                fontWeight: "bold",
                letterSpacing: "-0.025em", // Converted from tracking-tight
                lineHeight: "inherit",
                fontSize: 14,
              }}
            >
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Typography>
          </ListItemButton>
        </ListItem>

        {isLoggedIn ? (
          // Logout Button
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{ color: theme.palette.error.main }}
            >
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <Typography
                sx={{
                  fontWeight: "bold",
                  letterSpacing: "-0.025em", // Converted from tracking-tight
                  lineHeight: "inherit",
                  fontSize: 14,
                }}
              >
                Logout
              </Typography>
            </ListItemButton>
          </ListItem>
        ) : (
          // Guest Mobile Actions (for the drawer, though main buttons are on the toolbar)
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={handleSignUp}>
                <ListItemIcon>
                  <PersonAddAltIcon />
                </ListItemIcon>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "-0.025em", // Converted from tracking-tight
                    lineHeight: "inherit",
                    fontSize: 14,
                  }}
                >
                  Signup
                </Typography>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleSignIn}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "-0.025em", // Converted from tracking-tight
                    lineHeight: "inherit",
                    fontSize: 14,
                  }}
                >
                  Login
                </Typography>
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  // --- Main Component Render ---
  return (
    <React.Fragment>
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          backdropFilter: "blur(8px)",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* 1. Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Logo size={isDesktop ? "small-full" : "small"} />
          </Box>

          {/* 2. Desktop Navigation (md and up) */}
          {isDesktop && (
            <Stack direction="row" spacing={0} alignItems="center">
              <Tooltip title="Public Feed">
                <IconButton
                  onClick={() => handleNavigation("/public")}
                  // color="info"
                >
                  <PublicOutlinedIcon />
                </IconButton>
              </Tooltip>
              {/* Core Links */}
              {isLoggedIn && (
                // Inbox Toggle (Primary placement for logged-in desktop)
                <IconButton
                  onClick={toggleOpen}
                  // color="info"
                >
                  <MailOutlineIcon />
                  <Badge
                    badgeContent={unreadCount}
                    color="primary"
                    sx={{ alignSelf: "start" }}
                  />
                </IconButton>
              )}
              <TeamProfileBtn />
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ mx: 1 }}
              />
              <Tooltip title="Film Room">
                <IconButton
                  color="primary"
                  onClick={() => handleNavigation("/film-room")}
                  sx={{ fontWeight: "bold" }}
                >
                  <PlayCircleOutlineIcon />
                </IconButton>
              </Tooltip>
              {/* Functional Icons */}
              <IconButton
                onClick={() => handleNavigation("/search/users")}
                color="primary"
              >
                <SearchIcon />
              </IconButton>
              {isLoggedIn && (
                <Tooltip title="Profile">
                  <IconButton
                    color="primary"
                    onClick={() => handleNavigation(`/profile/${user.userId}`)}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Divider
                flexItem
                orientation="vertical"
                variant="middle"
                sx={{ mx: 1 }}
              />
              <IconButton onClick={openSupportModal}>
                <HelpOutlineIcon />
              </IconButton>
              {/* Theme Toggle */}
              <IconButton onClick={toggleTheme}>
                {isDarkMode ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
              </IconButton>
              {/* Conditional Auth/User Buttons */}
              {isLoggedIn ? (
                // Logged In Desktop Actions
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  color="error"
                  sx={{ fontWeight: "bold", ml: 1 }}
                >
                  Logout
                </Button>
              ) : (
                // Guest Desktop Actions
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSignUp}
                    sx={{ fontWeight: "bold", ml: 1 }}
                  >
                    Signup
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSignIn}
                    sx={{ fontWeight: "bold", ml: 1 }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Stack>
          )}

          {/* 3. Mobile Navigation (md down) */}
          {!isDesktop && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoggedIn && (
                <IconButton size="medium" onClick={toggleOpen}>
                  <MailOutlineIcon />
                  <Badge
                    badgeContent={unreadCount}
                    color="primary"
                    sx={{ alignSelf: "start" }}
                  />
                </IconButton>
              )}
              <IconButton
                onClick={() => handleNavigation("/search/users")}
                color="primary"
              >
                <SearchIcon />
              </IconButton>
              <IconButton onClick={openSupportModal}>
                <HelpOutlineIcon />
              </IconButton>
              <IconButton onClick={toggleTheme}>
                {isDarkMode ? (
                  <LightModeOutlinedIcon />
                ) : (
                  <DarkModeOutlinedIcon />
                )}
              </IconButton>
              {isLoggedIn ? (
                <IconButton
                  size="medium"
                  edge="end"
                  color="info"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                // Guest Mobile: Shows direct Signup/Login buttons
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSignUp}
                    sx={{ fontWeight: "bold", fontSize: 12 }}
                  >
                    Signup
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSignIn}
                    sx={{ fontWeight: "bold", fontSize: 12 }}
                  >
                    Login
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Toolbar>
        {MobileDrawer}
      </AppBar>
      <Inbox />
      {/* {user.email && ( */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        userEmail={user.email}
      />

      {/* CRITICAL: This spacer Box prevents the fixed AppBar from overlapping the content */}
      <Toolbar />
    </React.Fragment>
  );
};

export default AppNavbar;
