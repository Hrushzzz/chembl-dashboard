import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import CompoundSearch from './components/CompoundSearch';
import CompoundDetail from './components/CompoundDetail';
import DataVisualization from './components/DataVisualization';
import Navigation from './components/Navigation';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<CompoundSearch />} />
          <Route path="/compound/:chemblId" element={<CompoundDetail />} />
          <Route path="/visualization" element={<DataVisualization />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;