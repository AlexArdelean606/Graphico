import { Box, Modal, Button, useTheme, Typography } from "@mui/material";
import Header from "../../components/Header";
import { banAccount, getAll, set, unbanAccount, whereQuery } from "../../actions";
import { useState, useEffect } from "react";
import { tokens } from '../../theme';
import UserRow from "./user_row";
import React from "react";
import { DocumentData } from "firebase/firestore";

enum ModalType {
    UNBAN,
    RESTRICT
}

const Users = () => {

  const [loading, setLoading] = useState(true);

  const [DBUsers, setDBUsers] = useState<DocumentData[]>([]);

  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const [notifyDBUsers, setNotifyDBUsers] = useState<boolean>(false);

  const [modalUser, setModalUser] = useState<DocumentData>();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);



  const handleClose = () => {
    setOpenModal(null);
  };

  function openUnbanModal(user: DocumentData) {
    setOpenModal(ModalType.UNBAN);
    setModalUser( user );
  }

  function openRestrictModal(user :DocumentData) {
    setOpenModal(ModalType.RESTRICT);
    setModalUser( user );
  }

  useEffect(() => {
    setDBUsers([]);
    getAll('accounts').then(accounts => {
        for(let i = 0; i < accounts.length; i++){
            const account = accounts[i];
            whereQuery('users', 'account_id', account.id, '==').then((userData) => {
                setDBUsers(DBUsers => [...DBUsers, {...userData[0], id: account.id, role: account.role, banned: account.banned}]);
            } );
        }
    } );

    setLoading(false);
  }, [])


  useEffect(() => {
    if(notifyDBUsers){
        setDBUsers([]);
        getAll('accounts').then(accounts => {
            for(let i = 0; i < accounts.length; i++){
                const account = accounts[i];
                whereQuery('users', 'account_id', account.id, '==').then((userData) => {
                    setDBUsers(DBUsers => [...DBUsers, {...userData[0], id: account.id, role: account.role, banned: account.banned}]);
                } );
            }
            setNotifyDBUsers(false);
        } )
    }

    setLoading(false);
  }, [notifyDBUsers])


  let content = null;

  if (loading){
    content = <Typography variant="h3">Fetching...</Typography>
  }
  else if(DBUsers.length){
    content = DBUsers.map(user => {
      return <UserRow key={user.id} user={user} unbanModal={() => openUnbanModal(user)} restrictAccessModal={() => openRestrictModal(user)} />
    } )
  }
  else {
    content = <Typography variant="h3">{"Fetching. . ."}</Typography>
  }

  return (
    <>
      <Header title="" subtitle={DBUsers ? `${DBUsers.length} member${DBUsers.length === 1 ? '' : 's'}` : `...`} />
      <Box
        height="75vh"
      >
        {content}
      </Box>
      <Modal
        open={openModal === ModalType.RESTRICT}
        onClose={handleClose}
      >
        <Box
        sx={{
            borderRadius:'1rem',
            border: '3px solid',
            borderColor: colors.redAccent[500],
            padding:'2rem', alignSelf:'center',
            gap:'.5rem',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: colors.primary[400]
        }}
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.primary[100] : colors.primary[600]} variant="h4">
            Are you sure you want to block {modalUser?.["username"]}'s access to Graphico?
          </Typography>
          <Box
            sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
          >
            <Button onClick={ () => {
                banAccount(modalUser?.["account_id"]).then(() => {
                    setNotifyDBUsers(true); handleClose();
                } ).catch((err) => console.log(err));
            } } sx={{width:'auto', fontSize:'14px', color:'white'}} color='error' variant='contained'>
              Block {modalUser?.["username"]}
            </Button>
            <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openModal === ModalType.UNBAN}
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
            transform: 'translate(-50%, -50%)',
            bgcolor: colors.primary[400]
        }}
        >
          <Typography color={theme.palette.mode === 'dark' ? colors.primary[100] : colors.primary[600]} variant="h4">
            Are you sure you want to reinstate {modalUser?.["username"]}'s access to Graphico?
          </Typography>
          <Box
            sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
          >
            <Button onClick={ () => {
                unbanAccount(modalUser?.["account_id"]).then(() => {
                    setNotifyDBUsers(true); handleClose();
                } ).catch((err) => console.log(err));
            } } sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
              Unban {modalUser?.["username"]}
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

export default Users;