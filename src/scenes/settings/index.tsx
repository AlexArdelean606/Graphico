import { Box, Typography, useTheme, IconButton, Button, Icon } from "@mui/material";
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { ColorModeContext, tokens } from "../../theme";
import Header from "../../components/Header";
import { useContext } from "react";
import React from "react";

const Settings = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext)


  return (
    <Box m="20px">
      <Header title="SETTINGS" subtitle=" " />
      <Box
        display='flex'
        flexDirection='row'
        justifyContent='center'
        alignItems='center'
        gap='5rem'
      >
        <Typography
          variant="h3"
          color={colors.primary[100]}
        >Website appearance
        </Typography>
        <Box
          sx={{ gridColumn: '3'}}
        >
          {theme.palette.mode === 'dark' ?
            <Button sx={{fontSize: '18px', fontWeight: 'bold', color:`${colors.primary[100]}`}} startIcon={<DarkModeOutlinedIcon />} onClick={colorMode.toggleColorMode}>
              Dark mode
            </Button>
          : <Button sx={{fontSize: '18px', fontWeight: 'bold', color:`${colors.primary[100]}`}} endIcon={<LightModeOutlinedIcon />} onClick={colorMode.toggleColorMode}>
            Light mode
          </Button>
          }
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;