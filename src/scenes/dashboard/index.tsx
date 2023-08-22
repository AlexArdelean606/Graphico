import { Tab, Tabs, useTheme, AppBar } from '@mui/material'
import { tokens } from '../../theme'
import { useUserAuth } from "../../contexts/AuthContext";
import { Box, Typography } from "@mui/material";
import "@mui/lab/TabPanel"
import Header from "../../components/Header";
import TabPanel from '@mui/lab/TabPanel';
import { ReactNode, SyntheticEvent, useState } from 'react';
import Users from '../users';
import CinemasSelectionDashboard from '../cinemas/dashboard_display';
import Admins from '../admins';
import React from 'react';
import CinemaManageApps from 'scenes/cinemamanageapps';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, userData } = useUserAuth();
  const [value, setValue] = useState(0);


  if (user && !userData) return (
    <>
      <Box m='20px'>
        <Header title={`Fetching administrator data`} subtitle={''} />
      </Box>
    </>
  )

  const currentTime = {
    hour: new Date().getHours(),
    minute: new Date().getMinutes()
  }

  const handleTabs = (e :SyntheticEvent, val :any) => {
    setValue(val)
  }

  return (
    <Box m="20px">
      <Header title="ADMIN DASHBOARD" subtitle={`Welcome, admin ${userData?.["username"]}`} />

      <Box m="20px">
        <Box
          m="40px 0 0 0"
          height="75vh"
        >
          <AppBar position='static' style={{backgroundColor: colors.blueAccent[600] }} >
            <Tabs
            value={value}
            onChange={handleTabs}
            TabIndicatorProps={{
              sx:{
                bgcolor: colors.gray[100]
              }
            }}
            sx={{
              "& button": {
                color: colors.gray[100]
              },
              "& button:hover": {
                backgroundColor: colors.blueAccent[500]
              },
              "& button.Mui-selected": {
                backgroundColor: colors.greenAccent[500]
              }
            }}
            >
              <Tab label="Users" />
              <Tab label="Cinemas" />
              <Tab label="Staff" />
            </Tabs>
          </AppBar>
          <TabPanel value={value} index={0}><Users/></TabPanel>
          <TabPanel value={value} index={1}><CinemasSelectionDashboard hour={currentTime.hour} minute={currentTime.minute} /></TabPanel>
          <TabPanel value={value} index={2}><Admins /></TabPanel>
        </Box>
      </Box>
    </Box>
  );

  interface TabPanelProps {
    children: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel({value, index, children} : TabPanelProps) {
    return <>
      {value===index && children}
    </>
  }

}

export default Dashboard
