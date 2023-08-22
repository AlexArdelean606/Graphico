import { Box, Button, TextField, Typography, useTheme } from '@mui/material'
import { useNavigate } from "react-router-dom"
import { Formik } from 'formik'
import { tokens } from '../../../theme'
import * as yup from 'yup'
import Header from '../../Header'
import { useUserAuth } from "../../../contexts/AuthContext"
import { useState } from "react"
import React from 'react'
import { USERPROFILE } from 'scenes/types'

const initialValues = {
  email: '',
  password: '',
}

const userSchema = yup.object().shape({
  email: yup.string().email('Invalid email!').required('This field is required!'),
  password: yup.string().required('This field is required!'),
})

const Login = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const {logIn} = useUserAuth();

  const navigateTo = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (values : any) => {
    const vEmail = values["email"]
    const vPassword = values["password"]

    try {
      setError("");
      setLoading(true);
      await logIn(vEmail, vPassword).then((res) => {
        navigateTo(USERPROFILE);
      });
    } catch {
      setError("Could not log you in!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title={'YOU ARE NOT LOGGED IN'} subtitle={'Logging in'} />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={userSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display='grid'
              gap='30px'
              gridTemplateRows='repeat(2, minmax(0,1fr))'
              justifyContent='center'
            >
              {/* E MAIL */}
              <TextField
                variant='filled'
                type='text'
                label='Email'
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name='email'
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ width: '69ch', gridRow: '1' }}
              >
              </TextField>
              {/* PASSWORD */}
              <TextField
                variant='filled'
                type='password'
                label='Password'
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name='password'
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ width: '69ch', gridRow: '2' }}
              >
              </TextField>
            </Box>
            <Box display='flex' justifyContent='center' mt='1rem' mb='1rem' width='100%' height='1rem'>
              <Typography
                variant="h5"
                color={colors.redAccent[100]}
              >{error}
              </Typography>
            </Box>
            <Box display='flex' justifyContent='center' mt='3rem' width='100%' height='3rem'>
              <Button disabled={loading} type='submit' sx={{width:'10rem', fontSize:'16px', fontWeight:'bolder'}} color='info' variant='contained'>
                Log in
              </Button>
            </Box>
          </form>
        ) }
      </Formik>
    </>
  )
}

export default Login