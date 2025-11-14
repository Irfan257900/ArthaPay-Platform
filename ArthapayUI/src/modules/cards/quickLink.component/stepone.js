import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import { getQuickLinkApplicationInfo } from '../httpServices';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import CustomButton from '../../../core/button/button';
import { useTranslation } from 'react-i18next';


const StepOne = (props) => {
  const [loader, setLoader] = useState(false)
  const [info, setInfo] = useState()
  const { cardId } = useParams()
  const { t } = useTranslation();
  useEffect(() => {
    if(!props?.status){
      applicationInfo(props?.user?.id, props?.cardId || cardId)
    }
  }, [props?.user?.id, cardId ,props?.cardId,props?.status])
  const applicationInfo = async (customerId, cardId) => {
    props?.isError(null)
    setLoader(true)
     const urlParams = {id:customerId,cardId:props?.cardId || cardId }
    await getQuickLinkApplicationInfo(setLoader,(response)=>setInfo(response), props?.isError,urlParams);
  }
  const saveCard = useCallback(() => {
    props?.changeNextStep(info)
  }, [info,props]);
  return (
    <>
    {loader&& <ContentLoader/> }
      {!loader &&
        <>
          <div className="last-step-bg mt-16">
            {info?.keyValuePairs.map((item) => (
              <div className="summary-list-item" key={item}>
                <div className="summary-label">{item.title}</div>
                <div className="summary-text">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <CustomButton type='primary' className="w-full" 
              onClick={saveCard}>
            {t('cards.applyCards.Next')}          
            </CustomButton>
          </div>
        </>}
    </>);
};
const connectStateToProps = ({ userConfig }) => {
  return { user: userConfig.details };
};

export default connect(connectStateToProps)(StepOne);