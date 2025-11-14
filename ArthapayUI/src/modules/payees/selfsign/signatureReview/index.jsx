import React, { useMemo } from 'react'
import AutomatedNote from './automatedNote'
import OtherWallets from './otherWallets'
import BlueWallet from './blueWallet'
import SignatureForm from './signatureForm'
import SignReviewContext from './signReviewContext'
const SignatureReview = ({ signingThrough, message,setSigningThrough, onError, onSuccess, asset ,addressFormat, setError,isSigning,setIsSigning }) => {
    const contextValue=useMemo(() => ({
        signingThrough, message,setSigningThrough, onError, onSuccess, asset ,addressFormat, setError,isSigning,setIsSigning
    }), [signingThrough, message,setSigningThrough, onError, onSuccess, asset ,addressFormat, setError,isSigning,setIsSigning]);
    const isAutomated = useMemo(() => {
        return !['blueWallet','otherWallets'].includes(signingThrough)
    }, [signingThrough])
    return <SignReviewContext.Provider value={contextValue}>
        {isAutomated && <AutomatedNote/>}
        {signingThrough === 'otherWallets' && <OtherWallets FormComponent={SignatureForm}/>}
        {signingThrough === 'blueWallet' && <BlueWallet FormComponent={SignatureForm}/>}
    </SignReviewContext.Provider>
}

export default SignatureReview