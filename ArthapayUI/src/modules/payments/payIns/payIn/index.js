import React from 'react'
import { useParams } from 'react-router'
import View from './view'
import Form from './form'
import IdrTransactions from './idr.transactions'
import StandardInvoice from './standard.invoice'
import PayinFiatDetails from './payin.fiat.view'
import RecentTransactions from './recent.transactions'
import CurrenciesInfoPage from './currencies.Info.Page'
import FiatPaymentsLinksGrid from './fiat.paymentslinks.grid'

const PayIn = () => {
  const {mode,invno: currencyType,vaultName,type}=useParams();
  return (<>
  {mode==='view' && currencyType === 'crypto' &&   <View/>}
  {mode!=='view' && currencyType === 'crypto' && <Form mode={mode}/>}
  {mode==='view' && currencyType === 'fiat' && type?.toLowerCase()  === 'payments' && <FiatPaymentsLinksGrid/>  }
  {mode !== 'view' && currencyType === 'fiat' && type?.toLowerCase()  === 'payments' && <StandardInvoice/>}
  {/* {mode==='view' && currencyType === 'fiat' && vaultName !== 'IDR' && <PayinFiatDetails/>} */}
  {mode==='view' && currencyType === 'fiat' && type?.toLowerCase() !== 'payments' && type?.toLowerCase() !== 'all' && <RecentTransactions/>}
  {/* {mode === 'view' && currencyType === 'fiat' && type?.toLowerCase() === 'all' && <CurrenciesInfoPage/>} */}
  </>
  )
}

export default PayIn
