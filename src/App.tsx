import React, { useMemo, useState } from "react";
import {
  createTheme,
  responsiveFontSizes,
  ThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  School,
  Brightness4,
  Brightness7,
  CloudUpload,
} from "@mui/icons-material";

import { getDesignTokens, type Mode } from "./theme"; // Імпортуємо нашу тему
import ExamSimulator from "./ExamSimulator"; // Ваш основний компонент
import {
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import { DataLoadModal } from "./components/DataLoadModal";

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const savedMode = localStorage.getItem("themeMode") as Mode;
      return savedMode ? savedMode : ("light" as Mode);
    } catch {
      return "light" as Mode;
    }
  });

  const [openUpload, setOpenUpload] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [containerMaxWidth, setContainerMaxWidth] = useState<
    "sm" | "md" | "lg" | "xl"
  >(() => {
    try {
      const savedWidth = localStorage.getItem("containerMaxWidth");
      return (savedWidth as "sm" | "md" | "lg" | "xl") || "md";
    } catch {
      return "md";
    }
  });

  const handleMaxWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value as "sm" | "md" | "lg" | "xl";
    setContainerMaxWidth(val);
    localStorage.setItem("containerMaxWidth", val);
  };

  const theme = useMemo(() => {
    const themeObj = createTheme(getDesignTokens(mode));
    return responsiveFontSizes(themeObj);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  const handleOpenUpload = () => setOpenUpload(true);
  const handleCloseUpload = () => {
    setOpenUpload(false);
    window.location.reload();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Простий Layout додатку */}
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header / Навігаційна панель */}
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar>
            <School sx={{ mr: 2, color: "primary.main" }} />
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ fontWeight: "bold", flexGrow: 1 }}
            >
              Exam Trainer
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={showHints}
                  onChange={(e) => setShowHints(e.target.checked)}
                  color="primary"
                />
              }
              label="Підказки"
              sx={{ color: "text.primary", mr: 2 }}
            />

            <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ mr: 1, display: { xs: "none", md: "block" } }}
              >
                Ширина:
              </Typography>
              <RadioGroup
                row
                value={containerMaxWidth}
                onChange={handleMaxWidthChange}
              >
                <FormControlLabel
                  value="md"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">MD</Typography>}
                />
                <FormControlLabel
                  value="lg"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">LG</Typography>}
                />
                <FormControlLabel
                  value="xl"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">XL</Typography>}
                />
              </RadioGroup>
            </Box>

            <Tooltip title="Завантажити JSON з питаннями">
              <IconButton
                onClick={handleOpenUpload}
                color="inherit"
                sx={{ mr: 1 }}
              >
                <CloudUpload />
              </IconButton>
            </Tooltip>

            <Tooltip title="Змінити тему">
              <IconButton onClick={toggleColorMode} color="inherit">
                {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, py: 3, pb: showHints ? 6 : "inherit" }}
        >
          <ExamSimulator showHints={showHints} maxWidth={containerMaxWidth} />
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ py: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Built for happy life
          </Typography>
        </Box>

        <DataLoadModal
          open={openUpload}
          mode={mode}
          handleClose={handleCloseUpload}
        />
      </Box>
    </ThemeProvider>
  );
};

export default App;
