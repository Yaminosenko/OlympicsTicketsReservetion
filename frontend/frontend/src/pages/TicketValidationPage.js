import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API_BASE_URL = 'http://127.0.0.1:8000';

const TicketValidationPage = () => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerifyTicket = async () => {
    if (!qrCodeData.trim()) {
      setError('Veuillez entrer le code QR du ticket');
      return;
    }

    setLoading(true);
    setError('');
    setTicketInfo(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/verify-ticket/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ final_key: qrCodeData.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setTicketInfo(data);
        setError('');
      } else {
        setError(data.error || 'Erreur lors de la vérification du ticket');
        setTicketInfo(null);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setTicketInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateTicket = async () => {
    if (!ticketInfo) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketInfo.ticket_id}/validate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Mettre à jour les infos du ticket
        setTicketInfo(prev => ({
          ...prev,
          is_used: true
        }));
        setQrCodeData(''); // Réinitialiser pour le prochain scan
      } else {
        setError(data.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQrCodeData('');
    setTicketInfo(null);
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Validation des Tickets
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Scannez ou entrez manuellement le code QR d'un ticket pour le valider
      </Typography>

      {/* Zone de saisie du QR code */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <QrCodeScannerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Saisie du code QR
        </Typography>

        <TextField
          fullWidth
          label="Code QR du ticket"
          value={qrCodeData}
          onChange={(e) => setQrCodeData(e.target.value)}
          placeholder="Collez ou scannez le code QR ici..."
          multiline
          rows={3}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleVerifyTicket}
            disabled={loading || !qrCodeData.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <QrCodeScannerIcon />}
          >
            Vérifier le Ticket
          </Button>

          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            Réinitialiser
          </Button>
        </Box>
      </Paper>

      {/* Messages d'erreur/succès */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Affichage des informations du ticket */}
      {ticketInfo && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Informations du Ticket
          </Typography>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    {ticketInfo.user.first_name} {ticketInfo.user.last_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {ticketInfo.user.email}
                  </Typography>
                </Box>

                <Chip
                  label={ticketInfo.is_used ? "DÉJÀ UTILISÉ" : "VALIDE"}
                  color={ticketInfo.is_used ? "error" : "success"}
                  icon={ticketInfo.is_used ? <CancelIcon /> : <CheckCircleIcon />}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Offre
                  </Typography>
                  <Typography variant="body1">
                    {ticketInfo.offer.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {ticketInfo.offer.type}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Prix
                  </Typography>
                  <Typography variant="body1">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(ticketInfo.offer.price)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Date d'achat
                  </Typography>
                  <Typography variant="body1">
                    {new Date(ticketInfo.purchase_date).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Bouton de validation */}
          {!ticketInfo.is_used && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={handleValidateTicket}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                sx={{ minWidth: 200 }}
              >
                Valider le Ticket
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Instructions :
        </Typography>
        <Typography variant="body2" color="textSecondary">
          1. Scannez le QR code du ticket avec un lecteur externe<br/>
          2. Collez le code dans le champ ci-dessus<br/>
          3. Cliquez sur "Vérifier le Ticket" pour voir les informations<br/>
          4. Cliquez sur "Valider le Ticket" pour marquer comme utilisé
        </Typography>
      </Paper>
    </Box>
  );
};

export default TicketValidationPage;