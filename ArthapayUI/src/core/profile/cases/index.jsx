import React from 'react'
import { Outlet, useOutletContext } from 'react-router'

const Cases = () => {
    const outletContext=useOutletContext()
  return (
    <Outlet context={outletContext}/>
  )
}

export default Cases