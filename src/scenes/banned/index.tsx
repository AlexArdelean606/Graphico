import { Box, Typography, useTheme } from "@mui/material"
import { tokens } from "../../theme"
import Header from "../../components/Header"
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import React from "react"
import { useUserAuth } from "contexts/AuthContext"

const Banned = () => {
  const theme = useTheme()

  return (
  <Box m='20px'>
    <Box display='flex' justifyContent='space-between' alignItems='center' >
      <Header title="BLOCKED" subtitle="Unrestricted access" />
    </Box>

    {/* GRID */}
    <Box
        display='flex'
        flexDirection='column'
        height='75vh'
        width='100%'
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        gap='20px'
    >
        <RemoveCircleIcon sx={{ fontSize: 200 }} color='error' />
        <Typography variant='h1'>Your access to Graphico has been blocked.</Typography>
        <Typography variant='h2'>We apologize for this inconvenience.</Typography>
    </Box>
  </Box>
  )
}

export default Banned