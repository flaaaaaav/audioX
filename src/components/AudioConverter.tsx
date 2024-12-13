import React, { useState, useEffect } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  Typography,
  InputLabel,
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const ffmpeg = createFFmpeg({ log: true });

const AudioConverter: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const supportedFormats = ["mp3", "wav", "ogg", "aac", "m4a", "flac", "aiff"];
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("128k");
  const [convertedURLs, setConvertedURLs] = useState<string[]>([]);
  const [conversionStatuses, setConversionStatuses] = useState<{
    [key: string]: "idle" | "loading" | "converting" | "completed" | "error";
  }>({});
  const [allConversionFinished, setAllConversionFinished] = useState(false);
  const [, setIsDragging] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [openFormatErrorDialog, setOpenFormatErrorDialog] = useState(false);

  useEffect(() => {
    const load = async () => {
      await ffmpeg.load();
      setReady(true);
    };
    load();
  }, []);

  const convertAudio = async () => {
    if (audioFiles.length === 0) return;

    const inputFormat = audioFiles[0].name.split(".").pop()?.toLowerCase();
    if (inputFormat === outputFormat) {
      setOpenFormatErrorDialog(true);
      return;
    }

    const statuses: {
      [key: string]: "idle" | "loading" | "converting" | "completed" | "error";
    } = {};
    const completedFiles = new Set<string>();

    for (let i = 0; i < audioFiles.length; i++) {
      const audio = audioFiles[i];
      const inputFileName = audio.name;
      const outputFileName = inputFileName.replace(
        /\.\w+$/,
        `.${outputFormat}`
      );

      statuses[inputFileName] = "loading";
      setConversionStatuses({ ...statuses });

      try {
        statuses[inputFileName] = "converting";
        setConversionStatuses({ ...statuses });

        ffmpeg.FS("writeFile", inputFileName, await fetchFile(audio));
        await ffmpeg.run(
          "-y",
          "-i",
          inputFileName,
          "-b:a",
          bitrate,
          outputFileName
        );

        const data = ffmpeg.FS("readFile", outputFileName);
        const url = URL.createObjectURL(
          new Blob([data.buffer], {
            type: `audio/${
              outputFormat === "m4a" ? "audio/x-m4a" : "audio/" + outputFormat
            }`,
          })
        );

        setConvertedURLs((prev) => [...prev, url]);
        statuses[inputFileName] = "completed";
        completedFiles.add(inputFileName);
      } catch (error) {
        statuses[inputFileName] = "error";
        setOpenErrorModal(true);
      }

      setConversionStatuses({ ...statuses });
    }

    if (audioFiles.length > 0) {
      const allCompleted = completedFiles.size === audioFiles.length;
      setAllConversionFinished(allCompleted);
      if (allCompleted) {
        console.log("All conversions finished.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    setAudioFiles((prevFiles) => [...prevFiles, ...files]);
    setConversionStatuses({});
    setConvertedURLs([]);
    setAllConversionFinished(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAudioFiles((prevFiles) => [...prevFiles, ...files]);
    setConversionStatuses({});
    setConvertedURLs([]);
    setAllConversionFinished(false);
  };

  const handleDownloadAll = () => {
    convertedURLs.forEach((url, index) => {
      const inputFileName = audioFiles[index].name;
      const outputFileName = inputFileName.replace(
        /\.\w+$/,
        `.${outputFormat}`
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = outputFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const conversionsStarted =
    audioFiles.length > 0 &&
    Object.values(conversionStatuses).some(
      (status) => status !== "idle" && status !== "completed"
    );

  const renderStatusIcon = (
    status: "idle" | "loading" | "converting" | "completed" | "error"
  ) => {
    switch (status) {
      case "idle":
        return (
          <Typography variant="body2" sx={{ color: "grey.400" }}>
            waiting...
          </Typography>
        );
      case "loading":
        return <CircularProgress size={20} sx={{ color: "grey.400" }} />;
      case "converting":
        return <CircularProgress size={20} sx={{ color: "#6497bf" }} />;
      case "completed":
        return <CheckCircleIcon sx={{ color: "#336c3e" }} />;
      case "error":
        return <ErrorIcon sx={{ color: "#d8031c" }} />;
      default:
        return null;
    }
  };

  const handleCloseErrorModal = () => {
    setOpenErrorModal(false);
  };

  const handleCloseFormatErrorDialog = () => {
    setOpenFormatErrorDialog(false);
  };

  const handleReload = () => {
    setOpenErrorModal(false);
    window.location.reload();
  };

  const handleDeleteAudio = (index: number) => {
    const newAudioFiles = [...audioFiles];
    newAudioFiles.splice(index, 1);
    setAudioFiles(newAudioFiles);

    const newConvertedURLs = [...convertedURLs];
    newConvertedURLs.splice(index, 1);
    setConvertedURLs(newConvertedURLs);

    const newConversionStatuses = { ...conversionStatuses };
    delete newConversionStatuses[audioFiles[index].name];
    setConversionStatuses(newConversionStatuses);

    if (newAudioFiles.length === 0) {
      setAllConversionFinished(false);
    }
  };

  return (
    <div>
      {ready ? (
        <Box
          sx={{
            minWidth: "200px",
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              minWidth: { xs: "250px", lg: "700px" },
              margin: { xs: 2, lg: 2 },
            }}
          >
            {audioFiles.length > 0 && (
              <TableContainer
                component={Paper}
                sx={{
                  width: "auto",
                  borderRadius: "16px",
                  boxShadow: "none",
                  bgcolor: "#fdfdfd",
                  p: 3,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "600" }}>Filename</TableCell>
                      <TableCell
                        sx={{ fontWeight: "600", textAlign: "center" }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "600", textAlign: "center" }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {audioFiles.map((file, index) => (
                      <TableRow key={index}>
                        <TableCell
                          style={{ width: "20%" }}
                          sx={{
                            fontWeight: "500",
                            overflow: "hidden",
                            maxWidth: {
                              xs: "150px",
                              sm: "250px",
                              md: "300px",
                              lg: "700px",
                              xl: "1200px",
                            },
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {file.name}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {renderStatusIcon(
                            conversionStatuses[file.name] || "idle"
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <IconButton
                            sx={{
                              color: "red",
                              "&:focus": {
                                outline: "none",
                              },
                            }}
                            onClick={() => handleDeleteAudio(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {audioFiles.length > 0 && (
              <Box
                sx={{
                  maxWidth: "500px",
                  mt: 2,
                  borderRadius: "16px",
                  bgcolor: "#fdfdfd",
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                  }}
                >
                  <Typography sx={{ fontWeight: "600", fontSize: "1rem" }}>
                    Output format
                  </Typography>
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel></InputLabel>
                    <Select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                    >
                      {supportedFormats.map((format) => (
                        <MenuItem key={format} value={format}>
                          {format.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                  }}
                >
                  <Typography sx={{ fontWeight: "600", fontSize: "1rem" }}>
                    Bitrate
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel></InputLabel>
                    <Select
                      value={bitrate}
                      onChange={(e) => setBitrate(e.target.value)}
                    >
                      <MenuItem value="128k">128 kbps</MenuItem>
                      <MenuItem value="192k">192 kbps</MenuItem>
                      <MenuItem value="256k">256 kbps</MenuItem>
                      <MenuItem value="320k">320 kbps</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}

            {audioFiles.length === 0 && (
              <Box
                sx={{
                  padding: "20px",
                  width: { xs: "300px", lg: "500px" },
                  margin: "20px auto",
                  textAlign: "center",
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Typography sx={{ mb: 2 }}>
                  Select or drag and drop your audio files
                </Typography>
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    component="span"
                    sx={{
                      marginLeft: 2,
                      bgcolor: "#3b8747",
                      textTransform: "none",
                      borderRadius: "12px",
                      pt: 1,
                      pb: 1,
                      pl: 3,
                      pr: 3,
                      ml: 0,
                      fontWeight: "600",
                      color: "#fdfdfd",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: "#336c3e",
                      },
                    }}
                  >
                    Choose files
                  </Button>
                </label>
              </Box>
            )}

            {audioFiles.length > 0 && (
              <Box sx={{ marginTop: 2 }}>
                <Button
                  onClick={convertAudio}
                  disabled={conversionsStarted}
                  sx={{
                    bgcolor: "#6497bf",
                    textTransform: "none",
                    borderRadius: "12px",

                    pt: 1,
                    pb: 1,
                    pl: 3,
                    pr: 3,
                    mt: 1,
                    fontWeight: "600",
                    "&:hover": {
                      bgcolor: "#345066",
                    },
                  }}
                >
                  {conversionsStarted ? "Converting..." : "Start"}
                </Button>
              </Box>
            )}

            {allConversionFinished && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  All conversions finished successfully!
                </Typography>
                <Button
                  onClick={handleDownloadAll}
                  sx={{
                    bgcolor: "#3b8747",
                    textTransform: "none",
                    borderRadius: "12px",
                    pt: 1,
                    pb: 1,
                    pl: 3,
                    pr: 3,
                    mt: 1,
                    mb: 5,
                    fontWeight: "600",
                    color: "#fdfdfd",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#336c3e",
                    },
                  }}
                >
                  Download all
                </Button>
              </Box>
            )}
          </Box>

          <Dialog
            sx={{ textAlign: "center" }}
            open={openFormatErrorDialog}
            onClose={handleCloseFormatErrorDialog}
          >
            <DialogTitle sx={{ fontWeight: "600" }}>
              Error converting!
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                The input format must be different from the output format.
                Please select a different output format and try again.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                sx={{
                  marginLeft: 2,
                  bgcolor: "#3b8747",
                  textTransform: "none",
                  borderRadius: "12px",
                  pt: 1,
                  pb: 1,
                  pl: 3,
                  pr: 3,
                  mb: 1,
                  mr: 1,
                  fontWeight: "600",
                  color: "#fdfdfd",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#336c3e",
                  },
                }}
                onClick={handleCloseFormatErrorDialog}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            sx={{ textAlign: "center" }}
            open={openErrorModal}
            onClose={handleCloseErrorModal}
          >
            <DialogTitle sx={{ fontWeight: "600" }}>Error</DialogTitle>
            <DialogContent>
              <DialogContentText>
                An error occurred during the audio conversion. Please try again.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleReload}
                sx={{
                  marginLeft: 2,
                  bgcolor: "#3b8747",
                  textTransform: "none",
                  borderRadius: "12px",
                  pt: 1,
                  pb: 1,
                  pl: 3,
                  pr: 3,
                  mb: 1,
                  mr: 1,
                  fontWeight: "600",
                  color: "#fdfdfd",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#336c3e",
                  },
                }}
              >
                Reload Page
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      ) : (
        <Box sx={{ marginTop: 5 }}>
          <CircularProgress size={25} sx={{ color: "#323232" }} />
          <Typography sx={{}}>Loading, please wait...</Typography>
        </Box>
      )}
    </div>
  );
};

export default AudioConverter;
