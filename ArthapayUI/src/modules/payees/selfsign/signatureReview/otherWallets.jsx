import React, { useContext } from 'react'
import SignReviewContext from './signReviewContext'
import { Typography } from 'antd'
const {Text}=Typography;
const OtherWallets = ({FormComponent}) => {
    const {message}=useContext(SignReviewContext)
    return <div className='note-text md:col-span-2'>
        <h1 className='text-large text-lightWhite font-semibold mb-0.5 text-center'>Add Signature Address Proof</h1>
        <p className='text-sm font-normal text-lightWhite text-center'>Message to be Signed: {' '}
         <span className='' copyable={true}>{message}</span>
        </p>
        <div className='mt-3'>
        <FormComponent/>
        </div>
    </div>
}

export default OtherWallets