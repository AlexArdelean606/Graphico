import { Box, Typography } from "@mui/material";
import Header from "../../components/Header";
import { getAll, whereQuery } from "../../actions";
import { useState, useEffect } from "react";
import UserRow from "./user_row";
import React from "react";
import { DocumentData } from "firebase/firestore";

const CinemaManageApps = () => {

  const [loading, setLoading] = useState(true);

  const [DBApps, setDBApps] = useState<DocumentData[]>([]);

  useEffect(() => {
    getAll('applications').then((applications) => {
        setDBApps(applications);
    } );

    setLoading(false);
  }, [])

  let content = null;

  if (loading){
    content = <Typography variant="h3">Fetching...</Typography>
  }
  else if(DBApps.length){
    content = DBApps.map(user => {
      return <UserRow key={user.id} user={user} />
    } )
  }
  else {
    content = <Typography variant="h3">{"Fetching. . ."}</Typography>
  }

  return (
    <>
      <Header title="" subtitle={DBApps ? `${DBApps.length} application${DBApps.length === 1 ? '' : 's'}` : `...`} />
      <Box
        height="75vh"
      >
        {content}
      </Box>
    </>
  );
};

export default CinemaManageApps;