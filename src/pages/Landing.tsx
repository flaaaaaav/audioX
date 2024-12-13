import { Box } from "@mui/material";
import AudioConverter from "../components/AudioConverter";
import Footer from "../components/Footer";

const Landing = () => (
  <Box
    sx={{
      textAlign: "center",
      bgcolor: "background.default",
      color: "text.primary",
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      margin: "1rem auto",
      minHeight: "85vh",
      overflowX: "hidden",
    }}
  >
    <AudioConverter /> 
    <Footer />
  </Box>
);

export default Landing;
