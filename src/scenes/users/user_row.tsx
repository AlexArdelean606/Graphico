import { Box, Typography, IconButton, useTheme, Tooltip } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import React from 'react'
import { tokens } from '../../theme';
import "./user_row.css"
import { useNavigate } from 'react-router-dom'
import { USER } from '../types';
import { DocumentData } from 'firebase/firestore';
import { useUserAuth } from 'contexts/AuthContext';

function rank(number :number) {
  if (number === 1) return "Member"
  if (number === 2) return "Administrator"
}

interface UserRowProps {
    user: DocumentData,
    unbanModal: () => void,
    restrictAccessModal: () => void
}


function UserRow({user: userrow_entry, unbanModal, restrictAccessModal} :UserRowProps) {


    const theme = useTheme();
    const navigateTo = useNavigate();

    const colors = tokens(theme.palette.mode);

    const { user } = useUserAuth()


  function goToProfile(user_id :number) {
    return navigateTo(USER.replace(":userid", user_id.toString()))
  }

  interface UserRowButtonProps {
    icon: React.ReactNode
    text: string
    onClick: () => void
    alt?: string
    sx?: React.CSSProperties
    enabled?: boolean
  }

  function UserRowButton({icon, text, onClick, alt="", sx={}, enabled=true} :UserRowButtonProps) {

    if (enabled) return (
    <Tooltip arrow title={<span style={{fontSize:'.75rem'}}>{alt}</span>}>
      <IconButton onClick={onClick} sx={{...sx, borderRadius:'0', padding:'1rem', alignSelf:'center', gap:'.5rem'}}>
        {icon}
        <Typography color={sx?.["color"] || colors.primary[100]} variant="h4">{text}</Typography>
      </IconButton>
    </Tooltip>
    )

    return (
    <IconButton disabled onClick={onClick} sx={{...sx, borderRadius:'0', padding:'1rem', alignSelf:'center', gap:'.5rem'}}>
        {icon}
        <Typography color={sx?.["color"] || colors.primary[100]} variant="h4">{text}</Typography>
    </IconButton>
    )
  }

  return (
    <>
      <Box
        className='mouse-pointer-users'
        display='flex'
        flexDirection='row'
        gap='1rem'
        m='2rem 0'
      >
        <img
          alt="default_pfp"
          width="75px"
          height="75px"
          src={require("../../assets/default_pfp.png")}
          style={{ borderRadius: "50%" }}
        />
        <Box
          display='flex'
          width='80%'
          flexDirection='row'
          justifyContent='space-between'
        >
          <Box
          display='flex'
          flexDirection='column'
          justifyContent='space-around'
          width='10%'
          >
            <Typography color={colors.greenAccent[500]} variant="h3">{`${userrow_entry["username"]}`}</Typography>
            <Typography color={colors.primary[100]} variant="h5">{`${rank(userrow_entry["role"])}`}</Typography>
          </Box>
          <Box
            display='grid'
            gridTemplateColumns='repeat(3, 100px)'
            gap='3rem'
          >
            <UserRowButton icon={<VisibilityIcon/>} text={'View'} alt={`Access ${userrow_entry["username"]}'s profile page`} onClick={() => goToProfile(userrow_entry["id"])} />
            { userrow_entry["account_id"] === user.uid &&
                <UserRowButton enabled={false} icon={<NotInterestedIcon/>} text={'Ban'} alt={`You can't ban yourself.`} onClick={()=>{}} />
            }
            { userrow_entry["account_id"] !== user.uid && !userrow_entry["banned"] &&
                <UserRowButton icon={<NotInterestedIcon/>} text={'Ban'} alt={`Restrict ${userrow_entry["username"]}'s access to Graphico`} onClick={restrictAccessModal} sx={{color:'red'}}/>
            }
            { userrow_entry["account_id"] !== user.uid && userrow_entry["banned"] &&
                <UserRowButton icon={<NotInterestedIcon/>} text={'Unban'} alt={`Revoke ${userrow_entry["username"]}'s ban from Graphico`} onClick={unbanModal} />
            }
          </Box>
        </Box>
      </Box>
    </>
  )
}


export default UserRow