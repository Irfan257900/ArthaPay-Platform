import React, { useContext } from 'react'
import SignReviewContext from './signReviewContext'
const checkpointText = {
    'walletConnect': 'Wallet app',
    'ledger': 'Ledger device',
    'trezor': 'Trezor device'
}
const AutomatedNote = () => {
    const {signingThrough,message}=useContext(SignReviewContext)
    return <div className='note-text md:col-span-2'>
        <h1 className='text-large text-subTextColor font-semibold mb-0.5 text-center'>Register your Wallet</h1>
        <ul className='dt-selectext list-none text-center'>
            <li className='list-none pb-1 text-sm font-normal text-paraColor'>Check your {checkpointText[signingThrough] || 'wallet'}</li>
            <li className='list-none pb-1 text-sm font-normal text-paraColor'>Review the following message: {message}</li>
            <li className='list-none pb-1 text-sm font-normal text-paraColor'>Sign the message with your account</li>
            <li className='list-none pb-1 text-sm font-normal text-subTextColor'>Done!</li>
        </ul>
        <div className='bg-qrcodeBg rounded-md m-3 px-3 py-2 border border-borderLightGreen flex gap-1.5 items-center border-dashed justify-between'>
        <p className='note-point'><b>Note:{' '} </b>
        <p>{(signingThrough!=='ledger' && signingThrough!=='trezor') ?'1. ':''}{' '}Please don't close the browser or app until you've signed to prove ownership.</p>
        {(signingThrough!=='ledger' && signingThrough!=='trezor') && <p>2. If you wish to switch accounts, cancel the process, select your preferred account in wallet, and try again.</p>}
        </p>
        </div>
    </div>
}

export default AutomatedNote