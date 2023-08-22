import { Box, Button, Typography, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { db, storage } from "../../../firebase";
import { DocumentData } from "firebase/firestore";
import React from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { getMonthName, ordinal } from 'utils/dateToText';
import { tokens } from 'theme';

const MovieItem = ({ movie, purchaseTicketModal } :{
    movie :DocumentData,
    purchaseTicketModal :() => void
} ) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [ imgPath, setImgPath] = useState("");

    useEffect(() => {
        getDownloadURL(ref(storage, `movie_images/${movie?.["movie_image"]}`)).then(url => setImgPath(url))
    }, [movie?.["movie_image"]]);

    const parseDate = (date: any, style: number) => {
        const dt_1 :Date = new Date(date.seconds * 1000);

        let dt_2 :string = '';

        switch (style) {
            case 1:
                dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest', month: 'long', day: '2-digit', weekday: 'long' });
            break;
            default:
                dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest',  hour12: true, hour: '2-digit', minute: '2-digit' });
            break;
        }

        return `${dt_2.toUpperCase() }`
    }

    return (
        <>
            <Box
                display='flex'
                flexDirection='column'
                alignContent='left'
            >
                <Typography marginBottom='1rem' color={colors.greenAccent[500]} variant="h1">{`${movie["title"]}`}</Typography>
                <Box
                    display='flex'
                    flexDirection='row'
                    gap='1rem'
                    height='200px'
                >
                    <Box>
                        <img
                            alt={`${movie["title"]}`}
                            width="180px"
                            height="200px"
                            src={imgPath}
                            style={{ borderRadius: "10px 10px 10px 10px" }}
                        />
                    </Box>
                    <Box
                        display='flex'
                        flexDirection='column'
                        justifyContent='space-between'
                        padding='.8rem 0px 1.5rem 0px'
                        height='100%'
                    >
                        <Box display='flex' height='100%' flexDirection='column' justifyContent='space-between' >
                            <Box>
                                <Typography color={colors.primary[100]} variant="h4">{`${parseDate(movie["screening_date"], 1)}`}</Typography>
                                <Typography color={colors.primary[200]} sx={{fontStyle:'italic'}} variant="h4">{`${parseDate(movie["screening_date"], 2).replace(".","")}`}</Typography>
                            </Box>
                            <Button onClick={purchaseTicketModal} sx={{width:'8rem', height:'4rem', fontSize:'16px', fontWeight:'bolder'}} color='success' variant='contained'>
                                Book ticket<br/>
                                {`${movie["price"]} RON`}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default MovieItem