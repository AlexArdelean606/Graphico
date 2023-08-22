import { Box, Button, FormControl, FormControlLabel, FormLabel, IconButton, Input, Modal, Radio, RadioGroup, Rating, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { tokens } from '../../theme';
import { useNavigate } from "react-router-dom";
import { USERPROFILE } from "../types";
import { useState, useEffect, SyntheticEvent, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db, storage } from "../../firebase";
import { DocumentData, doc, getDoc } from "firebase/firestore";
import React from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import './cinema.css';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { add, getAll, remove, set, sortBy, upload, uploadMovie, whereQuery } from 'actions';
import MovieItem from './movieitem';
import RoomIcon from '@mui/icons-material/Room';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { isTime1Ibetween } from 'utils/dateToText';
import { useUserAuth } from 'contexts/AuthContext';
import DoorBackIcon from '@mui/icons-material/DoorBack';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ChairIcon from '@mui/icons-material/Chair';
import CommentItem from './commentitem';
import CreateIcon from '@mui/icons-material/Create';
import CinemaEdit from 'components/cinema_edit/CinemaEdit';
import BrushIcon from '@mui/icons-material/Brush';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

enum ModalType {
    PURCHASE,
    CONFIRM_REMOVE_COMMENT,
    EDIT_CINEMA,
    ADD_MOVIE
}

const Cinema = () => {

    const stripe = useStripe();
    const elements = useElements();
    const [paymentError, setPaymentError] = useState<string | undefined>();

    const {user, userData, accountData} = useUserAuth();


    const [averageRating, setAverageRating] = useState<number>(0);
    const [numOfRatings, setNumOfRatings] = useState<number>(0);

    const [cinemaComments, setCinemaComments] = useState<DocumentData[]>([]);
    const [cinemaCommentsLoading, setCinemaCommentsLoading] = useState<boolean>(true);

    const [notifyCommentsEffect, setNotifyCommentsEffect] = useState<boolean>(false);
    const [notifyCinemaInfoEffect, setNotifyCinemaInfoEffect] = useState<boolean>(false);

    const currentTime = {
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
    }

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { cinemaid } = useParams()
    const canEditCinema :boolean = accountData?.role === 2 || accountData?.cinemas.includes(cinemaid);
    const [ queryCinemaData, setQueryCinemaData ] = useState<DocumentData | undefined>(undefined);
    const [ imgPath, setImgPath] = useState("");

    const [ queryLoading, setQueryLoading ] = useState(true)

    const [ movies, setMovies ] = useState<DocumentData[]>([]);
    const [ moviesLoading, setMoviesLoading ] = useState(true);
    const [notifyMoviesEffect, setNotifyMoviesEffect] = useState<boolean>(false);

    const [openModal, setOpenModal] = useState<ModalType | undefined>();

    const [modalMovie, setModalMovie] = useState<DocumentData>();
    const [modalCinema, setModalCinema] = useState<DocumentData | undefined>(undefined);

    const navigateTo = useNavigate();

    const [freeSeats, setFreeSeats] = useState<string[]>([]);

    const [ratingValue, setRatingValue] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);

    const [bookInfo, setBookInfo] = useState<DocumentData>({});

    const [image, setImage] = React.useState<File | undefined>();

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '20px',
                color: colors.primary[100],
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                '::placeholder': {
                    color: colors.primary[200],
                },
            },
            invalid: {
                color: colors.redAccent[400],
                iconColor: colors.redAccent[500],
            },
        },
      };


    const parseDate = (milliseconds: number, short: boolean = false) => {
        const dt_1 :Date = new Date(milliseconds);

        let dt_2 :string = '';
        if (short)
            dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest', hour12: true, hour: '2-digit', minute: '2-digit', month: 'numeric', day: '2-digit' });
        else
            dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest', hour12: true, hour: '2-digit', minute: '2-digit', weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' });

        return `${dt_2.toUpperCase() }`
    }

    const handleClose = () => {
        setOpenModal(undefined);
        setBookInfo({});
        setRemoveCommentAs(undefined);
    };

    const [modalComment, setModalComment] = useState<DocumentData | undefined>(undefined);
    const [modalCommentRemovalStatus, setModalCommentRemovalStatus] = useState<number>(0);

    const [removeCommentAs, setRemoveCommentAs] = useState<"user" | "admin">();

    const openAddMovieModal = () => {
        setOpenModal(ModalType.ADD_MOVIE);
    }

    const openRemoveCommentModal = (comment :DocumentData, status: number) => {
        setModalComment(comment);
        console.log(status);
        setModalCommentRemovalStatus(status);
        setOpenModal(ModalType.CONFIRM_REMOVE_COMMENT);
    };

    useEffect(() => {
        if (notifyMoviesEffect){
            setMoviesLoading(true);
            setMovies([]);

            if (cinemaid) {
                getAll(`cinemas/${cinemaid}/movies`).then(movies => {
                    movies.forEach(movie => {
                        if (movie["screening_date"].seconds * 1000 >= new Date().getTime() ) {
                            setMovies(movies => [...movies, movie]);
                        }
                    });
                } );
                setMoviesLoading(false);
            }
        }
    }, [notifyMoviesEffect])

    function openPurchaseTicketModal(movie: DocumentData, cinema: DocumentData | undefined) {
        if (!cinema)
            return;

        setOpenModal(ModalType.PURCHASE);
        setModalMovie(movie);
        setModalCinema(cinema);
    }

    const openEditCinemaModal = (cinema :DocumentData) => {
        setOpenModal(ModalType.EDIT_CINEMA);
        setModalCinema(cinema);
    }

    const [comment, setComment] = useState<string | undefined>();

    const submitRemoveComment = async (e :SyntheticEvent) => {
        e.preventDefault();

        if (!modalComment)
            return;

        if (modalCommentRemovalStatus === 1 || modalCommentRemovalStatus === 2) {
            await set('cinema_comments', modalComment.id, {
                deleted: modalCommentRemovalStatus
            }).then(() => {
                setCinemaComments([]);
                setNotifyCommentsEffect(oldVal => !oldVal);
                setOpenModal(undefined);
            });
        }
        else if (modalCommentRemovalStatus === 3) {
            if (removeCommentAs === "admin"){
                await set('cinema_comments', modalComment.id, {
                    deleted: 2
                }).then(() => {
                    setCinemaComments([]);
                    setNotifyCommentsEffect(oldVal => !oldVal);
                    setOpenModal(undefined);
                });
            }
            else if (removeCommentAs === "user") {
                await set('cinema_comments', modalComment.id, {
                    deleted: 1
                }).then(() => {
                    setCinemaComments([]);
                    setNotifyCommentsEffect(oldVal => !oldVal);
                    setOpenModal(undefined);
                });
            }
        }

    }

    const handleCommentSubmit = async (e :SyntheticEvent) => {
        e.preventDefault();

        if (!comment) return;

        if (comment.length < 1) return;

        console.log("submitting comment");
        console.log(comment);

        add('cinema_comments', {
            cinema_id: cinemaid,
            created_by: user.uid,
            created_date: new Date().getTime(),
            deleted: 0,
            message: comment,
            replies_to: ""
        }).then(() => {
            setCinemaComments([]);
            setNotifyCommentsEffect(oldVal => !oldVal);
        });

        setComment("");
        //@ts-ignore
        e.currentTarget.reset();
    }

    const handleReviewSubmit = async (e :SyntheticEvent) => {
        e.preventDefault();

        if (ratingValue === 0) return;

        add('cinema_reviews', {
            cinema_id: cinemaid,
            created_by: user.uid,
            created_date: new Date().getTime(),
            review_stars: ratingValue
        }).then(() => {
            // TODO
        });
    }

    const onSubmitAddMovie = (event: SyntheticEvent) => {
        event.preventDefault();

        const target = event.target as typeof event.target & {
            [key: string]: {value: string|number, files: FileList}
        }

        add(`cinemas/${cinemaid}/movies`, {
            movie_image: target["movie_image"]?.files[0]?.name,
            price: target["price"].value,
            title: target["title"].value,
            screening_date: {seconds: new Date().getTime()+3600 * 1000 * 24, nanoseconds: 0}
        } ).then(() => {
            if (target["movie_image"]?.files[0]){
                uploadMovie(target["movie_image"].files[0], target["movie_image"].files[0].name).then(() => {
                    setQueryCinemaData([]);
                    setNotifyCinemaInfoEffect(true);
                    setNotifyMoviesEffect(true);
                    handleClose();
                } );
            }
            else{
                setQueryCinemaData([]);
                setNotifyCinemaInfoEffect(true);
                handleClose();
            }
        });

    }

    const handleEditSubmit = (event: SyntheticEvent, cinema: DocumentData = []) => {
        event.preventDefault();

        const target = event.target as typeof event.target & {
            [key: string]: {value: string|number, files: FileList}
        }

        if (!cinema)
            return

        set('cinemas', cinema.id, {
            announcement: target["announcement"].value,
            city: target["city"].value,
            closing_hour: target["closing_hour"].value,
            closing_minute: target["closing_minute"].value,
            country: target["country"].value,
            description: target["description"].value,
            name: target["name"].value,
            opening_hour: target["opening_hour"].value,
            opening_minute: target["opening_minute"].value,
            picture: target["picture"]?.files[0]?.name || cinema["picture"],
        } ).then(() => {

            if (target["picture"]?.files[0]){
                upload(target["picture"].files[0], target["picture"].files[0].name).then(() => {
                    setQueryCinemaData([]);
                    setNotifyCinemaInfoEffect(true);
                    handleClose();
                } );
            }
            else{
                setQueryCinemaData([]);
                setNotifyCinemaInfoEffect(true);
                handleClose();
            }
        });
    }

    useEffect(() => {

        if (notifyMoviesEffect){
            setQueryCinemaData([]);
        }

    }, [notifyMoviesEffect] )

    const handlePurchaseSubmit = async (e :SyntheticEvent, modalMovie :DocumentData, modalCinema :DocumentData) => {
        e.preventDefault();
        if (!stripe || !elements)
          return;

        const cardElement = elements.getElement(CardElement);

        if (cardElement) {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setPaymentError(error.message);
            } else if (!bookInfo["room"]) {
                setPaymentError("Please select a room");
            } else if (!bookInfo["seat"]) {
                setPaymentError("Please select a seat");
            } else {
                add('bookings', {
                    account_id: user.uid,
                    booking_created: new Date().getTime(),
                    booking_showup: modalMovie!["screening_date"].seconds * 1000,
                    cinema_id: modalCinema!.id,
                    movie: modalMovie!["title"],
                    price: modalMovie!["price"],
                    room: bookInfo["room"],
                    seat_booked: bookInfo["seat"],
                    status: 1
                });
                handleClose();
            }
        }
    };

    useEffect(() => {
        if (openModal !== ModalType.PURCHASE)
            return;

        const initialFreeSeats :string[] = [
        "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12",
        "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12",
        "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "C11", "C12",
        "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12",
        "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8", "E9", "E10", "E11", "E12",
        "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
        "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11", "G12",
        "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "H12",
        "I1", "I2", "I3", "I4", "I5", "I6", "I7", "I8", "I9", "I10", "I11", "I12",
        "J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9", "J10", "J11", "J12"
        ];

        let toBeRemoved :string[] = [];

        if (bookInfo && bookInfo["room"]) {
            getAll('bookings').then(bookings => {
                bookings.forEach(booking => {
                    if (booking["cinema_id"] === cinemaid && booking["movie"] === modalMovie!["title"] && booking["room"] === bookInfo["room"]){
                        toBeRemoved = [...toBeRemoved, booking["seat_booked"]];
                    }
                })
            } ).then(() => {
                setFreeSeats(initialFreeSeats.filter(seat => !toBeRemoved.includes(seat)));
            });
        }
    }, [openModal, bookInfo] );

    useEffect(() => {
        if(!cinemaid) {
            navigateTo(USERPROFILE)
            return;
        }

        if(!queryCinemaData || notifyCinemaInfoEffect) {
            setQueryLoading(true);
            getDoc(doc(db, "cinemas", cinemaid)).then(docSnap => {
                setQueryCinemaData( {...docSnap.data(), id: cinemaid} );
            });
            setQueryLoading(false);
            setNotifyCinemaInfoEffect(false);
        }
    }, [queryCinemaData, notifyCinemaInfoEffect])

    useEffect(() => {
        if(!cinemaid) {
            navigateTo(USERPROFILE)
            return;
        }

        if(!queryCinemaData) {
            getAll(`cinemas/${cinemaid}/movies`).then(movies => {
                movies.forEach(movie => {
                    if (movie["screening_date"].seconds * 1000 >= new Date().getTime() ) {
                        setMovies(movies => [...movies, movie]);
                    }
                });
            } );
            setMoviesLoading(false);
        }
    }, [queryCinemaData])

    useEffect(() => {
        if (queryCinemaData?.["picture"])
            getDownloadURL(ref(storage, `cinema_pictures/${queryCinemaData?.["picture"]}`)).then(url => setImgPath(url))
    }, [queryCinemaData?.["picture"]]);

    useEffect(() => {
        let sum :number = 0;
        let count :number = 0;

        if (queryCinemaData && cinemaid) {
            whereQuery('cinema_reviews', 'cinema_id', cinemaid, '==').then(cinema_reviews => {
                cinema_reviews.forEach(cinema_review => {
                    let review_stars :number = parseInt(cinema_review["review_stars"]);
                    sum += review_stars;
                    count += 1;
                } )
            } ).then(() => {
                if (count === 0)
                    setAverageRating(0);
                else {
                    setAverageRating(sum / count);
                    setNumOfRatings(count);
                }
            });
        }

    }, [queryCinemaData]);

    useEffect(() => {
        setCinemaComments([]);
        setCinemaCommentsLoading(true);
        if (queryCinemaData && cinemaid) {
            whereQuery('cinema_comments', 'cinema_id', cinemaid, '==').then(cinema_comments => {
                let sorted_by_creation_date = sortBy(cinema_comments, "created_date", "desc");

                sorted_by_creation_date.forEach(cinema_comment => {
                    let nickname :string = "";
                    getDoc(doc(db, "users", cinema_comment["created_by"])).then(docSnap => {
                        nickname = docSnap.data()!["username"]||"Unknown";
                    } ).then(() => {
                        setCinemaComments(cComments => [...cComments, {...cinema_comment, nickname: nickname}]);
                    });
                } );
            } ).then(() => {
                setCinemaCommentsLoading(false);
            });
        }
    }, [queryCinemaData, notifyCommentsEffect]);

  return (
    <>
    <Box sx={{overflowX:'hidden', overflowY:'hidden'}} m='20px'>

      {cinemaid && (queryLoading || !queryCinemaData) && (moviesLoading || !movies) &&
        <Box display='flex' justifyContent='center' alignItems='center' mt='4rem' height='1rem'>
          <Typography
            variant="h5"
            color={colors.blueAccent[100]}
            >{ "Fetching cinema data" }
          </Typography>
        </Box>
      }

      {cinemaid && !queryLoading && !moviesLoading &&
      <>
        <div className='header'>
            <img src={imgPath} className='wide'/>
        </div>
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='space-between'
          width='100%'
          height='90%'
          gap='2rem'
          zIndex={1}
          bgcolor={theme.palette.mode === 'dark' ? '#141b2d' : '#fcfcfc'}
        >
        <Box>
        {queryCinemaData?.["announcement"] &&
            <Typography color={theme.palette.mode==='dark'?'yellow':colors.greenAccent[500]} variant='h3' fontStyle='italic' sx={{margin:'1rem 0', border:'1px solid', padding:'1rem', borderColor:theme.palette.mode==='dark'?'white':colors.greenAccent[500] }}>
                {queryCinemaData["announcement"]}
            </Typography>
        }
        </Box>
        <Box
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'start',
            gap: '1rem',
            alignItems: 'center',
            width: '100%',
            marginTop: queryCinemaData?.["announcement"] ? '-3rem' : '-3rem',
        }}
        >
            <Box
                display='flex'
                flexDirection='row'
                justifyContent='space-between'
                width='100%'
            >
            <Box display='flex' flexDirection='row' alignItems='center'>
                <Box display='flex' flexDirection='column' justifyContent='start' >
                    <Typography
                    variant="h1"
                    textAlign='left'
                    marginTop='1rem'
                    fontWeight='700'
                    sx={{
                        fontSize: '4rem',
                        background: `-webkit-linear-gradient(#1b049e, #ffd4ee)`,
                        'WebkitBackgroundClip': 'text',
                        'WebkitTextFillColor': 'transparent',
                        'WebkitTextStroke': '1px #000000',
                        filter: `drop-shadow(2rem 2rem 10rem ${theme.palette.mode === 'dark' ? "ff0000" : "ff0000"})`
                    }}
                    >
                        {queryCinemaData?.["name"]}
                    </Typography>
                    <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center' gap='1rem'>
                        <Rating
                        sx={{
                            fontSize: '30px'
                        }}
                        disabled
                        precision={0.1}
                        value={averageRating}
                        />
                        <Typography>
                            Based on {numOfRatings} user review{numOfRatings === 1 ? "" : "s"}
                        </Typography>
                    </Box>
                </Box>
                {canEditCinema === true &&
                <Box marginLeft='2rem'>
                    <Tooltip arrow title={<span style={{fontSize:'.75rem'}}>Modify {queryCinemaData?.["name"]} information</span>}>
                    <IconButton
                        sx={{color:theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500], borderRadius:'0', padding:'1rem', alignSelf:'center', gap:'.5rem'}}
                        onClick={ ()=>{
                            if (queryCinemaData) openEditCinemaModal(queryCinemaData)
                        } }
                    >
                        <BrushIcon/>
                        <Typography color={theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500]} variant="h4">Edit</Typography>
                    </IconButton>
                    </Tooltip>
                </Box>
                }
            </Box>
            {queryCinemaData && !queryLoading &&
            <Box display='flex' flexDirection='row'>
                <Typography sx={{marginTop:'2rem'}}><RoomIcon sx={{fontSize:'3rem'}}/></Typography>
                <Typography sx={{marginLeft:'1.5rem', marginTop:'2rem'}} variant='h1'>{queryCinemaData?.["country"]?.toUpperCase()}, {queryCinemaData?.["city"]?.toUpperCase()}</Typography>
                <Typography sx={{marginLeft:'5rem', marginTop:'2rem'}}><CalendarTodayIcon sx={{fontSize:'3rem'}}/></Typography>
                <Box
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    >
                    <Typography sx={{marginLeft:'1.5rem', marginTop:'2rem', marginBottom:'1rem'}} variant='h1'>
                        { ('0'+queryCinemaData!["opening_hour"]?.toString()).slice(-2) }:{ ('0'+queryCinemaData!["opening_minute"]?.toString()).slice(-2)} - { ('0'+queryCinemaData!["closing_hour"]?.toString()).slice(-2) }:{ ('0'+queryCinemaData!["closing_minute"]?.toString()).slice(-2)}
                    </Typography>
                    {   isTime1Ibetween(currentTime,  {opening_hour:queryCinemaData!["opening_hour"], opening_minute:queryCinemaData!["opening_minute"], closing_hour:queryCinemaData!["closing_hour"], closing_minute:queryCinemaData!["closing_minute"]}) &&
                    <>
                        <Typography sx={{color: colors.greenAccent[500], textAlign:'right', fontSize:'1.2rem', fontWeight:'bold'}} color={colors.primary[100]}>{`CURRENTLY OPEN`}</Typography>
                    </>
                    }
                    {   !isTime1Ibetween(currentTime,  {opening_hour:queryCinemaData!["opening_hour"], opening_minute:queryCinemaData!["opening_minute"], closing_hour:queryCinemaData!["closing_hour"], closing_minute:queryCinemaData!["closing_minute"]}) &&
                    <>
                        <Typography sx={{color: colors.redAccent[500], textAlign:'right', fontSize:'1.2rem', fontWeight:'bold'}} color={colors.primary[200]}>{`CURRENTLY CLOSED`}</Typography>

                    </>
                    }
                </Box>
            </Box>
            }
            </Box>
        </Box>
        <Box m='2rem' >
            <Typography variant="h4">{queryCinemaData?.["description"]}</Typography>
        </Box>
        <Box marginLeft='2rem' marginTop='.3rem' display='flex' flexDirection='row' justifyContent='start' alignItems='center'>
            <Typography marginRight='2.5rem' variant="h3">Leave a rating for {queryCinemaData?.["name"]}:</Typography>
            <Box display='flex' marginTop='1.5rem' gap='.2rem' flexDirection='column' justifyContent='center' alignItems='left'>
                <Rating
                    size='large'
                    onChangeActive={(e, newHover) => setHoverRating(newHover|0) }
                    value={ratingValue}
                    onChange={(e, newVal) => setRatingValue(newVal||0) }
                />
                {ratingValue > 0 && <Typography variant='h4' fontStyle='italic' color={colors.primary[100]}>{ratingValue} star{ratingValue !== 1 ? "s" : ""} </Typography>}
                {ratingValue === 0 && <Typography variant='h4' fontStyle='italic' color={colors.gray[500]}>{hoverRating<0?0:hoverRating} star{hoverRating !== 1 ? "s" : ""} </Typography>}
            </Box>
            <Button onClick={(e) => handleReviewSubmit(e) } disabled={ratingValue<=0} sx={{marginLeft:'2rem', width:'10rem', fontSize:'14px', fontWeight:'bolder'}} color='info' variant='contained'>Submit</Button>
        </Box>

        <Box
            display='flex'
            flexDirection='column'
            alignContent='left'
            bgcolor={colors.gray[900]}
            >
            <Typography p='2rem' fontStyle='italic' bgcolor={colors.gray[800]} variant="h3">Upcoming movies</Typography>
            <Box padding='1.6rem' sx={{display:'flex', flexDirection:'row', gap:'.6rem', alignItems:'center'}} >
                {movies.map((movie, index) => {
                return (
                    <MovieItem key={index} movie={movie} purchaseTicketModal={() => openPurchaseTicketModal(movie, queryCinemaData) } />
                    )
                } ) }
                {canEditCinema === true &&
                <Box marginLeft='2rem'>
                    <Tooltip arrow title={<span style={{fontSize:'1rem'}}>Modify {queryCinemaData?.["name"]} information</span>}>
                    <IconButton
                        sx={{color:theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500], borderRadius:'0', padding:'1rem', alignSelf:'center', gap:'.5rem'}}
                        onClick={ ()=>{
                            openAddMovieModal()
                        } }
                    >
                        <AddCircleOutlineIcon/>
                        <Typography color={theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500]} variant="h4">Add movie</Typography>
                    </IconButton>
                    </Tooltip>
                </Box>
                }
            </Box>
        </Box>

        <Box
            display='flex'
            flexDirection='column'
            alignContent='left'
            bgcolor={colors.gray[900]}
            >
            <Typography p='2rem' fontStyle='italic' bgcolor={colors.gray[800]} variant="h3">Leave a comment</Typography>

            <Box
                display='flex'
                flexDirection='column'
                alignContent='left'
                paddingTop='1rem'
                paddingBottom='1rem'
                marginLeft='1.5rem'
            >
                <Box display='flex' flexDirection='row' alignItems='flex-start' >
                <img
                    alt={userData?.["username"]}
                    width="100px"
                    height="100px"
                    src={require('assets/default_pfp.png')}
                    style={{ cursor: "pointer", borderRadius: "50%" }}
                />
                <Box marginLeft='2rem' marginBottom='1.8rem' display='flex' flexDirection='column' width='100%' justifyContent='left'>
                    <form
                        onSubmit={(e) => handleCommentSubmit(e)}
                        >
                        <Box display='flex' flexDirection='row' gap='4rem' alignItems='center' justifyContent='flex-start'>
                            <Box display='flex' flexDirection='column'>
                                <Typography color={colors.greenAccent[500]} variant="h3">{userData?.["username"]}</Typography>
                                <Typography fontStyle='italic' color={colors.primary[100]}>{`${parseDate(new Date().getTime())}`}</Typography>
                            </Box>
                            <IconButton disabled={(!comment || comment.length < 1)} type='submit' color='success' sx={{ borderRadius:'10px', border:'1px solid', padding:'.5rem 2rem', alignSelf:'center', gap:'.5rem'}}>
                                {<CreateIcon />}
                            <Typography color={colors.primary[100]} variant="h4">Post</Typography>
                            </IconButton>
                        </Box>
                        <TextField
                            variant='filled'
                            type='text'
                            placeholder='Write your comment here...'
                            name='comment'
                            onChange={(e) => setComment(e.target.value)}
                            sx={{input: {height:'10px', borderRadius:'15px', paddingBottom:'1.6rem', fontSize:'1.3rem', backgroundColor:theme.palette.mode === 'dark' ? '#353535' : '#cccccc'}, color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000', marginTop:'2rem', width:'98%'}}
                            >
                        </TextField>
                    </form>
                </Box>
                </Box>
            </Box>

        </Box>

        <Box
            display='flex'
            flexDirection='column'
            alignContent='left'
            bgcolor={colors.gray[900]}
        >
            <Typography p='2rem' fontStyle='italic' bgcolor={colors.gray[800]} variant="h3">User comments</Typography>
            <Box padding='1.6rem' sx={{display:'flex', flexDirection:'column', gap:'2rem'}} >
                {cinemaCommentsLoading && <Typography variant='h4'>Loading...</Typography>}

                {!cinemaCommentsLoading && cinemaComments.length === 0 && <Typography fontStyle='italic' variant='h4'>Be the first to leave a comment!</Typography> }

                {!cinemaCommentsLoading && cinemaComments.map((comment, index) => {
                    return <CommentItem key={index} comment={comment} openRemoveCommentModal={openRemoveCommentModal}/>
                })}
            </Box>
        </Box>

        </Box>
      </>
      }
    </Box>

      <Modal
        open={openModal===ModalType.EDIT_CINEMA && modalCinema !== undefined}
        onClose={handleClose}
      >
        <CinemaEdit cinema={modalCinema} onSubmit={handleEditSubmit} onCancel={handleClose} />
      </Modal>

      <Modal
        open={openModal===ModalType.ADD_MOVIE}
        onClose={handleClose}
      >

    <Box
    sx={{
        borderRadius:'1rem',
        border: '2px solid',
        borderColor: 'yellow',
        padding:'.5rem', alignSelf:'center',
        gap:'.5rem',
        position: 'absolute',
        top: '49%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : '#fafafa',
        width:'auto'
    }}
    >
        <form onSubmit={(e)=>onSubmitAddMovie(e)}>
            <Typography marginLeft='2rem' variant="h3">Inserting a new movie</Typography>
            <FormControl>
            <Box width='100%' padding='2rem' display='flex' flexDirection='column'>
                <Box display='flex' flexDirection='column' gap='2rem'>
                    <Box display='flex' flexDirection='column' gap='.5rem'>
                        <FormLabel>Title</FormLabel>
                        <TextField sx={{width:'100%', input:{ fontSize:'1.5rem',
                        }}} name="title" type='text' required></TextField>
                    </Box>
                    <Box display='flex' flexDirection='column' gap='.5rem'>
                        <Box display='flex' flexDirection='row'>
                        <FormLabel>Cover image</FormLabel>
                        {image &&
                        <Box marginLeft='1rem' display='flex' flexDirection='row'>
                            <Typography fontStyle='italic' color={colors.gray[200]}>(</Typography>
                            <Typography fontStyle='italic'>{image.name}</Typography>
                            <Typography fontStyle='italic' color={colors.gray[200]}>)</Typography>
                        </Box>
                        }
                        </Box>
                        <Button variant='contained' sx={{border:'1px solid', padding:'1rem', borderColor:colors.gray[700]}} component='label'>
                            Upload
                            <input name="movie_image" onChange={(e) => setImage(e?.target?.files?.[0]) } type='file' accept="image/png, image/jpeg" hidden />
                        </Button>
                    </Box>
                </Box>
                <Box display='flex' flexDirection='row' gap='5rem'>
                    <Box display='flex' flexDirection='column' gap='1rem'>
                        <FormLabel>Price</FormLabel>
                        <Box display='flex' flexDirection='row' gap='.5rem' alignItems='center'>
                            <TextField sx={{width:'12ch'}} name="price" type='number' InputProps={{ inputProps: { min: 0, max: 99999 } }} defaultValue={0} required></TextField>
                            <Typography>RON</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box marginTop='2rem' display='flex' flexDirection='column' gap='1rem' justifyContent='end'>
                    <Button type='submit' sx={{width:'100%', color:'white', fontSize:'1rem'}} color='success' variant='contained' >
                        {"Create"}
                    </Button>
                    <Button onClick={()=>{setOpenModal(undefined)}} sx={{marginTop:'1rem', marginLeft: '82%', width:'10ch', marginRight:'0', color:'white', fontSize:'1rem'}} color='info' variant='contained'>Cancel</Button>
                </Box>
            </Box>
            </FormControl>
        </form>
    </Box>

      </Modal>

    <Modal
        open={openModal===ModalType.CONFIRM_REMOVE_COMMENT && modalComment !== undefined && modalCommentRemovalStatus > 0}
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
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : '#fafafa'
        }}
        >
          {modalCommentRemovalStatus === 1 && <>
            <Typography textAlign='center' color={colors.primary[100]} variant="h4">
                Are you sure you want to remove this comment? <br /> This action cannot be undone.
            </Typography>
            <Box>
                <Typography margin='2rem 0' textAlign='center' color={colors.primary[100]} sx={{padding: '1rem', borderRadius:'50px', backgroundColor:colors.gray[800]}} variant="h4">
                    {modalComment?.["message"]}
                </Typography>
            </Box>
            <Box
                sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
            >
                <Button onClick={submitRemoveComment} sx={{width:'auto', fontSize:'14px', color:'white'}} color='error' variant='contained'>
                    Remove comment
                </Button>
                <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
                    Cancel
                </Button>
            </Box>
          </>}
          {modalCommentRemovalStatus === 2 && <>
            <Typography textAlign='center' color={colors.primary[100]} variant="h4">
                Are you sure you want to remove {modalComment?.["nickname"]}'s comment? <br /> This action cannot be undone.
            </Typography>
            <Box display='flex' flexDirection='column'>
                <Typography margin='2rem 0 .5rem 0' textAlign='center' color={colors.primary[100]} sx={{padding: '1rem', borderRadius:'50px', backgroundColor:colors.gray[800]}} variant="h4">
                    {modalComment?.["message"]}
                </Typography>
                <Box display='flex' flexDirection='row' justifyContent='space-between'>
                    <Box display='flex' flexDirection='row' justifyContent='start' alignItems='center'>
                        <Typography color={colors.gray[300]} variant='h5' fontStyle='italic'>Original author:&nbsp;</Typography>
                        <Typography variant='h4' marginLeft='.25rem'>{modalComment?.["nickname"]}</Typography>
                    </Box>
                    <Typography color={colors.gray[300]} variant='h5' fontStyle='italic'>Posted {parseDate(modalComment?.["created_date"], true)} </Typography>
                </Box>
            </Box>
            <Box
                sx={{display:'flex', justifyContent:'space-between', marginTop:'2rem', gap:'1rem'}}
            >
                <Button onClick={submitRemoveComment} sx={{width:'auto', fontSize:'14px', color:'white'}} color='error' variant='contained'>
                    Remove comment
                </Button>
                <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
                    Cancel
                </Button>
            </Box>
          </>}
          {modalCommentRemovalStatus === 3 && <>
            <Typography textAlign='center' color={colors.primary[100]} variant="h4">
                Are you sure you want to remove this comment? <br /> This action cannot be undone.
            </Typography>
            <Box>
                <Typography margin='2rem 0' textAlign='center' color={colors.primary[100]} sx={{padding: '1rem', borderRadius:'50px', backgroundColor:colors.gray[800]}} variant="h4">
                    {modalComment?.["message"]}
                </Typography>
            </Box>
            <form
                onSubmit={submitRemoveComment}
            >
            <Box marginTop='2rem'>
                <Typography textAlign='center' color={colors.primary[100]} variant="h4">
                    Delete your comment as a user or as an administrator?
                </Typography>
                    <FormControl component="fieldset">
                        <RadioGroup
                            aria-label="remove-comment-as"
                            defaultValue="user"
                            name="radio-buttons-group"
                            onChange={(e) => setRemoveCommentAs(e.target.value as "user" | "admin") }
                        >
                            <FormControlLabel value="user" control={<Radio  sx={{color: colors.blueAccent[500], '&.MuiSvgIcon-root':{fontSize:'3rem'}, '&.Mui-checked': { color: colors.greenAccent[300] } }} />} label="User" />
                            <FormControlLabel value="admin" control={<Radio sx={{color: colors.blueAccent[500], '&.MuiSvgIcon-root':{fontSize:'3rem'}, '&.Mui-checked': { color: colors.greenAccent[300] } }} />} label="Administrator" />
                        </RadioGroup>
                    </FormControl>
            </Box>
            <Box
                sx={{display:'flex', justifyContent:'space-between', marginTop:'2rem', gap:'1rem'}}
                >
                <Button type='submit' sx={{width:'auto', fontSize:'14px', color:'white'}} color='error' variant='contained'>
                    Remove comment
                </Button>
                <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
                    Cancel
                </Button>
            </Box>
            </form>
          </>}
    </Box>
    </Modal>

    <Modal
        open={openModal===ModalType.PURCHASE && modalCinema !== undefined && modalMovie !== undefined}
        onClose={handleClose}
    >
        <Box
        sx={{
            borderRadius:'1rem',
            border: '3px solid',
            borderColor: colors.greenAccent[500],
            padding:'2rem', alignSelf:'center',
            gap:'.5rem',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            bgcolor: colors.primary[400],
            width: '50%',
            height: 'auto',
            maxHeight: '80vh',
        }}
        >
            <Box
                display='flex'
                flexDirection='row'
            >
            <Typography
                marginTop='1rem'
                marginRight='1rem'
                marginLeft='1rem'
                sx={{
                    fontSize:'1.2rem',
                    fontStyle:'italic'
                }}
            >
                Purchasing ticket to {modalMovie?.["title"]} at {modalCinema?.["name"]}, <span style={{fontWeight:'bold'}} >{modalCinema?.["city"]}, {modalCinema?.["country"]}</span>.
            </Typography>
            </Box>
            <Typography
                marginTop='1rem'
                marginRight='1rem'
                marginLeft='1rem'
            >
                Please enter your booking information below.
            </Typography>
            <Box
                marginTop='2rem'
                marginRight='1rem'
                marginLeft='1rem'
            >
                <Box
                    display='flex'
                    flexDirection='row'
                    width='100%'
                    height='20px'
                    justifyContent='space-between'
                    alignItems='center'
                >
                    <FormControl>
                        <FormLabel id='room-radio-buttons' ><Typography color={colors.primary[100]} variant='h3'>Room:</Typography></FormLabel>
                    </FormControl>
                    <RadioGroup
                        aria-labelledby='room-radio-buttons'
                        name="radio-buttons-group"
                        onChange={(e) => setBookInfo({room: parseInt(e.target.value)}) }
                        sx={{display:'flex', flexDirection:'row', gap:'1rem'}}
                    >
                        {[1,2,3,4,5].map((room, index) => {
                            return (
                                <FormControlLabel key={index} value={room} control={<Radio sx={{color: colors.blueAccent[500], '&.MuiSvgIcon-root':{fontSize:'3rem'}, '&.Mui-checked': { color: colors.greenAccent[300] } }} icon={ <DoorBackIcon sx={{fontSize:'3rem'}} /> } checkedIcon={ <MeetingRoomIcon sx={{fontSize:'3rem'}} /> } />} label={<Typography fontSize='2.5rem'>{room}</Typography>} />
                            )
                        })}
                    </RadioGroup>
                </Box>

                <Box
                    display='flex'
                    flexDirection='row'
                    justifyContent='space-between'
                    width='100%'
                    marginTop='3rem'
                >
                    <FormControl>
                        <FormLabel id='seat-radio-buttons'><Typography color={colors.primary[100]} variant='h3'>Seat:</Typography></FormLabel>
                    </FormControl>
                    {bookInfo["room"] &&
                        <Box display='flex' flexDirection='row' justifyContent='center' width='80%' height='200px' sx={{overflowY:'scroll', overflowX: 'hidden'}}>
                            <RadioGroup
                                aria-labelledby='seat-radio-buttons'
                                name="radio-buttons-group"
                                onChange={(e) => {console.log(e.target.value); setBookInfo({...bookInfo, seat: e.target.value })} }
                                sx={{display:'grid', gridTemplateColumns:'repeat(12, 1.9rem)', gap:'1.4rem'}}
                            >
                                {freeSeats.map((seat, index) => {
                                    return (
                                        <FormControlLabel key={index} value={seat} control={<Radio sx={{color: colors.blueAccent[500], '&.MuiSvgIcon-root':{fontSize:'3rem'}, '&.Mui-checked': { color: colors.greenAccent[300] } }} icon={ <ChairIcon sx={{fontSize:'1rem'}} /> } checkedIcon={ <ChairIcon sx={{fontSize:'1rem'}} /> } />} label={<Typography fontSize='1rem'>{seat}</Typography>} />
                                    )
                                })}
                            </RadioGroup>
                        </Box>
                    }
                    {!bookInfo["room"] &&
                        <Box display='flex' flexDirection='row' justifyContent='end' width='70%' height='50px' sx={{gap:'.5rem'}}>
                            <Typography variant='h4' sx={{marginLeft:'1rem', bgColor:'red', fontStyle:'italic', color:colors.gray[200]}}>Please select a room first.</Typography>
                        </Box>
                    }
                </Box>

                <form onSubmit={(e) => {handlePurchaseSubmit(e, modalMovie!, modalCinema!)}}>
                <Box width='75%' marginTop='5rem' marginLeft='5rem' >
                    <CardElement options={cardElementOptions} />
                </Box>
                <Box
                    display='flex'
                    flexDirection='column'
                    justifyContent='end'
                >
                {paymentError &&
                <Typography
                variant='h4'
                color={colors.redAccent[500]}
                >
                    {paymentError}
                </Typography>
                }
                {!paymentError &&
                <Typography
                variant='h4'
                color={colors.redAccent[500]}
                >
                &#160;&nbsp;
                </Typography>
                }
                <Button disabled={!stripe} type='submit' sx={{
                    padding:'10px', marginTop: '3rem', width:'100%', fontSize:'20px', color:theme.palette.mode === 'dark' ? 'yellow' : colors.primary[100],
                    backgroundColor: theme.palette.mode === 'dark' ? colors.gray[900] : '#ffff00',
                    '&:hover':{
                        transition: 'all .2s',
                        fontWeight:550,
                        backgroundColor: theme.palette.mode === 'dark' ? colors.gray[800] : '#ffffaa'
                    } }}
                    variant='contained'
                    >
                    Purchase ticket to {modalMovie?.["title"]}
                </Button>
                </Box>
                </form>
            </Box>
            <Box
            sx={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between', margin:'1rem', gap:'1rem'}}
            >
                <Box marginTop='2rem' width='100%' display='flex' flexDirection='row' justifyContent='end'>
                    <Button onClick={handleClose} sx={{alignSelf:'right', textAlign:'right', width:'5rem', fontSize:'16px', color:'white'}} variant='contained'>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Box>
    </Modal>
    </>
  )
}

export default Cinema
