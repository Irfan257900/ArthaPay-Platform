import React from 'react'
import { Outlet, useOutletContext } from 'react-router'

const Memberships = () => {
    const outletContext=useOutletContext()
  return (
    <Outlet context={outletContext}/>
  )
}

export default Memberships