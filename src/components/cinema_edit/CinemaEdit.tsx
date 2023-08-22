import { Box, Button, FormControl, FormLabel, TextField, Typography, useTheme } from '@mui/material';
import { DocumentData } from 'firebase/firestore';
import React, { SyntheticEvent } from 'react'
import { tokens } from 'theme';

const CinemaEdit = ({cinema = [] as DocumentData, onSubmit, onCancel} : {
    cinema?: DocumentData,
    onSubmit: (evt :SyntheticEvent, cinema ?:DocumentData) => void,
    onCancel: () => void
} ) => {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [image, setImage] = React.useState<File | undefined>();

    return (
    <Box
    sx={{
        borderRadius:'1rem',
        border: '2px solid',
        borderColor: Object.keys(cinema).length < 1 ? colors.greenAccent[300] : 'yellow',
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
        <form onSubmit={(e)=>onSubmit(e, cinema)}>
            {(Object.keys(cinema).length < 1) && <Typography marginLeft='2rem' variant="h3">Inserting a new cinema</Typography>}
            {(Object.keys(cinema).length >= 1) &&
                <Box display='flex' flexDirection='row' gap='.5rem' alignItems='center'>
                <Typography marginLeft='2rem' variant="h3">Editing </Typography>
                <Typography variant="h3" sx={{fontSize: '2.1rem',
                        background: `-webkit-linear-gradient(#1b049e, #ffd4ee)`,
                        'WebkitBackgroundClip': 'text',
                        'WebkitTextFillColor': 'transparent',
                        filter: `drop-shadow(2rem 2rem 10rem ${theme.palette.mode === 'dark' ? "ff0000" : "ff0000"})`}} >{cinema?.["name"]}</Typography>
                </Box>
            }
            <FormControl>
            <Box width='100%' padding='2rem' display='flex' flexDirection='column'>
                <Box display='flex' flexDirection='column' gap='2rem'>
                    <Box display='flex' flexDirection='column' gap='.5rem'>
                        <FormLabel>Name</FormLabel>
                        <TextField sx={{width:'100%', input:{ fontSize:'1.5rem',
                        background: `-webkit-linear-gradient(#1b049e, #ffd4ee)`,
                        'WebkitBackgroundClip': 'text',
                        'WebkitTextFillColor': 'transparent',

                        }}} name="name" type='text' defaultValue={cinema?.["name"]} required></TextField>
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
                            <input name="picture" onChange={(e) => setImage(e?.target?.files?.[0]) } type='file' accept="image/png, image/jpeg" hidden />
                        </Button>
                    </Box>
                    <Box display='flex' flexDirection='column' gap='.5rem'>
                        <FormLabel>Description</FormLabel>
                        <TextField name="description" type='text' defaultValue={cinema?.["description"]} required></TextField>
                    </Box>
                </Box>
                <Box margin='2rem 0' display='flex' flexDirection='row' gap='5rem'>
                    <Box display='flex' flexDirection='column' gap='1rem'>
                        <FormLabel>Country</FormLabel>
                        <TextField name="country" type='text' defaultValue={cinema?.["country"]} required></TextField>
                    </Box>
                    <Box display='flex' flexDirection='column' gap='1rem'>
                        <FormLabel>City</FormLabel>
                        <TextField name="city" type='text' defaultValue={cinema?.["city"]} required></TextField>
                    </Box>
                </Box>
                <Box display='flex' flexDirection='row' gap='5rem'>
                    <Box display='flex' flexDirection='column' gap='1rem'>
                        <FormLabel>Opening hour and minutes</FormLabel>
                        <Box display='flex' flexDirection='row' gap='.5rem' alignItems='center'>
                            <TextField sx={{width:'12ch'}} name="opening_hour" type='number' InputProps={{ inputProps: { min: 0, max: 23 } }} defaultValue={cinema?.["opening_hour"]} required></TextField>
                            <Typography>:</Typography>
                            <TextField sx={{width:'12ch'}} name="opening_minute" type='number' InputProps={{ inputProps: { min: 0, max: 59 } }} defaultValue={cinema?.["opening_minute"]} required></TextField>
                        </Box>
                    </Box>

                    <Box display='flex' flexDirection='column' gap='1rem'>
                        <FormLabel>Closing hour and minutes</FormLabel>
                        <Box display='flex' flexDirection='row' gap='.5rem' justifyContent='end' alignItems='center'>
                            <TextField sx={{width:'12ch'}} name="closing_hour" type='number' InputProps={{ inputProps: { min: 0, max: 23 } }} defaultValue={cinema?.["closing_hour"]} required></TextField>
                            <Typography>:</Typography>
                            <TextField sx={{width:'12ch'}} name="closing_minute" type='number' InputProps={{ inputProps: { min: 0, max: 59 } }} defaultValue={cinema?.["closing_minute"]} required></TextField>
                        </Box>
                    </Box>
                </Box>
                <Box margin='2rem 0 0 0' display='flex' flexDirection='column' gap='.5rem'>
                    <FormLabel sx={{fontStyle:'italic', color:theme.palette.mode==='dark'?'yellow':colors.greenAccent[500]}}>Post an announcement! (Optional)</FormLabel>
                    <TextField name="announcement" type='text' defaultValue={cinema?.["announcement"]}></TextField>
                </Box>
                <Box marginTop='2rem' display='flex' flexDirection='column' gap='1rem' justifyContent='end'>
                    <Button type='submit' sx={{width:'100%', color:'white', fontSize:'1rem'}} color='success' variant='contained' >
                        { (Object.keys(cinema).length < 1) ? "Create" : "Update"}
                    </Button>
                    <Button onClick={onCancel} sx={{marginTop:'1rem', marginLeft: '82%', width:'10ch', marginRight:'0', color:'white', fontSize:'1rem'}} color='info' variant='contained'>Cancel</Button>
                </Box>
            </Box>
            </FormControl>
        </form>
    </Box>
  )
}


export default CinemaEdit;