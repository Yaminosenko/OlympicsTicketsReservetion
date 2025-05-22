import React, { useState, useEffect, useContext } from 'react';
import { Container, Grid, Card, CardContent, CardActions, Typography, Button, Snackbar } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get('/api/ticket-offers/');
        setOffers(response.data);
      } catch (err) {
        setError('Failed to load offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handlePurchase = async (offerId) => {
    if (!isAuthenticated) {
      setSnackbarMessage('Please login to purchase tickets');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await api.post('/api/tickets/purchase/', { offer_id: offerId });
      setSnackbarMessage('Ticket purchased successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to purchase ticket. Please try again.');
      setSnackbarOpen(true);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Available Ticket Offers</Typography>
      <Grid container spacing={3}>
        {offers.map((offer) => (
          <Grid item key={offer.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {offer.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                  {offer.get_offer_type_display}
                </Typography>
                <Typography variant="body2">
                  {offer.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  €{offer.price.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handlePurchase(offer.id)}
                  disabled={!offer.available}
                >
                  {offer.available ? 'Purchase' : 'Sold Out'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default OffersPage;