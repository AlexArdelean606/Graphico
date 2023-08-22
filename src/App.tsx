import { ColorModeContext, useMode } from './theme';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { UserAuthContextProvider } from "./contexts/AuthContext";
import { CINEMAS_SELECTION, HOME, USERPROFILE, CINEMA, USER, SETTINGS, DASHBOARD, BANNED, MYBOOKINGS} from "./scenes/types";
import Sidebar from './scenes/global/Sidebar';
import Home from './scenes/home';
import CinemasSelection from './scenes/cinemas';
import Cinema from './scenes/cinema';
import Settings from './scenes/settings';
import UserProfile from './scenes/userprofile';
import User from './scenes/user';
import Dashboard from './scenes/dashboard';
import { ProtectedRoute } from './utils/ProtectedRoute';
import React from 'react';
import Banned from 'scenes/banned';
import { Elements } from '@stripe/react-stripe-js';
import { publishableKey } from './stripe';
import { loadStripe } from '@stripe/stripe-js';
import MyBookings from 'scenes/mybookings';

function App() {

  const [theme, colorMode] = useMode()
  const stripePromise = loadStripe(`${publishableKey!}`);

  return (
    // @ts-ignore
    <ColorModeContext.Provider value={colorMode}>
      <UserAuthContextProvider>
      {/*@ts-ignore*/}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className='content'>
            <Routes>
              <Route path={CINEMA} element={ <Elements stripe={stripePromise}> <Cinema /> </Elements> } />
              <Route path={CINEMAS_SELECTION} element={ <CinemasSelection />  } />
              <Route path="/cinema" element={ <CinemasSelection /> } />
              <Route path={HOME} element={ <Home /> } />
              <Route path={SETTINGS} element={ <Settings /> } />
              <Route path={MYBOOKINGS} element={ <MyBookings /> } />
              <Route path={USERPROFILE} element={ <UserProfile />  } />
              <Route path="/user" element={ <UserProfile /> } />
              <Route path={USER} element={ <User /> } />
              <Route path={DASHBOARD} element={<ProtectedRoute role={2}><Dashboard /></ProtectedRoute>} />
              <Route path={BANNED} element={<Banned />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
      </UserAuthContextProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
