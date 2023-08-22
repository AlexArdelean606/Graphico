import { Box, Button, Typography, useTheme } from '@mui/material'
import { tokens } from '../../theme'
import Header from '../../components/Header'
import { useNavigate } from "react-router-dom"
import { USERPROFILE } from "../types"
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from "../../firebase"
import { DocumentData, doc, getDoc } from "firebase/firestore"
import React from 'react'
import './user.css'
import { whereQuery } from 'actions'
import UserComment from 'components/auth/profile/user_comment'
import UserReview from 'components/auth/profile/user_review'


const User = () => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { userid } = useParams()
    const [ queryUserData, setQueryUserData ] = useState<DocumentData | undefined>(undefined);
    const [ queryProfileData, setQueryProfileData ] = useState<DocumentData | undefined>(undefined);
    const [ queryAccountData, setQueryAccountData ] = useState<DocumentData | undefined>(undefined);
  
    const [ queryLoadingUserData, setQueryLoadingUserData ] = useState(true);
    const [ queryLoadingProfileData, setQueryLoadingProfileData ] = useState(true);
    const [ queryLoadingAccountData, setQueryLoadingAccountData ] = useState(true);

    const [queryUserComments, setQueryUserComments] = useState<DocumentData[]>();
    const [queryUserCommentsLoading, setQueryUserCommentsLoading] = useState(true);

    const [queryUserReviews, setQueryUserReviews] = useState<DocumentData[]>();
    const [queryUserReviewsLoading, setQueryUserReviewsLoading] = useState(true);

    useEffect(() => { 
        if (!queryAccountData) return;
        if (!queryUserData) return;

        let userComms :DocumentData[] = [];

        whereQuery('cinema_comments', 'created_by', queryAccountData["id"], '==').then((res) => {
            res.forEach((doc) => {
                if (doc["deleted"] === 0){
                    userComms.push({...doc, nickname: queryUserData["username"]});
                }
            } );
            
            setQueryUserComments(userComms);
            setQueryUserCommentsLoading(false);
        });
    }, [queryAccountData]);

    useEffect(() => { 
        if (!queryAccountData) return;
        if (!queryUserData) return;

        let userReviews :DocumentData[] = [];

        whereQuery('cinema_reviews', 'created_by', queryAccountData["id"], '==').then((res) => {
            res.forEach((doc) => {
                userReviews.push({...doc, nickname: queryUserData["username"]});
            } );
            
            setQueryUserReviews(userReviews);
            setQueryUserReviewsLoading(false);
        });
    }, [queryAccountData]);

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

  useEffect(() => {
    if(!userid) {
      navigateTo(USERPROFILE)
      return;
    }

    if(!queryUserData) {
        getDoc(doc(db, "users", userid)).then(docSnap => {
            setQueryUserData(docSnap.data());
        })
        setQueryLoadingUserData(false);
    }

    if(!queryProfileData) {
        getDoc(doc(db, "profiles", userid)).then(docSnap => {
            setQueryProfileData(docSnap.data());
        } )
        setQueryLoadingProfileData(false);
    }

    if(!queryAccountData) {
        getDoc(doc(db, "accounts", userid)).then(docSnap => {
            setQueryAccountData({...docSnap.data(), id: docSnap.id});
        } )
        setQueryLoadingAccountData(false);
    }

  }, [queryUserData, queryProfileData, queryAccountData, userid])

  return (
    <Box m='20px'>

      {userid && queryLoadingUserData &&
        <Box display='flex' justifyContent='center' alignItems='center' mt='4rem' height='1rem'>
          <Typography
            variant="h5"
            color={colors.blueAccent[100]}
          >{ "Fetching user data" }
          </Typography>
        </Box>
      }

    <Box sx={{overflowX:'hidden', overflowY:'hidden'}} m='20px'>
        {userid && !queryLoadingUserData && !queryLoadingAccountData && !queryLoadingProfileData && queryUserData && queryAccountData && queryProfileData && <>
        <div className='header-pr'>
                <img src={require("../../assets/profile_banner.png")} className='wide-pr' />
                <Box display='flex' flexDirection='column' alignItems='center' marginTop='15%'>
                    <img width='200px' style={{position:'relative', left:'0%', marginTop:'10%', borderRadius:'50%'}} src={require("../../assets/default_pfp.png")} />
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
                        {queryUserData["username"]}
                    </Typography>
                    <Typography
                        variant="h3"
                        marginTop='.8rem'
                        fontStyle='italic'
                        color={colors.greenAccent[500]}
                        >
                        {queryProfileData["title"]}
                    </Typography>
                </Box>
        </div>
      <Header title={`${queryUserData?.["username"].toUpperCase()}'s PROFILE`} subtitle={''} />
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
                    {parseDate(queryAccountData["created_date"]?.seconds * 1000)}
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
                {queryProfileData["bio"]}
                </Typography>
            </Box>
        </Box>
        <Box>
            <Box marginTop='0rem' display='flex' flexDirection='column' justifyContent='space-between' alignItems='left'>
                <Typography variant='h3'>Contact information:</Typography>
                <Box marginTop='1rem' display='flex' flexDirection='column' gap='1rem' justifyContent='space-between'>
                    <Box display='flex' flexDirection='row' gap='5rem' justifyContent='space-between'>
                        <Typography variant='h4'>First name:</Typography>
                        <Typography variant='h4'>{queryAccountData["first_name"]}</Typography>
                    </Box>
                    <Box display='flex' flexDirection='row' gap='5rem' justifyContent='space-between'>
                        <Typography variant='h4'>Last name:</Typography>
                        <Typography variant='h4'>{queryAccountData["last_name"]}</Typography>
                    </Box>
                    <Box display='flex' flexDirection='row' gap='5rem' justifyContent='space-between'>
                        <Typography variant='h4'>Phone number:</Typography>
                        <Typography variant='h4'>{queryAccountData["phone_number"]}</Typography>
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
            <Typography p='2rem' fontStyle='italic' bgcolor={colors.gray[800]} variant="h3">{queryUserData?.["username"]}'s comments</Typography>
            <Box padding='1.6rem' sx={{display:'flex', flexDirection:'column', gap:'2rem'}} >
                {queryUserCommentsLoading && <Typography variant='h4'>Loading...</Typography>}

                {!queryUserCommentsLoading && queryUserComments?.length === 0 && <Typography fontStyle='italic' variant='h4'>{queryUserData?.["username"]} hasn't left any comments yet!</Typography> }

                {!queryUserCommentsLoading && queryUserComments?.map((comment, index) => {
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
            <Typography p='2rem' fontStyle='italic' bgcolor={colors.gray[800]} variant="h3">{queryUserData?.["username"]}'s reviews</Typography>
            <Box padding='1.6rem' sx={{display:'flex', flexDirection:'column', gap:'2rem'}} >
                {queryUserReviewsLoading && <Typography variant='h4'>Loading...</Typography>}

                {!queryUserReviewsLoading && queryUserReviews?.length === 0 && <Typography fontStyle='italic' variant='h4'>{queryUserData?.["username"]} hasn't left any reviews yet!</Typography> }

                {!queryUserReviewsLoading && queryUserReviews?.map((comment, index) => {
                    return <UserReview key={index} comm={comment}/>
                })}
            </Box>
        </Box>
      </>}
      </Box>
    </Box>
  )
}

export default User