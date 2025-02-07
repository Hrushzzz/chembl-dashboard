import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from 'axios';
import { OCL } from 'openchemlib-js';

const CompoundDetail = () => {
  const { chemblId } = useParams();
  const [compound, setCompound] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [structureImage, setStructureImage] = useState(null);

  useEffect(() => {
    fetchCompoundDetails();
  }, [chemblId]);

  const fetchCompoundDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/compounds/${chemblId}`);
      setCompound(response.data);
      
      if (response.data.canonical_smiles) {
        generateStructureImage(response.data.canonical_smiles);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateStructureImage = (smiles) => {
    try {
      const molecule = OCL.Molecule.fromSmiles(smiles);
      const svgImage = molecule.toSVG(300, 200);
      setStructureImage(svgImage);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!compound) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              {compound.pref_name || compound.chembl_id}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Structure
              </Typography>
              {structureImage && (
                <div dangerouslySetInnerHTML={{ __html: structureImage }} />
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Development Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Development Phase" 
                    secondary={compound.development_phase || 'Not specified'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Mechanism of Action" 
                    secondary={compound.mechanism_of_action || 'Not specified'} 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Properties" />
              <Tab label="Targets" />
              <Tab label="Activities" />
            </Tabs>
            <CardContent>
              {tabValue === 0 && (
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Molecular Weight" 
                      secondary={compound.full_mwt?.toFixed(2)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="LogP" 
                      secondary={compound.alogp?.toFixed(2)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Hydrogen Bond Donors" 
                      secondary={compound.hbd} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Hydrogen Bond Acceptors" 
                      secondary={compound.hba} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Polar Surface Area" 
                      secondary={`${compound.psa?.toFixed(2)} Å²`} 
                    />
                  </ListItem>
                </List>
              )}
              {tabValue === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Target Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Organism</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {compound.targets?.map((target, index) => (
                        <TableRow key={index}>
                          <TableCell>{target.target_name}</TableCell>
                          <TableCell>{target.target_type}</TableCell>
                          <TableCell>{target.organism}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {tabValue === 2 && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Units</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {compound.activities?.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell>{activity.standard_type}</TableCell>
                          <TableCell>{activity.standard_value}</TableCell>
                          <TableCell>{activity.standard_units}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompoundDetail;