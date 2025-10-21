import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  // Données des épreuves
  const sports = [
    {
      name: "Athlétisme",
      description: "Découvrez les épreuves phares des JO avec les meilleurs athlètes mondiaux. Les compétitions se dérouleront au Stade de France.",
      icon: "🏃‍♂️"
    },
    {
      name: "Tennis de Table",
      description: "Vivez l'intensité des matchs de ping-pong avec les champions olympiques. Épreuves organisées à l'Arena Paris Sud.",
      icon: "🏓"
    },
    {
      name: "Cyclisme",
      description: "Parcours exceptionnels à travers Paris pour les épreuves sur route et compétitions en VTT au Vélodrome National.",
      icon: "🚴‍♀️"
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: 2,
          mb: 4
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Jeux Olympiques Paris 2024
        </Typography>
        <Typography variant="h5" sx={{ mb: 4 }}>
          Vivez l'expérience olympique du 26 juillet au 11 août 2024
        </Typography>

        {!isAuthenticated ? (
          <Box sx={{ '& > *': { m: 1 } }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ color: 'white' }}
            >
              S'inscrire
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Connexion
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/offers')}
            sx={{ color: 'white' }}
          >
            Acheter des billets
          </Button>
        )}
      </Box>
      <Paper elevation={3} sx={{ p: 4, mb: 6, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
          Bienvenue aux JO 2024
        </Typography>
        <Typography paragraph>
          Paris accueille les Jeux Olympiques pour la troisième fois de son histoire après 1900 et 1924.
          Cet événement mondial rassemblera plus de 10,000 athlètes venus de 200 pays différents.
        </Typography>
        <Typography paragraph>
          Les compétitions se dérouleront sur des sites iconiques comme la Tour Eiffel, le Château de Versailles
          et le Stade de France, mêlant patrimoine historique et modernité.
        </Typography>
        <Typography paragraph>
          Engagez-vous dans l'aventure olympique en réservant dès maintenant vos billets pour assister
          aux performances des plus grands sportifs de la planète.
        </Typography>
      </Paper>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
        Épreuves à ne pas manquer
      </Typography>
      <Grid container spacing={4}>
        {sports.map((sport, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.03)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h5"
                  component="h3"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>{sport.icon}</span>
                  {sport.name}
                </Typography>
                <Typography>
                  {sport.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate('/offers')}
                >
                  Voir les billets
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}