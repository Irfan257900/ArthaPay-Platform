import React,{useEffect, useReducer} from 'react';
import { Row,Alert } from 'antd';
import { connect } from 'react-redux';
import CardComponent from '../../../core/shared/cardComponent';
import Loader from '../../../core/shared/loader';
import darknoData from '../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../assets/images/light-no-data.svg';
import {fetchPhysicalCards} from '../httpServices'
import { initialState, reducer } from './reducer';

const Virtual = (props) => {
    const cardDivRef=React.useRef(null);
    const [localState, localDispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        getvirtualCards()
    }, [])
    const getvirtualCards = async () => {
        const urlParams = {id:props.user.id,cardType:'VirtualCards',pazeNo:1,pageSize:1 }
        await fetchPhysicalCards(localDispatch,urlParams);
    }
    return (

        <>
        <div ref={cardDivRef}></div>
        {localState?.errorMsg!== undefined && localState?.errorMsg !== null && (
        <Alert variant="danger" className='alert-flex' description={localState?.errorMsg}    
        showIcon>
          <p style={{ color: 'red', margin: 10 }}><span className="icon error-alert me-2"></span>{localState?.errorMsg}</p>
        </Alert>

      )}
      {localState?.loader && <Loader/>}
      <Row gutter={20} className='physical-cards'>
                { !localState?.loader &&localState?.cardsData?.length==0 && <div className='nodata-content'>
                                <div className='no-data'>
                                <img src={darknoData} width={'100px'} alt={description} className="dark:block hidden"></img>
                                <img src={lightnoData} width={'100px'} alt={description} className="dark:hidden block"></img>
                                <p className="text-lightWhite text-sm font-medium mt-3">No Data</p>
                                </div>
                            </div>}
                {localState?.cardsData?.length>0 && localState?.cardsData?.map((item) => <CardComponent cardData={item}  screenType="virtual" key={item.id}></CardComponent>)}
            </Row>
        </>
    )
}
const connectStateToProps = ({ userConfig }) => {
    return { user: userConfig.details }
  }
export default  connect(connectStateToProps)(Virtual)