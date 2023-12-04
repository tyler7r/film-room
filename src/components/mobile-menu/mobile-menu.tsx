import { colors } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { Button } from "../button/button";

export const MobileMenu = () => {
  const isDark = useIsDarkContext();
  return (
    <div
      style={{
        backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
      }}
      className={`align-center flex justify-between`}
    >
      <Button disabled={false} variant="text" size="medium" label="Film Room" />
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
