import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Grid,
  Slider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompoundSearch = () => {
  const navigate = useNavigate();
  const [compounds, setCompounds] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    molWeightRange: [0, 1000],
    logPRange: [-10, 10],
    hbdRange: [0, 20],
    hbaRange: [0, 20],
    psaRange: [0, 200],
    maxPhase: '',
    moleculeType: '',
    rtbRange: [0, 20],
    tpsaRange: [0, 200]
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchCompounds();
  }, [filters, page, rowsPerPage]);

  const fetchCompounds = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/compounds`, {
        params: {
          ...filters,
          page: page + 1,
          limit: rowsPerPage
        }
      });
      setCompounds(response.data);
    } catch (error) {
      console.error('Error fetching compounds:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Search by ChEMBL ID or Name"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>Molecular Weight Range</Typography>
                  <Slider
                    value={filters.molWeightRange}
                    onChange={(e, value) => handleFilterChange('molWeightRange', value)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>LogP Range</Typography>
                  <Slider
                    value={filters.logPRange}
                    onChange={(e, value) => handleFilterChange('logPRange', value)}
                    valueLabelDisplay="auto"
                    min={-10}
                    max={10}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>PSA Range</Typography>
                  <Slider
                    value={filters.psaRange}
                    onChange={(e, value) => handleFilterChange('psaRange', value)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={200}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Max Phase</InputLabel>
                    <Select
                      value={filters.maxPhase}
                      onChange={(e) => handleFilterChange('maxPhase', e.target.value)}
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

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Molecule Type</InputLabel>
                    <Select
                      value={filters.moleculeType}
                      onChange={(e) => handleFilterChange('moleculeType', e.target.value)}
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

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ChEMBL ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Molecular Weight</TableCell>
                  <TableCell>LogP</TableCell>
                  <TableCell>PSA</TableCell>
                  <TableCell>Max Phase</TableCell>
                  <TableCell>Molecule Type</TableCell>
                  <TableCell>Development Phase</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {compounds.map((compound) => (
                  <TableRow
                    key={compound.chembl_id}
                    hover
                    onClick={() => navigate(`/compound/${compound.chembl_id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{compound.chembl_id}</TableCell>
                    <TableCell>{compound.pref_name}</TableCell>
                    <TableCell>{compound.full_mwt?.toFixed(2)}</TableCell>
                    <TableCell>{compound.alogp?.toFixed(2)}</TableCell>
                    <TableCell>{compound.psa?.toFixed(2)}</TableCell>
                    <TableCell>{compound.max_phase}</TableCell>
                    <TableCell>{compound.molecule_type}</TableCell>
                    <TableCell>{compound.development_phase}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={-1}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompoundSearch;