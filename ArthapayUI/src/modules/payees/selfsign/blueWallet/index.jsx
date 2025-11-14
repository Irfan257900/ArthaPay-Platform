import React from 'react'
import blueWallet from '../images/bluewallet.png';

const BlueWallet = ({btnClassName='buttonsClass blue-walletbtn',setSigningThrough,setError}) => {
    const handleSignMessage=()=>{
        setError('')
        setSigningThrough('blueWallet')
    }
  return (
    <button className={btnClassName || ''} onClick={handleSignMessage} ><img src={blueWallet} className='w-32' alt='blueWallet' /></button>
  )
}

export default BlueWallet