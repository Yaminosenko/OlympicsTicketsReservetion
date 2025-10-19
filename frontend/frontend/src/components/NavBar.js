import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

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

 const isAdmin = user && (user.is_staff || user.is_superuser);

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
                {isAdmin && (
                  <>
                    {/* Lien existant vers l'admin */}
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin"
                      startIcon={<AdminPanelSettingsIcon />}
                      sx={{
                        display: { xs: 'none', sm: 'flex' },
                        mr: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Administration
                    </Button>

                    {/* NOUVEAU : Lien vers la validation des tickets */}
                    <Button
                      color="inherit"
                      component={Link}
                      to="/admin/validate-tickets"
                      startIcon={<QrCodeScannerIcon />}
                      sx={{
                        display: { xs: 'none', sm: 'flex' },
                        mr: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Valider Tickets
                    </Button>

                    {/* Versions mobiles */}
                    <IconButton
                      color="inherit"
                      component={Link}
                      to="/admin/validate-tickets"
                      sx={{
                        display: { xs: 'flex', sm: 'none' },
                        mr: 1
                      }}
                    >
                      <QrCodeScannerIcon />
                    </IconButton>
                  </>
                )}

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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Badge admin à côté de l'avatar */}
                {isAdmin && (
                  <AdminPanelSettingsIcon
                    sx={{
                      fontSize: '1rem',
                      color: 'gold',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  />
                )}
                <Avatar
                  sx={{
                    bgcolor: isAdmin ? 'gold' : 'secondary.main',
                    width: 36,
                    height: 36,
                    color: isAdmin ? 'black' : 'white',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}
                >
                  {user.email.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
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