import { Steps, Typography } from 'antd'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import SignReviewContext from './signReviewContext';
const {Text}=Typography;
const BlueWallet = ({ FormComponent }) => {
    const {message}=useContext(SignReviewContext)
    const [currentStep, setCurrentStep] = useState(0);
    const handleCurrentStep = useCallback((value)=>{
        setCurrentStep(value);
    },[]);
    const items = useMemo(()=>{
        return [
            {
                key: 'TosignMessage', title: <span className='text-secondary'>To Sign or Verify a Message</span>, description: <div className='text-lightWhite'>
                    <span>Open your wallet</span>
                    <span>Click ... in the top right</span>
                    <span>Select Sign/Verify message at the bottom</span>
                </div>
            },
            {
                key: 'copyMessage', title: <span className='text-secondary'>Copy and Sign the Message</span>, description: <div className='text-lightWhite'>
                    <p className='mt-0'>Copy this message into your BlueWallet "Message" field, then sign :</p>
                    <Text copyable={true} className='!text-primaryColor'>{message}</Text>
                </div>
            },
            {
                key: 'saveDetails', title: <span className='text-secondary mb-24'>Share the address and signature</span>, description: <div className=''>
                    <FormComponent />
                </div>
            },
        ]
    },[message,FormComponent])
    return <div className='note-text md:col-span-2'>
        <h1 className='text-large text-lightWhite font-semibold mb-0.5 text-center'>Add Blue Wallet Address Proof</h1>
        <p className='text-center text-lightWhite text-sm'>Please provide a message signature to confirm access to your Bitcoin address.</p>
        <Steps direction='vertical' current={currentStep} items={items} onChange={handleCurrentStep } />
    </div>
}

export default BlueWallet