import { Box, Button, Typography, colors } from '@mui/material'
import { get, getFilePath } from 'actions';
import { DocumentData } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'

const Booking = ({booking, onCancelReservation} : {
    booking: DocumentData;
    onCancelReservation: () => void;
}) => {

    const getStatus = (status:number) => {
        switch(status) {
            case 0:
                return 'Cancelled';
            case 1:
                return 'Active';
            case 2:
                return 'Completed';
        }
    }

    const [queryCinema, setQueryCinema] = useState<DocumentData | undefined>(undefined);
    const [queryLoading, setQueryLoading] = useState(true);
    const [queryCinemaImg, setQueryCinemaImg] = useState<string>("");

    useEffect(() => {
        if (!queryCinema) {
            get("cinemas", booking["cinema_id"]).then((docSnap) => {
                if(docSnap) setQueryCinema({...docSnap, id: booking["cinema_id"]});
            })
            setQueryLoading(false);
        }
    }, []);

    useEffect(() => {
        if (queryCinema) {
            getFilePath(`cinema_pictures/${queryCinema["picture"]}`).then((url) => {
                setQueryCinemaImg(url);
            } );
        }
    }, [queryCinema]);

    return (
        <>
        <Box margin='3rem 0' key={booking.id} display='flex' justifyContent='space-between' alignItems='center' width='80%'>
            <Box display='flex' flexDirection={'column'} alignItems={'center'}>
                <img width='180px' height='100px' style={{borderRadius:'10%'}} src={queryCinemaImg} alt="Cinema" />
                {queryCinema?.["name"]}
            </Box>
            <Box display='flex' gap='1ch'>
                <Typography variant="h4" color={colors.grey[500]}>Booked</Typography>
                <Typography variant="h4">{booking["movie"]}</Typography>
                <Typography variant="h4" color={colors.grey[500]}>for</Typography>
                <Typography variant="h4">{booking["booking_showup"]}</Typography>
                <Typography variant="h4" color={colors.grey[500]}>in room</Typography>
                <Typography variant="h4">{booking["room"]}</Typography>
                <Typography variant="h4" color={colors.grey[500]}>, seat</Typography>
                <Typography variant="h4">{booking["seat_booked"]}</Typography>
                <Typography variant="h4" color={colors.grey[500]}>. Status:</Typography>
                <Typography variant="h4">{getStatus(booking["status"])}</Typography>
            </Box>
            
            {booking["status"] !== 0 && 
                <Button
                sx={{width:'auto', fontSize:'14px', color:'white'}}
                color='error' variant='contained'
                onClick={onCancelReservation}
                >
                Cancel reservation
                </Button>
            }
        </Box>
        </>
    )
}

export default Booking
