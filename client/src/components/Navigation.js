import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ChEMBL Dashboard
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
          >
            Search
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/visualization"
          >
            Visualizations
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;