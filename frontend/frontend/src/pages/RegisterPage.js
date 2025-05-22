import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Link } from '@mui/material';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     if (formData.password !== formData.confirm_password) {
    setErrors({ confirm_password: 'Les mots de passe ne correspondent pas' });
    return;
  }

  try {
    const payload = {
      username: formData.username,
      email: formData.email.toLowerCase().trim(),
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
      password2: formData.confirm_password
    };

    console.log("Payload envoyé:", payload);

    const response = await api.post('/api/auth/register/', payload);
    console.log("Réponse:", response.data);

    // Connexion automatique
    const loginResponse = await api.post('/api/auth/login/', {
      email: formData.email.toLowerCase().trim(),
      password: formData.password
    });

    localStorage.setItem('access_token', loginResponse.data.access);
    localStorage.setItem('refresh_token', loginResponse.data.refresh);
    navigate('/');

  } catch (error) {
    console.error("Erreur détaillée:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.response?.config
    });

    if (error.response?.data) {
      setErrors(error.response.data);
    } else {
      setErrors({ general: "Erreur réseau ou serveur" });
    }
  }
};

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Inscription
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nom d'utilisateur"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Prénom"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={!!errors.first_name}
            helperText={errors.first_name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nom"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={!!errors.last_name}
            helperText={errors.last_name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password || "Minimum 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial"}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirm_password"
            label="Confirmez le mot de passe"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            error={!!errors.confirm_password}
            helperText={errors.confirm_password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            S'inscrire
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              Déjà un compte ? Connectez-vous
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}