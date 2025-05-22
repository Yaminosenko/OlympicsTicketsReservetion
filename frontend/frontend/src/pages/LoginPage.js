import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Link } from '@mui/material';
//import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

   try {

      const success = await login(
        formData.email.toLowerCase().trim(),
        formData.password
      );

      if (success) {

        navigate('/');
      } else {
        setError('Identifiants incorrects');
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError(error.response?.data?.detail || "Échec de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

 /* try {
    const response = await api.post('/api/auth/login/', {
      email: formData.email.toLowerCase().trim(),  // Doit correspondre au champ backend
      password: formData.password
    });


    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    navigate('/');

  } catch (error) {
    console.error("Erreur de connexion:", error.response?.data);
    setError(error.response?.data?.error || "Échec de la connexion");
  }
};*/

return (
    <Container maxWidth="sm">
      <Box sx={{
        mt: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography component="h1" variant="h5">
          Connexion
        </Typography>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            error={!!error}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            error={!!error}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/register" variant="body2">
              Pas de compte ? Inscrivez-vous
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}