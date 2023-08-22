import { Box, useTheme } from "@mui/material"
import { tokens } from "../../theme"
import Header from "../../components/Header"
import { getAll } from "../../actions"
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import SlideshowIcon from '@mui/icons-material/Slideshow';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import StatBox from '../../components/StatBox'
import { CSSProperties, ReactNode, useState } from "react";
import { useEffect } from "react";
import React from "react"

const Home = () => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  const [usercount, setUsercount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [reviewcount, setReviewcount] = useState(0);
  const [loadingRC, setLoadingRC] = useState(true);

  useEffect(() => {
    getAll('users').then(users => {
      setUsercount(users.length)
      setLoading(false)
    } )
  }, [])

  useEffect(() => {
    getAll('cinema_reviews').then(cinema_reviews => {
        setReviewcount(cinema_reviews.length)
        setLoadingRC(false)
    } )
  }, [])

  const Row = ({children} :any) => {
    return (
      <>
        {children}
      </>
    )
  }

  interface RowElementProps {
    gridColumn?: string
    gridRow?: string
    bgcolor?: string
    display?: string
    alignItems?: string
    justifyContent?: string
    flexDirection?: CSSProperties['flexDirection']
    overflow?: CSSProperties['overflow']
    width?: CSSProperties['width']
    height?: CSSProperties['height']
    p?: CSSProperties['padding']
    children: ReactNode
  }

  const RowElement = ({
    gridColumn = '3',
    gridRow = '1',
    bgcolor = colors.primary[400],
    display = 'flex',
    alignItems = 'center',
    justifyContent = 'center',
    flexDirection = 'row' as CSSProperties['flexDirection'],
    overflow = 'visible',
    width = 'auto',
    height = 'auto',
    p = '0px',
    children
  } :RowElementProps ) => {

    return (
      <Box
        gridColumn={`span ${gridColumn}`}
        gridRow={`span ${gridRow}`}
        bgcolor={bgcolor}
        display={display}
        flexDirection={flexDirection}
        alignItems={alignItems}
        justifyContent={justifyContent}
        overflow={overflow}
        width={width}
        height={height}
        p={p}
      >
        {children}
      </Box>
    )
  }

  return (
  <Box m='20px'>
    <Box display='flex' justifyContent='space-between' alignItems='center' >
      <Header title="HOME PAGE" subtitle="Welcome to Graphico" />
    </Box>

    {/* GRID */}
    <Box
      display='grid'
      gridTemplateColumns='repeat(12, 1fr)'
      gridAutoRows='140px'
      gap='20px'
    >
      {/* ROW 1 ELEMENTS */}
      <Row>
        <RowElement>
          <StatBox
            title={loading ? '...' : usercount}
            subtitle='New users'
            icon={<PeopleAltIcon sx={{
              color: colors.greenAccent[600],
              fontSize: '26px'
            }} />}
          />
        </RowElement>
      </Row>
      <Row>
        <RowElement>
          <StatBox
            title={loadingRC ? '...' : reviewcount}
            subtitle='New cinema reviews'
            icon={<LocalMoviesIcon sx={{
                color: colors.greenAccent[600],
                fontSize: '26px'
              }} />}
              />
        </RowElement>
      </Row>
    </Box>
  </Box>
  )
}

export default Home