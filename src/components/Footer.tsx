import React from "react";
import { Box, Typography } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "60px",
        bottom: "0 !important",
        color: "black",
        textAlign: "center",
        marginTop: "auto",
        overflowX: "hidden",
      }}
    >
      <Typography variant="body2">© 2024 made by Flavio Salas</Typography>
    </Box>
  );
};

export default Footer;
