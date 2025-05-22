import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  boxShadow: 'none',
}));

const NavBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Logo/Titre avec lien vers Home */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1
          }}
        >
          <SportsScoreIcon sx={{ mr: 1, fontSize: '2rem' }} />
          <Typography variant="h6" component="div">
            Jeux Olympiques Paris 2024
          </Typography>
        </Box>

        {/* Section utilisateur*/}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated && user && (
            <>
              {/* Bouton "Mes billets" (visible seulement si connecté) */}
              <Button
                color="inherit"
                component={Link}
                to="/my-tickets"
                startIcon={<ConfirmationNumberIcon />}
                sx={{
                  display: { xs: 'none', sm: 'flex' }, // Caché sur mobile
                  mr: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Mes billets
              </Button>

              {/* Version icône seule pour mobile */}
              <IconButton
                color="inherit"
                component={Link}
                to="/my-tickets"
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  mr: 1
                }}
              >
                <ConfirmationNumberIcon />
              </IconButton>
            </>
          )}

          {isAuthenticated && user ? (
            <>
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 36,
                  height: 36
                }}
              >
                {user.email.charAt(0).toUpperCase()}
              </Avatar>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  ml: 1,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ mr: 1 }}
              >
                Connexion
              </Button>
              <Button
                color="secondary"
                variant="contained"
                component={Link}
                to="/register"
              >
                Inscription
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default NavBar;