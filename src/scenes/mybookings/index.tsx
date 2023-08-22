import { Box, Typography, useTheme, IconButton, Button, Icon, Modal } from "@mui/material";
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import { ColorModeContext, tokens } from "../../theme";
import Header from "../../components/Header";
import React, { useState, useContext, useEffect  } from "react";
import { set, whereQuery } from "actions";
import { useUserAuth } from "contexts/AuthContext";
import { DocumentData } from "firebase/firestore";
import Booking from "./booking";

const MyBookings = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext)

  const { user } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<DocumentData[]>([]);

    const [cancelReservationModal, setCancelReservationModal] = useState(false);
    const [modalBooking, setModalBooking] = useState<DocumentData>();

    const [notifiyBookingEffect, setNotifyBookingEffect] = useState(false);

  useEffect(() => {

    let books :DocumentData[] = [];
    
    whereQuery('bookings', 'account_id', user.uid, '==').then((bookings) => {
        
        bookings.forEach((booking) => {
            books.push({...booking, id: booking.id});
        } );

        setMyBookings(books);
        setLoading(false);
    } )
  }, [])

    useEffect(() => {
        if(notifiyBookingEffect) {
            setMyBookings([]);
            let books :DocumentData[] = [];
            
            whereQuery('bookings', 'account_id', user.uid, '==').then((bookings) => {
                
                bookings.forEach((booking) => {
                    books.push({...booking, id: booking.id});
                } );
        
                setMyBookings(books);
                setLoading(false);
                setNotifyBookingEffect(false);
            } )
        }
    }, [notifiyBookingEffect])

  const handleClose = () => {
    setCancelReservationModal(false);
  };

    const openCancelReservationModal = (booking :DocumentData) => {
        setCancelReservationModal(true);
        setModalBooking( booking );
    }

  return (
    <>
    <Box m="20px">
        <Header title="YOUR BOOKINGS" subtitle={myBookings ? `${myBookings.length} booking${myBookings.length === 1 ? '' : 's'}` : (loading ? `...` : '0 bookings')} />
        {loading && <Typography variant="h3">Fetching...</Typography>}
        {!loading && myBookings.length === 0 && (
            <Box>
            <Typography variant="h3">You haven't made any reservations yet.</Typography>
        </Box>
        ) }
        {!loading && myBookings.length > 0 && (
            <Box>
            {myBookings.map((booking) => (
                <Booking key={booking.id} booking={booking} onCancelReservation={()=> openCancelReservationModal(booking)} />
                ))}
            </Box>
        ) }
    </Box>
    <Modal
        open={cancelReservationModal}
        onClose={handleClose}
      >
        <Box
        sx={{
            borderRadius:'1rem',
            border: '3px solid',
            borderColor: colors.redAccent[300],
            padding:'2rem', alignSelf:'center',
            gap:'.5rem',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: colors.primary[500]
        }}
        >
          <Typography textAlign='center' color={colors.primary[100]} variant="h4">
            Are you sure you want to cancel your reservation to {modalBooking?.["movie"]}? <br /> This action cannot be undone.
          </Typography>
          <Box
            sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
          >
            <Button
                sx={{width:'auto', fontSize:'14px', color:'white'}}
                color='error' variant='contained'
                onClick={() => {
                    set('bookings', modalBooking?.["id"], {status: 0}).then(() => {
                        setNotifyBookingEffect(true);
                        handleClose();
                    } );
                } }
            >
              Cancel reservation
            </Button>
            <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default MyBookings;