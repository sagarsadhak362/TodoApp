import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App.jsx';
import './styles.css';

const theme = createTheme({
  typography: {
    fontFamily: '"DM Sans", "Google Sans", Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  palette: {
    primary: { main: '#f4b400' },
    background: { default: '#fff', paper: '#fff' },
  },
  shape: { borderRadius: 12 },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
