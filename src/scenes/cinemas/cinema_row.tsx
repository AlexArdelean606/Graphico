import { Box, Card, IconButton, Tooltip, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { tokens } from '../../theme';
import { CINEMA } from '../types';
import './cinema_row.css'
import BrushIcon from '@mui/icons-material/Brush';
import { DocumentData } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { isTime1Ibetween } from 'utils/dateToText';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../firebase';
import ReplayIcon from '@mui/icons-material/Replay';


function CinemaRow({cinema, currentTime, removeCinemaModal, editCinemaModal, resetCinemaModal, onDashboard = false} :{
    currentTime :{hour :number, minute :number},
    cinema: DocumentData,
    removeCinemaModal: () => void,
    editCinemaModal: () => void,
    resetCinemaModal: () => void,
    onDashboard?: boolean
}) {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigateTo = useNavigate();


  const [imgPath, setImgPath] = useState("");
  useEffect(() => {
    getDownloadURL(ref(storage, `cinema_pictures/${cinema["picture"]}`)).then(url => setImgPath(url))
  }, [cinema["picture"]]);


  interface UserRowButtonProps {
    icon: React.ReactNode
    text: string
    onClick: () => void
    alt?: string
    sx?: React.CSSProperties
  }

  function UserRowButton({icon, text, onClick, alt="", sx={}} :UserRowButtonProps) {
    return <Tooltip arrow title={<span style={{fontSize:'.75rem'}}>{alt}</span>}>
      <IconButton onClick={onClick} sx={{...sx, borderRadius:'0', padding:'1rem', alignSelf:'center', gap:'.5rem'}}>
        {icon}
        <Typography color={sx?.["color"] || colors.primary[100]} variant="h4">{text}</Typography>
      </IconButton>
    </Tooltip>
  }

  function goToCinemaPage(cinema_id :number) {
    console.log(cinema_id)
    return navigateTo(CINEMA.replace(":cinemaid", cinema_id.toString() ))
  }

  return (
    <>
    {!onDashboard &&
      <Box
        className='mouse-pointer-cinemas-nodash'
        display='flex'
        flexDirection='row'
        gap='1rem'
        m='2rem 0'
        onClick={() => goToCinemaPage(cinema["id"])}
      >
        <Box
            display='flex'
            flexDirection='column'
            justifyItems='center'
            alignItems='center'
        >
            <img
            alt="cinema"
            width="270px"
            height="150px"
            src={imgPath}
            style={{ borderRadius: "25px 25px 0% 0%" }}
            />
            {   isTime1Ibetween(currentTime,  {opening_hour:cinema["opening_hour"], opening_minute:cinema["opening_minute"], closing_hour:cinema["closing_hour"], closing_minute:cinema["closing_minute"]}) &&
                <>
                    <Typography variant='h4' sx={{width: '100%', textAlign:'center', borderRadius:"0 0 25px 25px", bgcolor:colors.primary[900]}} color={colors.primary[100]}>OPEN</Typography>
                    <Typography color={colors.primary[100]}>{`Closes at ${ ('0'+cinema["closing_hour"].toString()).slice(-2) }:${ ('0'+cinema["closing_minute"].toString()).slice(-2)}`}</Typography>
                </>
            }
            {   !isTime1Ibetween(currentTime,  {opening_hour:cinema["opening_hour"], opening_minute:cinema["opening_minute"], closing_hour:cinema["closing_hour"], closing_minute:cinema["closing_minute"]}) &&
                <>
                    <Typography variant='h4' sx={{width: '100%', textAlign:'center', borderRadius:"0 0 25px 25px", bgcolor:colors.primary[500]}} color={theme.palette.mode === "dark" ? colors.primary[200] : colors.primary[900] }>CLOSED</Typography>
                    <Typography color={colors.primary[200]}>{`Opens at ${ ('0'+cinema["opening_hour"].toString()).slice(-2) }:${ ('0'+cinema["opening_minute"].toString()).slice(-2)}`}</Typography>
                </>
            }

        </Box>

        <Box
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          padding='.8rem 0px 1.5rem 0px'
          >
          <Typography color={colors.greenAccent[500]} variant="h1">{`${cinema["name"]}`}</Typography>
          <Box>
            <Typography color={colors.primary[100]} variant="h3">{`${cinema["country"]}`}</Typography>
            <Typography color={colors.primary[100]} variant="h2">{`${cinema["city"]}`}</Typography>
          </Box>
        </Box>
      </Box>
      }
    {onDashboard &&
      <Box
        className='mouse-pointer-cinemas'
        display='flex'
        flexDirection='row'
        gap='1rem'
        m='2rem 0'
      >
        <img
          alt="cinema"
          width="150px"
          height="100px"
          src={imgPath}
          style={{ borderRadius: "10%" }}
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
          justifyContent='space-evenly'
          >
          <Typography color={colors.greenAccent[500]} variant="h2">{`${cinema["name"]}`}</Typography>
          <Typography color={colors.primary[100]} variant="h4">{`${cinema["country"]}, ${cinema["city"]}`}</Typography>
        </Box>
        <Box
            display='grid'
            gridTemplateColumns='repeat(4, 100px)'
            gap='3rem'
          >
            <UserRowButton icon={<VisibilityIcon/>} text={'View'} alt={`Access ${cinema["name"]} page`} onClick={() => goToCinemaPage(cinema["id"])} />
            <UserRowButton icon={<DeleteIcon/>} text={'Remove'} alt={`Remove ${cinema["name"]} from Graphico`} onClick={removeCinemaModal} sx={{color:'red'}}/>
            <UserRowButton icon={<BrushIcon/>} text={'Edit'} alt={`Modify ${cinema["name"]} information`} onClick={editCinemaModal} sx={{color:theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500]}}/>
            <UserRowButton icon={<ReplayIcon/>} text={'Reset'} alt={`Revert ${cinema["name"]} information to default`} onClick={resetCinemaModal} sx={{color:theme.palette.mode==='dark' ? colors.blueAccent[500] : colors.blueAccent[500]}}/>
          </Box>
        </Box>
      </Box>
      }
    </>
  )
}


export default CinemaRow