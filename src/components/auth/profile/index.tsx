import { Box, Button, IconButton, Typography, useTheme} from '@mui/material'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Header'
import { useUserAuth } from '../../../contexts/AuthContext';
import { tokens } from '../../../theme';
import React from 'react';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import './profile.css'
import BrushIcon from '@mui/icons-material/Brush';
import LogoutIcon from '@mui/icons-material/Logout';
import { whereQuery } from 'actions';
import UserComment from './user_comment';
import UserReview from './user_review';


export interface ProfileInterface {
    user: User,
    userData: DocumentData,
    profileData :DocumentData,
    accountData :DocumentData
}

const Profile = ({user, userData, profileData, accountData} : ProfileInterface) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [userComments, setUserComments] = useState<DocumentData[]>([]);
    const [userCommentsLoading, setUserCommentsLoading] = useState(true);

    const [userReviews, setUserReviews] = useState<DocumentData[]>([]);
    const [userReviewsLoading, setUserReviewsLoading] = useState(true);

    const {logOut} = useUserAuth();

    useEffect(() => { 
        let userComms :DocumentData[] = [];

        whereQuery('cinema_comments', 'created_by', user.uid, '==').then((res) => {
            res.forEach((doc) => {
                if (doc["deleted"] === 0){
                    userComms.push({...doc, nickname: userData["username"]});
                }
            } );
            
            setUserComments(userComms);
            setUserCommentsLoading(false);
        });
    }, []);

    useEffect(() => {
        let userRevs :DocumentData[] = [];

        whereQuery('cinema_reviews', 'created_by', user.uid, '==').then((res) => {
            res.forEach((doc) => {
                    userRevs.push({...doc, nickname: userData["username"]});
            } );            
            setUserReviews(userRevs);
            setUserReviewsLoading(false);
        });
    }, []);

  const navigateTo = useNavigate();

    const parseDate = (milliseconds: number, short: boolean = true) => {
        console.log(milliseconds);
        const dt_1 :Date = new Date(milliseconds);

        let dt_2 :string = '';
        if (short)
            dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest', month: 'long', day: 'numeric', year: 'numeric' });
        else
            dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest', hour12: true, hour: '2-digit', minute: '2-digit', weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' });

        return `${dt_2 }`
    }

  async function handleLogout() {
    try {
      setLoading(true);
      await logOut();
      navigateTo(0);
    } catch {
      setError("Could not log you out!");
    }

    setLoading(false);
  }

  if (user && !userData || (!user && !userData)) return (
    <>
      <Header title={`Fetching user data`} subtitle={''} />
    </>
  )

  return (
    <>
      {(!user || !userData) && <>
        <Box display='flex' justifyContent='center' alignItems='center' mt='4rem' height='1rem'>
          <Typography
            variant="h5"
            color={colors.blueAccent[100]}
          >{ "Fetching user data" }
          </Typography>
        </Box>
      </>}
      
      <Box sx={{overflowX:'hidden', overflowY:'hidden'}} m='20px'>
      {user && userData && <>
        <div className='header-pr'>
                <img src={require("../../../assets/profile_banner.png")} className='wide-pr' />
                <Box display='flex' flexDirection='column' alignItems='center' marginTop='15%'>
                    <img width='200px' style={{position:'relative', left:'0%', marginTop:'10%', borderRadius:'50%'}} src={require("../../../assets/default_pfp.png")} />
                    <Typography
                        variant="h3"
                        fontStyle='italic'
                        marginTop='10%'
                        sx={{fontSize: '2.1rem',
                        background: `-webkit-linear-gradient(#1b049e, #ffd4ee)`,
                        'WebkitBackgroundClip': 'text',
                        'WebkitTextFillColor': 'transparent',
                        filter: `drop-shadow(2rem 2rem 10rem ${theme.palette.mode === 'dark' ? "ff0000" : "ff0000"})`}}
                        >
                        {userData["username"]}
                    </Typography>
                    <Typography
                        variant="h3"
                        marginTop='.8rem'
                        fontStyle='italic'
                        color={colors.greenAccent[500]}
                        >
                        {profileData["title"]}
                    </Typography>
                </Box>
        </div>
      <Header title={`YOUR PROFILE (${userData?.["username"].toUpperCase()})`} subtitle={''} />
      <Box display='flex' flexDirection='row' marginTop='3rem' justifyContent='space-between'>
        <Box>
            <Box display='flex' flexDirection='row' gap='1ch'>
                <Typography
                variant="h4"
                marginTop='-2rem'
                fontStyle='italic'
                color={colors.gray[200]}
                >
                    Member since:
                </Typography>
                <Typography
                variant="h4"
                marginTop='-2rem'
                fontStyle='italic'
                color={theme.palette.mode === 'dark' ? 'white' : colors.blueAccent[500]}
                >
                    {parseDate(accountData["created_date"]?.seconds * 1000)}
                </Typography>
            </Box>
            <Box
                display='flex'
                flexDirection='column'
                justifyContent='center'
                gap='2rem'
                marginTop='2rem'
            >
                <Typography
                variant="h3"
                color={colors.primary[100]}
                sx={{borderLeft: `2px solid ${colors.primary[100]}`, paddingLeft:'1rem'}}
                >
                {profileData["bio"]}
                </Typography>
            </Box>
        </Box>
        <Box>
            <Box marginTop='0rem' display='flex' flexDirection='column' justifyContent='space-between' alignItems='left'>
                <Typography variant='h3'>Contact information:</Typography>
                <Box marginTop='1rem' display='flex' flexDirection='column' gap='1rem' justifyContent='space-between'>
                    <Box display='flex' flexDirection='row' gap='5rem' justifyContent='space-between'>
                        <Typography variant='h4'>First name:</Typography>
                        <Typography variant='h4'>{accountData["first_name"]}</Typography>
                    </Box>
                    <Box display='flex' flexDirection='row' gap='5rem' justifyContent='space-between'>
                        <Typography variant='h4'>Last name:</Typography>
                        <Typography variant='h4'>{accountData["last_name"]}</Typography>
                    </Box>
                    <Box display='flex' flexDirection='row' gap='5rem' justifyContent='space-between'>
                        <Typography variant='h4'>Phone number:</Typography>
                        <Typography variant='h4'>{accountData["phone_number"]}</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
      </Box>

        <Box
            display='flex'
            flexDirection='column'
            alignContent='left'
            bgcolor={colors.gray[900]}
            marginTop='3rem'
        >
            <Typography p='2rem' fontStyle='italic' bgcolor={colors.gray[800]} variant="h3">Your comments</Typography>
            <Box padding='1.6rem' sx={{display:'flex', flexDirection:'column', gap:'2rem'}} >
                {userCommentsLoading && <Typography variant='h4'>Loading...</Typography>}

                {!userCommentsLoading && userComments.length === 0 && <Typography fontStyle='italic' variant='h4'>You haven't left any comments yet!</Typography> }

                {!userCommentsLoading && userComments.map((comment, index) => {
                    return <UserComment key={index} comm={comment}/>
                })}
            </Box>
        </Box>

        <Box
            display='flex'
            flexDirection='column'
            alignContent='left'
            bgcolor={colors.gray[900]}
            marginTop='3rem'
        >
            <Typography p='2rem' fontStyle='italic' bgcolor={colors.gray[800]} variant="h3">Your reviews</Typography>
            <Box padding='1.6rem' sx={{display:'flex', flexDirection:'column', gap:'2rem'}} >
                {userReviewsLoading && <Typography variant='h4'>Loading...</Typography>}

                {!userReviewsLoading && userReviews.length === 0 && <Typography fontStyle='italic' variant='h4'>You haven't left any reviews yet!</Typography> }

                {!userReviewsLoading && userReviews.map((comment, index) => {
                    return <UserReview key={index} comm={comment}/>
                })}
            </Box>
        </Box>

        <Box marginTop='3rem' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Box display='flex' flexDirection='column' gap='2rem' justifyContent='center' alignItems='center'>
                <IconButton
                    sx={{color:theme.palette.mode==='dark' ? colors.greenAccent[500] : colors.greenAccent[500], borderRadius:'0', border:'1px solid', padding:'1rem', alignSelf:'center', gap:'.5rem'}}
                    onClick={ ()=>{} }
                >
                    <BrushIcon/>
                    <Typography color={theme.palette.mode==='dark' ? colors.greenAccent[500] : colors.greenAccent[500]} variant="h4">Edit profile</Typography>
                </IconButton>

                <IconButton
                    disabled={loading} sx={{color:theme.palette.mode==='dark' ? colors.blueAccent[500] : colors.blueAccent[500], borderRadius:'0', border:'1px solid', padding:'.7rem', alignSelf:'center', gap:'.5rem'}}
                    onClick={handleLogout}
                >
                    <LogoutIcon/>
                    <Typography color={theme.palette.mode==='dark' ? colors.blueAccent[500] : colors.blueAccent[500]} fontSize='18px'>Log out</Typography>
                </IconButton>
            </Box>
            <Box display='flex' justifyContent='center' mb='1rem' width='100%' height='1rem'>
                <Typography
                variant="h5"
                color={colors.redAccent[100]}
                >
                    {error}
                </Typography>
            </Box>
        </Box>
      </>}
      </Box>
    </>
  )
}

export default Profile