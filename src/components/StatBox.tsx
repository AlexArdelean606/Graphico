import { Box, Typography, useTheme } from '@mui/material'
import { tokens } from '../theme'
import React from 'react'

export interface StatBoxInterface {
    title: string | number,
    subtitle: string,
    icon: React.ReactNode,
    onClicked?: () => void
}

const StatBox = ({ title, subtitle, icon, onClicked } :StatBoxInterface) => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  return (
    <Box onClick={onClicked} width='100%' m='0 30px'>
      <Box display='flex' justifyContent='space-between'>
        <Box>
          <Typography
            variant='h4'
            fontWeight='bold'
            sx={{ color: colors.gray[100] }}
            >
            {title}
          </Typography>
        </Box>
        {icon}
      </Box>
      <Box display='flex' justifyContent='space-between'>
        <Typography
          variant='h5'
          sx={{ color: colors.greenAccent[500] }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  )
}

export default StatBox