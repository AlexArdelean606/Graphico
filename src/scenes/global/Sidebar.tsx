import React, { useState } from "react"
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar'
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import { Link, useNavigate } from 'react-router-dom'
import { tokens } from '../../theme'
import 'react-pro-sidebar/dist/css/styles.css'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import BookIcon from '@mui/icons-material/Book';
import { useUserAuth } from "../../contexts/AuthContext"
import {CINEMAS_SELECTION, USERPROFILE, USERS, SETTINGS, DASHBOARD, MYBOOKINGS} from "../types"
import SettingsIcon from '@mui/icons-material/Settings';

interface ItemProps {
    title: string
    to: string
    icon: JSX.Element
}

const Item = ({ title, to, icon } :ItemProps ) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={false}
      style={{
        color: colors.gray[100],
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  const navigateTo = useNavigate();

  const [isCollapsed, setCollapsed] = useState(false)
  const { user, userData, accountData } = useUserAuth();

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
        height:"100vh"
      }}
    >

      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.gray[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <img width='150px' src={ require(theme.palette.mode === "light" ? "../../assets/GRAPHICO_light.png" : "../../assets/GRAPHICO.png") }></img>
                <IconButton onClick={() => setCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="default_pfp"
                  width="100px"
                  height="100px"
                  src={require(user ? "../../assets/default_pfp.png" : "../../assets/guest_pfp.png")}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                  onClick={()=>{navigateTo(USERPROFILE)}}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={user ? colors.gray[100] : colors.greenAccent[500]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {userData?.["username"] || "Guest"}
                </Typography>
                <Typography
                  variant="h5"
                  color={colors.greenAccent[500]}
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user ? (accountData?.["role"] === 2 ? "Administrator" : "Member") : ""}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Home"
              to="/"
              icon={<HomeOutlinedIcon />}
            />
            {
            accountData?.["role"] === 2 &&
            <Item
              title="Admin Dashboard"
              to={DASHBOARD}
              icon={<AdminPanelSettingsIcon />}
            />
            }
            <Typography
              variant="h6"
              color={colors.gray[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Catalogs
            </Typography>
            <Item
              title="Cinemas Selection"
              to={CINEMAS_SELECTION}
              icon={<LocalMoviesIcon />}
            />
            <Typography
              variant="h6"
              color={colors.gray[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="Your Profile"
              to={USERPROFILE}
              icon={<PersonOutlinedIcon />}
            />
            <Item
              title="Settings"
              to={SETTINGS}
              icon={<SettingsIcon />}
            />
            <Item
              title="Your Bookings"
              to={MYBOOKINGS}
              icon={<BookIcon />}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  )
}

export default Sidebar