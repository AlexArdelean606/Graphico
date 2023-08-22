import { Box, Modal, useTheme, Typography, Button, TextField, IconButton } from "@mui/material";
import Header from "../../components/Header";
import { add, get, getAll, remove, set, upload, whereQuery } from "../../actions";
import { tokens } from '../../theme';
import { useState, useEffect, SyntheticEvent } from "react";
import CinemaRow from "./cinema_row";
import React from "react";
import { DocumentData } from "firebase/firestore";
import CinemaEdit from "components/cinema_edit/CinemaEdit";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export interface CinemasSelectionDashboardProps {
    currentTime :{hour :number, minute :number}
}

enum ModalType {
    EDIT,
    REMOVE,
    RESET
}

const CinemasSelectionDashboard = (currentTime :{hour :number, minute :number}) => {

  const [loading, setLoading] = useState(true);

  const [DBCinemas, setDBCinemas] = useState<DocumentData[]>([]);
  const [notifyDBCinemasEffect, setNotifyDBCinemasEffect] = useState(false);

  const [openModal, setOpenModal] = useState<ModalType | null>(null);


  const [modalCinema, setModalCinema] = useState<DocumentData>();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleClose = () => {
    setOpenModal(null);
  };

  const handleEditSubmit = (event: SyntheticEvent, cinema: DocumentData = []) => {
    event.preventDefault();

    const target = event.target as typeof event.target & {
        [key: string]: {value: string|number, files: FileList}
    }

    if (Object.keys(cinema).length > 0){
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
                    setDBCinemas([]);
                    setNotifyDBCinemasEffect(true);
                    handleClose();
                } );
            }
            else{
                setDBCinemas([]);
                setNotifyDBCinemasEffect(true);
                handleClose();
            }
        });
    }
    else{
        add('cinemas_original', {
            announcement: "",
            city: target["city"].value,
            closing_hour: target["closing_hour"].value,
            closing_minute: target["closing_minute"].value,
            country: target["country"].value,
            description: target["description"].value,
            name: target["name"].value,
            opening_hour: target["opening_hour"].value,
            opening_minute: target["opening_minute"].value,
            picture: target["picture"]?.files[0]?.name || "cinema.png",
        } ).then((docRef) => {
            set('cinemas', docRef.id, {
                announcement: target["announcement"].value,
                city: target["city"].value,
                closing_hour: target["closing_hour"].value,
                closing_minute: target["closing_minute"].value,
                country: target["country"].value,
                description: target["description"].value,
                name: target["name"].value,
                opening_hour: target["opening_hour"].value,
                opening_minute: target["opening_minute"].value,
                picture: target["picture"]?.files[0]?.name || "cinema.png",
            } ).then(() => {
                if (target["picture"]?.files[0]){
                    upload(target["picture"].files[0], target["picture"].files[0].name).then(() => {
                    setDBCinemas([]);
                    setNotifyDBCinemasEffect(true);
                    handleClose();
                } );
            }
            else{
                setDBCinemas([]);
                setNotifyDBCinemasEffect(true);
                handleClose();
            }
        });
        } );
    }
}

  function openEditModal(cinema :DocumentData) {
    setOpenModal(ModalType.EDIT);
    setModalCinema( cinema );
  }

  function openRemoveModal(cinema :DocumentData) {
    setOpenModal(ModalType.REMOVE);
    setModalCinema( cinema );
  }

  function openResetModal(cinema :DocumentData) {
    setOpenModal(ModalType.RESET);
    setModalCinema( cinema );
  }

  useEffect(() => {
    getAll('cinemas').then(cinemas => {
      setDBCinemas(cinemas)
      setLoading(false)
    } )
  }, [])

  useEffect(() => {
    if (notifyDBCinemasEffect)
        getAll('cinemas').then(cinemas => {
            setDBCinemas(cinemas)
            setLoading(false)
            setNotifyDBCinemasEffect(false)
        } )
  }, [notifyDBCinemasEffect])


  let content = null;

  if (loading){
    content = <Typography variant="h3">Fetching...</Typography>
  }
  else if(DBCinemas.length){
    content = DBCinemas.map(cinema => {
      return <CinemaRow key={cinema.id} currentTime={currentTime} cinema={cinema}
        editCinemaModal={() => openEditModal(cinema)}
        removeCinemaModal={() => openRemoveModal(cinema)}
        resetCinemaModal={() => openResetModal(cinema)}
        onDashboard={true} />
    } )
  }
  else {
    content = <Typography variant="h3">No cinemas</Typography>
  }

  return (
    <>
      <Header title="" subtitle={DBCinemas ? `${DBCinemas.length} cinema${DBCinemas.length === 1 ? '' : 's'}` : `...`} />
      <Box
        maxHeight="75vh"
      >
        {content}
      </Box>
      <Box display='flex' justifyContent='center'
      >
        <IconButton
            sx={{color:theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500], borderRadius:'20px', border:'1px solid', borderColor:theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500], padding:'1rem', alignSelf:'center', gap:'.5rem'}}
            onClick={ ()=>{
                openEditModal({})
            } }
        >
            <AddCircleOutlineIcon/>
            <Typography color={theme.palette.mode==='dark' ? 'yellow' : colors.greenAccent[500]} variant="h4">Create new cinema</Typography>
        </IconButton>
      </Box>
      <Modal
        open={openModal === ModalType.EDIT}
        onClose={handleClose}
      >
        <CinemaEdit cinema={modalCinema} onSubmit={handleEditSubmit} onCancel={handleClose}/>
      </Modal>

      <Modal
        open={openModal === ModalType.REMOVE}
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
            Are you sure you want to remove {modalCinema?.["name"]} from Graphico? <br /> This action cannot be undone.
          </Typography>
          <Box
            sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
          >
            <Button
                sx={{width:'auto', fontSize:'14px', color:'white'}}
                color='error' variant='contained'
                onClick={() => {
                    remove('cinemas_original', modalCinema?.["id"]).then(() => {
                        remove('cinemas', modalCinema?.["id"]).then(() => {
                            setDBCinemas([]);
                            setNotifyDBCinemasEffect(true);
                            handleClose();
                        } );
                    });
                } }
            >
              Remove {modalCinema?.["name"]}
            </Button>
            <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openModal === ModalType.RESET}
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
            Are you sure you want to revert {modalCinema?.["name"]} information back to its original values? <br /> This action cannot be undone.
          </Typography>
          <Box
            sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
          >
            <Button
                sx={{width:'auto', fontSize:'14px', color:'white'}}
                color='error' variant='contained'
                onClick={() => {
                    console.log(modalCinema?.["id"]);
                    // query the original cinema
                    get("cinemas_original", modalCinema?.["id"]).then((cinema) => {
                        set('cinemas', modalCinema?.["id"], {
                            ...cinema,
                        }).then(() => {
                            setDBCinemas([]);
                            setNotifyDBCinemasEffect(true);
                            handleClose();
                        } );
                    });
                } }
            >
              Reset {modalCinema?.["name"]}
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

export default CinemasSelectionDashboard;