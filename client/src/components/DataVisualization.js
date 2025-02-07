import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Slider, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BoxPlotController,
  BoxAndWiskers
} from 'chart.js';
import { Bar, Pie, Scatter, BoxPlot } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BoxPlotController,
  BoxAndWiskers
);

const DataVisualization = () => {
  const [filters, setFilters] = useState({
    molWeightRange: [0, 1000],
    logPRange: [-10, 10],
    maxPhase: '',
    moleculeType: ''
  });

  const [chartData, setChartData] = useState({
    molecularWeights: null,
    moleculeTypes: null,
    logPDistribution: null,
    weightVsLogP: null,
    hbdHbaDistribution: null
  });

  useEffect(() => {
    fetchChartData();
  }, [filters]);

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/visualization-data`, {
        params: filters
      });
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography gutterBottom>Molecular Weight Range</Typography>
                  <Slider
                    value={filters.molWeightRange}
                    onChange={(e, newValue) => setFilters(prev => ({...prev, molWeightRange: newValue}))}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography gutterBottom>LogP Range</Typography>
                  <Slider
                    value={filters.logPRange}
                    onChange={(e, newValue) => setFilters(prev => ({...prev, logPRange: newValue}))}
                    valueLabelDisplay="auto"
                    min={-10}
                    max={10}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Max Phase</InputLabel>
                    <Select
                      value={filters.maxPhase}
                      onChange={(e) => setFilters(prev => ({...prev, maxPhase: e.target.value}))}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="0">0</MenuItem>
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                      <MenuItem value="4">4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Molecule Type</InputLabel>
                    <Select
                      value={filters.moleculeType}
                      onChange={(e) => setFilters(prev => ({...prev, moleculeType: e.target.value}))}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Small molecule">Small molecule</MenuItem>
                      <MenuItem value="Protein">Protein</MenuItem>
                      <MenuItem value="Antibody">Antibody</MenuItem>
                      <MenuItem value="Oligosaccharide">Oligosaccharide</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Molecular Weight Distribution</Typography>
              {chartData.molecularWeights && (
                <Bar data={chartData.molecularWeights} options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Molecule Types</Typography>
              {chartData.moleculeTypes && (
                <Pie data={chartData.moleculeTypes} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>LogP Distribution</Typography>
              {chartData.logPDistribution && (
                <Bar data={chartData.logPDistribution} options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Molecular Weight vs LogP</Typography>
              {chartData.weightVsLogP && (
                <Scatter data={chartData.weightVsLogP} options={{
                  responsive: true,
                  scales: {
                    x: { title: { display: true, text: 'Molecular Weight' } },
                    y: { title: { display: true, text: 'LogP' } }
                  }
                }} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>HBD/HBA Distribution</Typography>
              {chartData.hbdHbaDistribution && (
                <BoxPlot data={chartData.hbdHbaDistribution} options={{
                  responsive: true,
                  plugins: {
                    title: { display: true, text: 'Distribution of Hydrogen Bond Donors and Acceptors' }
                  }
                }} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DataVisualization;