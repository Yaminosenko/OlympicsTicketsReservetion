import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [offers, setOffers] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour la gestion des offres
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    offer_type: 'SOLO',
    description: '',
    price: '',
    available: true
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/admin/dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Accès non autorisé. Seuls les administrateurs peuvent accéder à cette page.');
        }
        throw new Error('Erreur lors du chargement des données');
      }

      const data = await response.json();
      setOffers(data.offers);
      setChartData(data.chart_data.labels.map((label, index) => ({
        name: label,
        ventes: data.chart_data.sales[index],
        revenue: data.chart_data.revenue[index]
      })));
      setGlobalStats(data.global_stats);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setFormData({
      name: '',
      offer_type: 'SOLO',
      description: '',
      price: '',
      available: true
    });
    setDialogOpen(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name,
      offer_type: offer.offer_type,
      description: offer.description,
      price: offer.price,
      available: offer.available
    });
    setDialogOpen(true);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver cette offre ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/admin/offers/${offerId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Offre désactivée avec succès');
        fetchAdminData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Erreur lors de la désactivation');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmitOffer = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const url = editingOffer
        ? `/api/admin/offers/${editingOffer.id}/`
        : '/api/admin/offers/';

      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingOffer ? 'Offre modifiée avec succès' : 'Offre créée avec succès');
        setDialogOpen(false);
        fetchAdminData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getOfferTypeColor = (type) => {
    const colors = {
      'SOLO': 'primary',
      'DUO': 'secondary',
      'FAMILY': 'success'
    };
    return colors[type] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && error.includes('non autorisé')) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Administration des Jeux Olympiques
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Cartes de statistiques globales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tickets Vendus
              </Typography>
              <Typography variant="h4" component="div">
                {globalStats.total_tickets || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Chiffre d'Affaires Total
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(globalStats.total_revenue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tickets Utilisés
              </Typography>
              <Typography variant="h4" component="div">
                {globalStats.used_tickets || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tickets Disponibles
              </Typography>
              <Typography variant="h4" component="div">
                {globalStats.available_tickets || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Gestion des Offres" />
          <Tab label="Statistiques des Ventes" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Gestion des Offres</Typography>
                <Button variant="contained" color="primary" onClick={handleCreateOffer}>
                  Créer une Offre
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Prix</TableCell>
                      <TableCell>Tickets Vendus</TableCell>
                      <TableCell>Chiffre d'Affaires</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={offer.offer_type_display}
                            color={getOfferTypeColor(offer.offer_type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(offer.price)}
                        </TableCell>
                        <TableCell>{offer.ticket_count}</TableCell>
                        <TableCell>
                          {formatCurrency(offer.revenue)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={offer.available ? 'Active' : 'Inactive'}
                            color={offer.available ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleEditOffer(offer)}
                            sx={{ mr: 1 }}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteOffer(offer.id)}
                            disabled={!offer.available}
                          >
                            Désactiver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Statistiques des Ventes par Offre
              </Typography>

              <Box sx={{ height: 400, mb: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'ventes' ? value : formatCurrency(value),
                        name === 'ventes' ? 'Ventes' : 'Chiffre d\'affaires'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="ventes" fill="#8884d8" name="Nombre de ventes" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Chiffre d'affaires" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography variant="h6" gutterBottom>
                Détails par Offre
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Offre</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Ventes</TableCell>
                      <TableCell>Chiffre d'Affaires</TableCell>
                      <TableCell>Moyenne par Vente</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={offer.offer_type_display}
                            color={getOfferTypeColor(offer.offer_type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{offer.ticket_count}</TableCell>
                        <TableCell>
                          {formatCurrency(offer.revenue)}
                        </TableCell>
                        <TableCell>
                          {offer.ticket_count > 0 ? formatCurrency(offer.revenue / offer.ticket_count) : formatCurrency(0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Dialog pour créer/modifier une offre */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOffer ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'offre"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type d'offre</InputLabel>
            <Select
              value={formData.offer_type}
              label="Type d'offre"
              onChange={(e) => setFormData({ ...formData, offer_type: e.target.value })}
            >
              <MenuItem value="SOLO">Solo - 1 personne</MenuItem>
              <MenuItem value="DUO">Duo - 2 personnes</MenuItem>
              <MenuItem value="FAMILY">Familiale - 4 personnes</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Prix"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmitOffer} variant="contained">
            {editingOffer ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;