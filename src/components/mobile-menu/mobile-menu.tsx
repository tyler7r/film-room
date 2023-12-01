import { colors, useTheme } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { Button } from "../button/button";

export const MobileMenu = () => {
  const theme = useTheme();
  const isDark = useIsDarkContext();
  return (
    <div
      style={{
        backgroundColor: `${isDark ? colors.grey[900] : colors.grey[200]}`,
      }}
      className={`align-center flex justify-between`}
    >
      <Button
        disabled={false}
        variant="text"
        size="medium"
        label="The Film Room"
      />
      <Button
        disabled={false}
        variant="text"
        size="medium"
        label="Team Profile"
      />
      <Button disabled={false} variant="text" size="medium" label="Inbox" />
      <Button disabled={false} variant="text" size="medium" label="Settings" />
    </div>
  );
};
