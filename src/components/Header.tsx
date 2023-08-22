import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from '../theme'
import React from "react";

export interface HeaderInterface {
    title: string,
    subtitle: string
}

const Header = ({ title, subtitle } :HeaderInterface) => {

  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  return (
    <Box mb='30px'>
      <Typography
        variant="h2"
        color={colors.gray[100]}
        fontWeight="bold"
        sx={{ mb: '5px' }}
      >{title}</Typography>
      <Typography
        variant="h5"
        color={colors.greenAccent[400]}
      >{subtitle}</Typography>
    </Box>
  )
}

export default Header