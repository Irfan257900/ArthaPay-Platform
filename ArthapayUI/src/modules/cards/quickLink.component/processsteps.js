import React, { useCallback, useEffect, useState } from 'react';
import { Steps } from 'antd';
import StepOneIcon from '../../../assets/images/application-info.svg';
import StepTwoIcon from '../../../assets/images/fee-white.svg';
import StepThreeIcon from '../../../assets/images/tobereviewed.svg';
import StepOne from './stepone';
import StepThree from './stepthree';
import StepTwo from './steptwo';
import { connect } from 'react-redux';
import checkIcon from '../../../assets/images/check-01.svg'
import { getQuickLinkKYCSave } from '../httpServices';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../../core/button/button';
import AppAlert from '../../../core/shared/appAlert';
import FinalStep from '../apply/apply.step3';
const { Step } = Steps;
const QuickLinkSteps = (props) => {
  // statically updating current step as 2 if kyc step is there then change it to 0 in future it may required;
  const [currentStep, setCurrentStep] = useState(2);
  const [applicationinformationData, setApplicationinformationData] = useState(null);
  const [isBtnLoader, setIsBtnLoader] = useState(false);
  const ref = React.useRef(null);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const setGetApplyPhycialCard = (response) => {
    if (response) {
      setApplicationinformationData(response);
      setCurrentStep(2);
    } else {
      setIsBtnLoader(false)
      isError(response)
      window.scrollTo(0, 0);
    }
  }
  const applyPhycialCard = useCallback(async (customerId, cardId) => {
    let obj = {
      customerId: customerId,
      cardId: props?.cardId || cardId,
    }
    isError(null)
    setIsBtnLoader(true)
    const urlParams = { obj: obj }
    await getQuickLinkKYCSave(setIsBtnLoader, setGetApplyPhycialCard, isError, urlParams);
  }, [props]);
  const changeNextStep = useCallback((infoData) => {
    setApplicationinformationData(infoData);
    setCurrentStep(currentStep + 1);
  }, [currentStep]);
  useEffect(() => {
    if (props.status) {
      setCurrentStep(2)
    }
  }, [props.status])
  const isError = useCallback((response) => {
    if (response) {
      setError(response);
      window.scrollTo(0, 0);
    } else {
      setError(null);
    }
  }, []);
  const goBackSteps = useCallback(() => {
    if (!props.status) {
      if (currentStep == 0 || currentStep == 2) {
        props.backtoScreen?.()
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  }, [props.status, currentStep])
  const step = [
    {
      title: `${t('cards.applyCards.Application_Info')}`,
      icon: <img src={(currentStep == 1 || currentStep == 2) ? checkIcon : StepOneIcon} alt="Step 1" />,
      content: <StepOne changeNextStep={changeNextStep} changeToPrev={goBackSteps} cardId={props?.cardId} isError={isError} status={props?.status} screenName={props?.screenName} />,
    },
    {
      title: `${t('cards.bindCard.kycInformation')}`,
      icon: <img src={currentStep == 2 ? checkIcon : StepTwoIcon} alt="Step 2" />,
      content: <StepTwo applyPhycialCard={applyPhycialCard} changeToPrev={goBackSteps} infoData={applicationinformationData} cardId={props?.cardId} isError={isError} isBtnLoader={isBtnLoader} />,
    },
    {
      title: `${t('cards.applyCards.To_Be_Reviewed')}`,
      icon: <img src={currentStep == 2 ? checkIcon : StepThreeIcon} alt="Step 3" />,
      content: <StepThree cardId={props?.cardId} changeToPrev={goBackSteps} isError={isError} />,
    },
  ];
  const step1 = [
    {
      title: `${t('cards.applyCards.To_Be_Reviewed')}`,
      icon: <span className='icon tobereview' alt="Step 3" />,
      content: <StepThree cardId={props?.cardId} isError={isError} onSuccess={props.onSuccess} />,
    },
  ];
  const steps = (props?.selectedCardData?.envelopeNumber || props?.selectedCardData?.state !== "Submitted") ? step1 : step;
  
  const clearErrorMsg = useCallback(() => {
    setError(null)
  }, [])
  return (<>
    <div ref={ref}></div>
    {error && (
      <div className="alert-flex mb-24">
        <AppAlert
          type="error"
          description={error}
          afterClose={clearErrorMsg}
          closable={true}
          showIcon
        />
      </div>
    )}
    <div className="panel-card buy-card card-paddingrm">
      <div className='!p-2'>
        <div className={`${currentStep == 0 || currentStep == 1 ? 'py-6' : ''}`} >
        {(currentStep == 0 || currentStep == 1) && !props.status && props.showBackButton && <CustomButton onClick={goBackSteps} type='normal' className='cursor-pointer'><span className="icon lg btn-arrow-back"></span></CustomButton>}
        </div>
        <div className="steps-sm-space">
          <Steps current={currentStep}>
            {steps.map((step) => (
              <Step key={step} title={step.title} icon={step.icon} />
            ))}
          </Steps>
          <div className="steps-content">{currentStep === 2 ? <FinalStep onSuccess={props.onSuccess}/> : steps[currentStep].content}</div>
        </div>
      </div>
    </div>
  </>);
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(QuickLinkSteps);
