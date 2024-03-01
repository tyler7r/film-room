import { Box, Drawer, List, ListItem } from "@mui/material";
import { useMobileContext } from "~/contexts/mobile";

type InboxProps = {
  isInboxOpen: boolean;
  setIsInboxOpen: () => void;
};

const Inbox = ({ isInboxOpen, setIsInboxOpen }: InboxProps) => {
  const { isMobile } = useMobileContext();
  const DrawerComp = (
    <Box onClick={() => setIsInboxOpen()} sx={{ width: isMobile ? 250 : 350 }}>
      <List>
        <ListItem>Test 1</ListItem>
        <ListItem>Test 2</ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer open={isInboxOpen} anchor="right" onClose={() => setIsInboxOpen()}>
      {DrawerComp}
    </Drawer>
  );
};

export default Inbox;
