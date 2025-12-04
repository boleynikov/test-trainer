import React, { useMemo, useState } from 'react';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { School, Brightness4, Brightness7 } from '@mui/icons-material';

import { getDesignTokens, type Mode } from './theme'; // Імпортуємо нашу тему
import ExamSimulator from './ExamSimulator'; // Ваш основний компонент
import { IconButton } from '@mui/material';

const App: React.FC = () => {

  const [mode, setMode] = useState<Mode>(() => {
    try {
      const savedMode = localStorage.getItem('themeMode') as Mode;
      return savedMode ? savedMode : 'light' as Mode;
    } catch (error) {
      return 'light' as Mode;
    }
  });

  const theme = useMemo(() => {
    let themeObj = createTheme(getDesignTokens(mode));
    return responsiveFontSizes(themeObj);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline запускає normalize.css і фарбує body у колір background.default */}
      <CssBaseline />

      {/* Простий Layout додатку */}
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header / Навігаційна панель */}
        <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #eee' }}>
          <Toolbar>
            <School sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
              PL-400 Exam Trainer
            </Typography>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
          <ExamSimulator />
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Built for success in Microsoft Certification
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;