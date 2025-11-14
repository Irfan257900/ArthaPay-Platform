import React from 'react'
import errorimg from '../../../src/assets/images/error-img.png'
const NotFound = () => {
  return (
    <div className='bg-sectionBG min-h-screen flex items-center text-center justify-center '>
        <div className='w-[618px] '>
        <img src={errorimg} className='mx-auto' alt='Not Found'></img>
        <h2 className='text-6xl font-semibold text-white mt-5 '>404</h2>
        <h3 className='text-3xl font-normal text-errorpara '>Oops!</h3>
        <p className='text-errorpara text-xl font-normal mt-2'>The page you're looking for can't be found. It might have been removed, renamed, or temporarily unavailable.</p>
        </div>
       </div>
  )
}

export default NotFound