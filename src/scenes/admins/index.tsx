import { Box, Typography } from "@mui/material";
import Header from "../../components/Header";
import { whereQuery } from "../../actions";
import { useState, useEffect } from "react";
import UserRow from "./user_row";
import React from "react";
import { DocumentData } from "firebase/firestore";

const Admins = () => {

  const [loading, setLoading] = useState(true);

  const [DBAdmins, setDBAdmins] = useState<DocumentData[]>([]);

  useEffect(() => {
    whereQuery('accounts', 'role', 2, '>=').then((adminAccs) => {
        for(let i = 0; i < adminAccs.length; i++){
            const admin = adminAccs[i];
            whereQuery('users', 'account_id', admin.id, '==').then((adminData) => {
                setDBAdmins(DBAdmins => [...DBAdmins, {...adminData[0], id: admin.id, role: admin.role}]);
            } );
        }
    } );

    setLoading(false);
  }, [])

  let content = null;

  if (loading){
    content = <Typography variant="h3">Fetching...</Typography>
  }
  else if(DBAdmins.length){
    content = DBAdmins.map(user => {
      return <UserRow key={user.id} user={user} />
    } )
  }
  else {
    content = <Typography variant="h3">{"Fetching. . ."}</Typography>
  }

  return (
    <>
      <Header title="" subtitle={DBAdmins ? `${DBAdmins.length} administrator${DBAdmins.length === 1 ? '' : 's'}` : `...`} />
      <Box
        height="75vh"
      >
        {content}
      </Box>
    </>
  );
};

export default Admins;