// SuperUserCreator.js
import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';

const SuperUserCreator = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('username', formData.username);

      const response = await fetch('https://olympic-reservation-ticket.up.railway.app/api/secret-superuser/', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Superuser créé avec succès !');
        setFormData({ username: '', email: '', password: '' });
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Créer un Superuser
        </Typography>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

            <form onSubmit={handleSubmit}>
          {/* Email en premier - champ requis */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            margin="normal"
            required
          />
          {/* Password - champ requis */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            margin="normal"
            required
          />
          {/* Username - optionnel */}
          <TextField
            fullWidth
            label="Username (optionnel)"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Créer le Superuser
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default SuperUserCreator;