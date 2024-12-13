import React from "react";
import { AppBar, Box, Toolbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      sx={{
        overflowX: "hidden",
        maxWidth: "1000px",
        margin: "0 auto",
        backgroundImage: "none",
        boxShadow: "none",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Toolbar>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Box
            component="img"
            src="media/logo.svg"
            alt="Logo"
            sx={{
              height: "100px",
              marginRight: 2,
              fill: "red",
              cursor: "pointer",
            }}
          />
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
