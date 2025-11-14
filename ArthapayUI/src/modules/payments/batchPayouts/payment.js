import React, { useEffect, useReducer } from 'react'
import { useParams } from 'react-router'
import Details from './details'
import Form from './form'
import { useSelector } from 'react-redux'
import { store } from '../../../store'
import { fetchMerchantsDetails } from '../reducers/batchPayoutsReducer'
import AppAlert from '../../../core/shared/appAlert'
import { formReducer, formState } from './reducer'
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader'

const Payment = () => {
  const { mode } = useParams()
  const customerInfo = useSelector((info) => info.userConfig.details);
  const [state, setState] = useReducer(formReducer, formState)
  useEffect(() => {
    if (mode !== 'view' && customerInfo?.id) {
      store.dispatch(fetchMerchantsDetails({
        customerId: customerInfo?.id
      }));
    }
  }, [mode])
  const clearErrorMessage = () => {
    setState({ type: 'setErrorMsg', payload: null })
  }

  if (mode === 'view') {
    return <Details />;
  }

  if (mode !== 'view') {
    return <Form mode={mode} />;
  }
  return (<>
    <ContentLoader />
    {state?.errorMsg && (
      <div className="alert-flex" style={{ width: "100%" }}>
        <AppAlert
          className="w-100 "
          type="warning"
          description={state?.errorMsg}
          showIcon
        />
        <button className="icon sm alert-close" onClick={() => clearErrorMessage()}></button>
      </div>
    )
    }
  </>);
}

export default Payment;
