import { Box, Typography, useTheme } from '@mui/material'
import React, { FC, useEffect, useState } from 'react'
import { tokens } from '../../theme';
import "./user_row.css";
import { DocumentData, doc, getDoc } from 'firebase/firestore';

function rank(number :number) {
  if (number === 1) return "Member"
  if (number === 2) return "Administrator"
}

const UserRow: FC<{user: DocumentData}> = ({ user } ) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

  return (
    <>
      <Box
        className="mouse-pointer-admins"
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
          flexDirection='column'
          justifyContent='space-evenly'
        >
          <Typography color={colors.greenAccent[500]} variant="h3">{`${user["username"]}`}</Typography>
          <Typography color={colors.primary[100]} variant="h5">{`${rank(user["role"])}`}</Typography>
        </Box>
      </Box>
    </>
  )
}


export default UserRow