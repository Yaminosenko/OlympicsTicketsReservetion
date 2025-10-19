import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserTicketsPage from './pages/UserTicketsPage';
import AdminPage from './pages/AdminPage';
import NavBar from './components/NavBar';
import {AuthProvider} from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import TicketValidationPage from './pages/TicketValidationPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0055A4',
    },
    secondary: {
      main: '#EF4135',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-tickets" element={<PrivateRoute><UserTicketsPage /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>}/>
            <Route path="/admin/validate-tickets" element={<AdminRoute><TicketValidationPage /></AdminRoute>}/>
            </Routes>
         </AuthProvider>
        </Router>
    </ThemeProvider>
  );
}

/*export default function App() {
  return <h1 style={{ color: 'red' }}>Hello World</h1>;
}*/

export default App;