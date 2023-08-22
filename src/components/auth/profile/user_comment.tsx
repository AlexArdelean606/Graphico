import { Box, Typography, useTheme } from '@mui/material';
import { get, getFilePath } from 'actions';
import { db } from 'firebase';
import { DocumentData, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { tokens } from 'theme';
import './profile.css'

const UserComment = (comm :DocumentData) => {
  
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const navigation = useNavigate();

    const comment = comm["comm"];

    const [queryCinema, setQueryCinema] = useState<DocumentData | undefined>(undefined);
    const [queryCinemaImg, setQueryCinemaImg] = useState<string>("");
    const [queryLoading, setQueryLoading] = useState(true);

    const parseDate = (milliseconds: number) => {
        const dt_1 :Date = new Date(milliseconds);

        let dt_2 :string = '';
        dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest', hour12: true, hour: '2-digit', minute: '2-digit', weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' });

        return `${dt_2.toUpperCase() }`
    }

    useEffect(() => {
        if (queryCinema) {
            getFilePath(`cinema_pictures/${queryCinema["picture"]}`).then((url) => {
                setQueryCinemaImg(url);
            } );
        }
    }, [queryCinema]);

    useEffect(() => {
        if (!queryCinema) {
            get("cinemas", comment["cinema_id"]).then((docSnap) => {
                if(docSnap) setQueryCinema({...docSnap, id: comment["cinema_id"]});
            })
            setQueryLoading(false);
        }
    }, [queryCinema]);

    useEffect(() => {
        console.log(comm);
    }, [])

    useEffect(() => {
        console.log(comment);
    }, [])

    return (
    <>
        {queryCinema && !queryLoading && queryCinemaImg &&
        <>
            <Box
                display='flex'
                flexDirection='column'
                alignContent='left'
                paddingTop='1rem'
                paddingBottom='3rem'
                className={theme.palette.mode==='dark'? 'usercomment-item' : 'usercomment-item-light'}
                style={{ cursor: "pointer" }}
                onClick={() => { 
                    navigation(`/cinema/${queryCinema["id"]}`);
                }}
            >   
                <Box display='grid' gridTemplateColumns='169px 1fr 3fr' gap='2rem' alignItems='center' >
                <img
                    alt={`${comment["nickname"]}`}
                    width="169px"
                    height="100px"
                    src={queryCinemaImg}
                />
                <Box marginLeft='2rem' display='flex' flexDirection='column' width='100%' justifyContent='center'>
                    <Box display='flex' flexDirection='row'>
                        <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center'>
                            <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' gap='1rem'>
                                <Typography color={colors.greenAccent[500]} variant="h3">{`${queryCinema["name"]}`}</Typography>
                                <Box display='flex' flexDirection='row' gap='1ch'>
                                    <Typography fontStyle='italic' color={colors.primary[100]}>Left on</Typography>
                                    <Typography fontStyle='italic' color={theme.palette.mode==='dark' ? 'white' : colors.blueAccent[400]}>{`${parseDate(comment["created_date"])}`}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                    <Box sx={{ borderRadius:'15px', width:'100%', height:'auto', backgroundColor:theme.palette.mode === 'dark' ? '#353535' : '#cccccc', padding:'20px'}} >
                        <Typography 
                            color={
                                theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                            }   
                            variant="h5"
                            >
                            {comment["message"]}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </>
        }
    </>
  )
}

export default UserComment;