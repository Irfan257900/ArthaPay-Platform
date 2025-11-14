import React from 'react'
import networkImg from '../images/globe.svg';
const supportedAssets=['eth','btc','trx','str','sol','algo']
const OtherWallets = ({btnClassName='buttonsClass otherwalletbtn',setSigningThrough,setError,asset}) => {
    const handleSignMessage=()=>{
      if(!supportedAssets.includes(asset)){
        setError(`Signatures from other wallets for ${asset[0].toUpperCase()}${asset?.substring(1)} are currently not supported`)
        setSigningThrough('')
        return;
      }
        setError('')
        setSigningThrough('otherWallets')
    }
  return (
    <button className={btnClassName || ''} onClick={handleSignMessage}><div className='flex items-center gap-2'><img src={networkImg} width={'20'} alt='networkImg' /> Other Wallets</div></button>
  )
}

export default OtherWallets