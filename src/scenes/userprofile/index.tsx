import { Box, Button, Typography, useTheme } from '@mui/material'
import { tokens } from '../../theme'
import Login from "../../components/auth/login/index"
import Signup from '../../components/auth/signup/index'
import Profile from '../../components/auth/profile/index'
import { useUserAuth } from "../../contexts/AuthContext";
import { useState } from 'react'
import React from 'react'

const UserProfile = ({atPane = 2}) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { user, userData, profileData, accountData } = useUserAuth();

  const [pane, setPane] = useState(!user ? 1 : atPane)

  return (
    <Box m='20px'>

      {pane === 0 && <Signup />}
      {pane === 1 && <Login />}

      {pane === 2 && <Profile user={user} userData={userData} profileData={profileData} accountData={accountData} />}

      {pane === 0 &&
      <Box display='flex' justifyContent='center' alignItems='center' mt='4rem' height='1rem'>
        <Typography
          variant="h5"
          color={colors.blueAccent[100]}
        >Got an account?
        </Typography>
        <Button onClick={()=>setPane(1)} sx={{left: '2rem', width:'8rem', fontSize:'14px', color:'white'}} color='info' variant='contained'>
          Login
        </Button>
      </Box>
      }

      {pane === 1 &&
        <Box display='flex' justifyContent='center' alignItems='center' mt='4rem' height='1rem'>
        <Typography
          variant="h5"
          color={colors.blueAccent[100]}
        >Need an account?
        </Typography>
        <Button onClick={()=>setPane(0)} sx={{left: '2rem', width:'8rem', fontSize:'14px', color:'white'}} color='info' variant='contained'>
          Sign up
        </Button>
        </Box>
      }
    </Box>
  )
}

export default UserProfile