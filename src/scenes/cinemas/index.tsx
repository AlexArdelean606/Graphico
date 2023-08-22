import { Box, Button, Checkbox, FormControlLabel, FormGroup, Input, Modal, Typography, useTheme} from "@mui/material";
import Header from "../../components/Header";
import { getAll } from "../../actions";
import { useState, useEffect, useRef } from "react";
import CinemaRow from "./cinema_row";
import { DocumentData, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { tokens } from '../../theme';
import React from "react";
import { isTime1Ibetween } from "utils/dateToText";

enum ModalType {
    EDIT,
    REMOVE,
    RESET
}


const CinemasSelection = () => {

    const currentTime = {
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
    };

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [search, setSearch] = useState("");
    const [countrySearch, setCountrySearch] = useState("");
    const [citySearch, setCitySearch] = useState("");

    const [openSearch, setOpenSearch] = useState(true);
    const [closedSearch, setClosedSearch] = useState(true);


  const [loading, setLoading] = useState(true);

  const [DBCinemas, setDBCinemas] = useState<DocumentData[]>([]);

  const [openModal, setOpenModal] = useState<ModalType | null>(null);

  const [modalCinema, setModalCinema] = useState<DocumentData>();

  const handleClose = () => {
    setOpenModal(null);
  };

  function openEditModal(cinema: DocumentData) {
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
        setDBCinemas( cinemas);
    } )

    setLoading(false)
  }, [])

  let content = null;

  if (loading){
    content = <Typography variant="h3">Fetching...</Typography>
  }

  else if(DBCinemas.length){
    content = DBCinemas.filter( (cinema) => {

        if (!openSearch && isTime1Ibetween(currentTime, {opening_hour:cinema["opening_hour"], opening_minute:cinema["opening_minute"], closing_hour:cinema["closing_hour"], closing_minute:cinema["closing_minute"]} ) )
            return false;

        if (!closedSearch && !isTime1Ibetween(currentTime, {opening_hour:cinema["opening_hour"], opening_minute:cinema["opening_minute"], closing_hour:cinema["closing_hour"], closing_minute:cinema["closing_minute"]} ) )
            return false;

        if (!openSearch && !closedSearch) return false;

        if (search === "" && countrySearch === "" && citySearch === "")
            return true;

        if (search !== "" && !cinema.name.toLowerCase().includes(search.toLowerCase()))
            return false;

        if (countrySearch !== "" && !cinema.country.toLowerCase().includes(countrySearch.toLowerCase()))
            return false;

        if (citySearch !== "" && !cinema.city.toLowerCase().includes(citySearch.toLowerCase()))
            return false;

        return true;
    } )
    .map(cinema => {
        return <CinemaRow currentTime={currentTime} key={cinema.id} cinema={cinema}
            editCinemaModal={()=>openEditModal(cinema)}
            removeCinemaModal={()=>openRemoveModal(cinema)}
            resetCinemaModal={()=>openResetModal(cinema)}
        />
    } )
  }
  else {
    content = <Typography variant="h3">No cinemas</Typography>
  }

  return (
    <Box m="20px">
      <Header title="CINEMA LIST" subtitle={DBCinemas ? `${DBCinemas.length} result${DBCinemas.length === 1 ? '' : 's'}` : `...`} />

      <Box
        display='flex'
        flexDirection='row'
        justifyContent='space-between'
        alignItems='center'
        gap='2rem'
      >
        <Typography
          variant="h3"
          color={colors.primary[100]}
        >
          Search for a cinema
        </Typography>
        <Input
            sx={{width:'80%', fontSize:'1.25rem', p:'.6rem 1rem', backgroundColor:theme.palette.mode === "dark" ? colors.primary[700] : colors.primary[900]}}
            placeholder="Cinema name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Box
        display='flex'
        flexDirection='row'
        justifyContent='space-between'
        alignItems='center'
        gap='2rem'
        marginTop='1rem'
      >
        <FormControlLabel sx={{ color:colors.primary[100] }} control={<Checkbox sx={{ '&.Mui-checked': {color: colors.primary[100]} }} defaultChecked={openSearch}   value={openSearch} onChange={(e) => setOpenSearch(e.target.checked) } />} label={<Typography variant="h3" >Open</Typography>} />
        <FormControlLabel sx={{ color:colors.primary[100] }} control={<Checkbox sx={{ '&.Mui-checked': {color: colors.primary[100]} }} defaultChecked={closedSearch} value={closedSearch} onChange={(e) => setClosedSearch(e.target.checked) }   />} label={<Typography variant="h3" >Closed</Typography>}/>
        <Typography
          variant="h4"
          color={colors.primary[100]}
        >
          Search by country
        </Typography>
        <Input
            sx={{width:'25%', fontSize:'1.25rem', p:'.6rem 1rem', backgroundColor:theme.palette.mode === "dark" ? colors.primary[700] : colors.primary[900]}}
            placeholder="Country name"
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
        />
        <Typography
          variant="h4"
          color={colors.primary[100]}
        >
          Search by city
        </Typography>
        <Input
            sx={{width:'25%', fontSize:'1.25rem', p:'.6rem 1rem', backgroundColor:theme.palette.mode === "dark" ? colors.primary[700] : colors.primary[900]}}
            placeholder="City name"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
        />
      </Box>

      <Box
        m="5rem 0 0 0"
        height="75vh"
      >
        {content}
      </Box>
      {/* <Modal
        open={openModal === ModalType.EDIT}
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
            Are you sure you want to edit {modalCinema?.["name"]}?
          </Typography>
          <Box
            sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
          >
            <Button sx={{width:'auto', fontSize:'14px', color:'white'}} color='error' variant='contained'>
              Edit {modalCinema?.["name"]}
            </Button>
            <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal> */}

      {/* <Modal
        open={openModal === ModalType.REMOVE}
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
            Are you sure you want to remove {modalCinema?.["name"]} from Graphico? <br/> This action cannot be undone.
          </Typography>
          <Box
            sx={{display:'flex', justifyContent:'space-between', marginTop:'1rem', gap:'1rem'}}
          >
            <Button sx={{width:'auto', fontSize:'14px', color:'white'}} color='error' variant='contained'>
              Remove {modalCinema?.["name"]}
            </Button>
            <Button onClick={handleClose} sx={{width:'auto', fontSize:'14px', color:'white'}} color='info' variant='contained'>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal> */}

    </Box>
  );
};

export default CinemasSelection;