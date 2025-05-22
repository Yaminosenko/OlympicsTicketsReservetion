import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/api/tickets/');
        setTickets(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des billets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    }
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 4 }}>
        Mes billets
      </Typography>

      {tickets.length === 0 ? (
        <Typography variant="body1">Aucun billet acheté pour le moment</Typography>
      ) : (
        tickets.map(ticket => (
          <Card key={ticket.id} sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="div">
                  {ticket.offer.name}
                </Typography>
                <Chip
                  label={ticket.is_used ? "Utilisé" : "Valide"}
                  color={ticket.is_used ? "error" : "success"}
                />
              </Box>

              <Typography variant="body1" color="text.secondary">
                <strong>Date d'achat:</strong> {new Date(ticket.purchase_date).toLocaleString()}
              </Typography>

              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Clé du billet:</strong> {ticket.final_key.substring(0, 8)}... (masqué)
              </Typography>

              {ticket.qr_code_url && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="subtitle1">QR Code d'accès</Typography>
                  <CardMedia
                    component="img"
                    image={ticket.qr_code_url || `${ticket.qr_code}`}
                    alt="QR Code du billet"
                    sx={{
                      width: 200,
                      height: 200,
                      mx: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: 1
                    }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Présentez ce code à l'entrée
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}