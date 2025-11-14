import React from 'react'
import CryptoDeposit from './crypto.deposit';
import CryptoWithdraw from './crypto.withdraw';
import { Outlet, useParams } from 'react-router';
function Crypto() {
    const params = useParams();
    return (
        <div className='panel-card buy-card card-paddingrm'>
         {params?.actionType==='withdraw' &&  <CryptoWithdraw/> }
            {params?.actionType==='deposit' && <CryptoDeposit/>}
            <Outlet />
        </div>
    )
}
export default Crypto