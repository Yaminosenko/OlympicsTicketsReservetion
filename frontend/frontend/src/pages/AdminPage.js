import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../services/api';


export default function AdminPage() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin-stats/');
        setStats(response.data);
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mt: 4, mb: 4 }}>
        Statistiques d'administration
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Offre</TableCell>
              <TableCell align="right">Ventes</TableCell>
              <TableCell>Dernière mise à jour</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.offer.id}>
                <TableCell>{stat.offer.name}</TableCell>
                <TableCell align="right">{stat.sales_count}</TableCell>
                <TableCell>
                  {new Date(stat.last_updated).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}