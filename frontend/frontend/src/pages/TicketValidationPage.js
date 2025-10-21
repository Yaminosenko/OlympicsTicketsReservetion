import React, { useState, useRef } from 'react';
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import jsQR from 'jsqr';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://olympic-reservation-ticket.up.railway.app';

const TicketValidationPage = () => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Fonction pour traiter l'image et lire le QR code
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

      if (qrCode) {
        setQrCodeData(qrCode.data);
        setImageDialogOpen(false);
        setError('');
        setTimeout(() => handleVerifyTicket(), 500);
      } else {
        setError('Aucun QR code trouvé dans l\'image');
      }
    };

    img.onerror = () => {
      setError('Erreur lors du chargement de l\'image');
    };

    img.src = URL.createObjectURL(file);
  };

  const handleVerifyTicket = async () => {
    if (!qrCodeData.trim()) {
      setError('Veuillez entrer ou scanner un code QR');
      return;
    }

    setLoading(true);
    setError('');
    setTicketInfo(null);

    try {
      const token = localStorage.getItem('access_token');

      //console.log('Sending request to:', `${API_BASE_URL}/api/admin/verify-ticket/`);
      //console.log('With token:', token ? 'Present' : 'Missing');
      //console.log('With data:', { final_key: qrCodeData.trim() });

      const response = await fetch(`${API_BASE_URL}/api/admin/verify-ticket/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ final_key: qrCodeData.trim() })
      });

      const responseText = await response.text();
      //console.log('Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('Invalid JSON response from server');
      }

      if (response.ok) {
        setTicketInfo(data);
        setError('');
      } else {
        setError(data.error || `Erreur serveur (${response.status})`);
        setTicketInfo(null);
      }
    } catch (err) {
      console.error('Network error:', err);
      setError(`Erreur de connexion: ${err.message}`);
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
        setTicketInfo(prev => ({
          ...prev,
          is_used: true
        }));
        setQrCodeData('');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openImageDialog = () => {
    setImageDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Validation des Tickets
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Scannez ou importez une image de QR code pour valider un ticket
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
          placeholder="Collez le code QR, scannez avec la caméra, ou importez une image..."
          multiline
          rows={3}
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            onClick={openImageDialog}
            startIcon={<PhotoCameraIcon />}
          >
            Importer une Image
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

      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <PhotoCameraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Importer une image de QR code
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Sélectionnez une image contenant un QR code de ticket
          </Typography>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          <Button
            variant="contained"
            component="span"
            onClick={() => fileInputRef.current?.click()}
            fullWidth
            startIcon={<PhotoCameraIcon />}
            sx={{ mb: 2 }}
          >
            Choisir une image
          </Button>

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <Typography variant="caption" color="textSecondary">
            Formats supportés: JPG, PNG, GIF, WebP
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Instructions :
        </Typography>
        <Typography variant="body2" color="textSecondary">
          1. <strong>Import d'image</strong> : Cliquez sur "Importer une Image" et sélectionnez une photo du QR code<br/>
          2. <strong>Saisie manuelle</strong> : Collez le code QR dans le champ texte<br/>
          3. <strong>Vérification</strong> : Cliquez sur "Vérifier le Ticket" pour voir les informations<br/>
          4. <strong>Validation</strong> : Cliquez sur "Valider le Ticket" pour marquer comme utilisé
        </Typography>
      </Paper>
    </Box>
  );
};

export default TicketValidationPage;