import { Box, Button, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { DocumentData } from "firebase/firestore";
import React from 'react';
import { tokens } from 'theme';
import { useNavigate } from 'react-router-dom';
import { USER } from 'scenes/types';
import './commentitem.css'
import { useUserAuth } from 'contexts/AuthContext';
import NotInterestedIcon from '@mui/icons-material/NotInterested';


const CommentItem = ({ comment, openRemoveCommentModal } :{
    comment :DocumentData
    openRemoveCommentModal :(comment :DocumentData, status:number) => void
} ) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const { user, accountData } = useUserAuth();

    const navigateTo = useNavigate();


    const parseDate = (milliseconds: number) => {
        const dt_1 :Date = new Date(milliseconds);

        let dt_2 :string = '';
        dt_2 = dt_1.toLocaleString('en-EN', { timeZone: 'Europe/Bucharest', hour12: true, hour: '2-digit', minute: '2-digit', weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' });

        return `${dt_2.toUpperCase() }`
    }

    if (comment["deleted"] > 0 && comment["created_by"] !== user.uid && accountData["role"] !== 2) return (<></>);

    return (
        <>
            <Box
                bgcolor={
                    comment["deleted"] === 0 ? '' : 
                    (comment["deleted"] === 1 && (comment["created_by"] === user.uid || accountData["role"] === 2) ? '#5f4a4a' : 
                    (comment["deleted"] === 2 && (comment["created_by"] === user.uid || accountData["role"] === 2) ? '#aa4040' : '') )
                }
                display='flex'
                flexDirection='column'
                alignContent='left'
                paddingTop='1rem'
                paddingBottom='3rem'
                className='comment-item'
            >   
                <Box display='flex' flexDirection='row' alignItems='flex-start' >
                <img
                    alt={`${comment["nickname"]}`}
                    width="100px"
                    height="100px"
                    src={require('assets/default_pfp.png')}
                    style={{ cursor: "pointer", borderRadius: "50%" }}
                    onClick={()=>{navigateTo( USER.replace(":userid", comment["created_by"]) )}}
                />
                <Box marginLeft='2rem' display='flex' flexDirection='column' width='100%' justifyContent='left'>
                    <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center'>
                        <Box display='flex' flexDirection='column'>
                            <Typography color={colors.greenAccent[500]} variant="h3">{`${comment["nickname"]}`}</Typography>
                            <Typography fontStyle='italic' color={colors.primary[100]}>{`${parseDate(comment["created_date"])}`}</Typography>
                        </Box>
                        {((comment["created_by"] === user.uid || accountData["role"] === 2) && comment["deleted"] === 0) &&
                            <IconButton 
                            onClick={()=>{
                                let status = 0;
                                
                                if (comment["created_by"] === user.uid)
                                    status = 1;

                                if (accountData["role"] === 2)
                                    status = 2;

                                if (comment["created_by"] === user.uid && accountData["role"] === 2)
                                    status = 3;
                                
                                if (status < 1) 
                                    return;
                                
                                openRemoveCommentModal(comment, status);
                            }} 
                            color='error' 
                            sx={{ marginRight:'3rem', borderRadius:'10px', border:'1px solid', padding:'.5rem 1.2rem', alignSelf:'center', gap:'.5rem'}}
                            >
                                {<NotInterestedIcon />}
                                <Typography color={colors.primary[100]} variant="h4">Remove</Typography>
                            </IconButton>
                        }
                    </Box>

                    <Box sx={{marginTop: '2rem', borderRadius:'15px', width:'100%', backgroundColor:theme.palette.mode === 'dark' ? '#353535' : '#cccccc', padding:'20px'}} >
                        <Typography 
                            color={
                                (comment["deleted"] === 1 && (comment["created_by"] === user.uid || accountData["role"] === 2)) ? '#da3535' :
                                (comment["deleted"] === 2 && (comment["created_by"] === user.uid || accountData["role"] === 2)) ? '#ff0000' :
                                theme.palette.mode === 'dark' ? '#ffffff' : '#000000'
                            }   
                            variant="h5"
                        >
                            {comment["deleted"] === 0 && `${comment["message"]}`}
                            {comment["deleted"] === 1 && (comment["created_by"] === user.uid) && <>
                                <Tooltip arrow title={<span style={{fontSize:'.75rem'}}>{"This comment was removed by you."}</span>}>
                                    <span>{comment["message"]}</span>
                                </Tooltip>
                            </>
                            }
                            {comment["deleted"] === 1 && (comment["created_by"] !== user.uid && accountData["role"] === 2) && <>
                                <Tooltip arrow title={<span style={{fontSize:'.75rem'}}>{`This comment was removed by ${comment["nickname"]}.`}</span>}>
                                    <span>{comment["message"]}</span>
                                </Tooltip>
                            </>
                            }
                            {comment["deleted"] === 2 && (comment["created_by"] === user.uid || accountData["role"] === 2) && <>
                                <Tooltip arrow title={<span style={{fontSize:'.75rem'}}>{"This comment was removed by a site administrator."}</span>}>
                                    <span>{comment["message"]}</span>
                                </Tooltip>
                            </>
                            }
                        </Typography>
                    </Box>

                </Box>
                </Box>
            </Box>
        </>
    )
}

export default CommentItem