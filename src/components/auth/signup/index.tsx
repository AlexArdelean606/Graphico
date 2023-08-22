import { Box, Button, TextField, Typography, useTheme } from '@mui/material'
import { useNavigate } from "react-router-dom"
import { Formik } from 'formik'
import { tokens } from '../../../theme'
import * as yup from 'yup'
import Header from '../../Header'
import { useUserAuth } from "../../../contexts/AuthContext"
import { useState } from "react"
import React from 'react'

const initialValues = {
  username: '',
  email: '',
  password: '',
  confirm_password: ''
}

const userSchema = yup.object().shape({
  username: yup.string().min(3, 'Your username must be at least 3 characters long!').max(20, 'Your username cannot be longer than 20 characters!').required('This field is required!'),
  email: yup.string().email('Invalid email!').required('This field is required!'),
  password: yup.string().required('This field is required!'),
  confirm_password: yup.string().required('This field is required!').oneOf([yup.ref('password'), null], 'Passwords must match!' )
})

const Signup = () => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const {signUp} = useUserAuth();

  const navigateTo = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (values : any) => {
    const vEmail = values["email"]
    const vPassword = values["password"]
    const vConfirmPassword = values["confirm_password"]
    const vUsername = values["username"]
    console.log(values)

    if(vPassword !== vConfirmPassword){
      return setError("Passwords do not match!")
    }

    try {
      setError("");
      setLoading(true);
      await signUp(vEmail, vPassword, vUsername);
      navigateTo(0);
    } catch {
      setError("Could not sign you up!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title={'YOU ARE NOT LOGGED IN'} subtitle={'Signing up'} />
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
              gridTemplateRows='repeat(4, minmax(0,1fr))'
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
              {/* USERNAME */}
              <TextField
                variant='filled'
                type='text'
                label='Username'
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name='username'
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{ width: '69ch', gridRow: '2' }}
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
                sx={{ width: '69ch', gridRow: '3' }}
              >
              </TextField>
              {/* CONFIRM PASSWORD */}
              <TextField
                variant='filled'
                type='password'
                label='Confirm Password'
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.confirm_password}
                name='confirm_password'
                error={!!touched.confirm_password && !!errors.confirm_password}
                helperText={touched.confirm_password && errors.confirm_password}
                sx={{ width: '69ch', gridRow: '4' }}
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
                Sign up
              </Button>
            </Box>
          </form>
        ) }
      </Formik>
    </>
  )
}

export default Signup