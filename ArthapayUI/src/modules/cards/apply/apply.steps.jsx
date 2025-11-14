import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Steps, Typography } from 'antd';
import StepOneIcon from '../../../assets/images/application-info.svg';
import StepTwoIcon from '../../../assets/images/fee-white.svg';
import StepThreeIcon from '../../../assets/images/tobereviewed.svg';
import StepOne from './apply.step1';
import StepThree from './apply.step3';
import StepTwo from './apply.step2';
import { useParams, useNavigate } from 'react-router';
import { connect, useDispatch, useSelector } from 'react-redux';
import checkIcon from '../../../assets/images/check-01.svg';
import { getSelectedAddress } from '../reducers/applyCardReducer';
import { saveApplyCard } from '../httpServices';
import { deriveErrorMessage } from '../../../core/shared/deriveErrorMessage';
import { useTranslation } from 'react-i18next';
import { fetchGraphDetails, fetchKpis, setApplyCardKycInfo, setCurrentStep, setStepsError } from '../../../reducers/cards.reducer';
import AppDefaults from '../../../utils/app.config';
import { encryptAES } from '../../../core/shared/encrypt.decrypt';
import { successToaster } from '../../../core/shared/toasters';

const { Step } = Steps;

const ApplySteps = (props) => {
  // const [currentStep, setCurrentStep] = useState(0);
  const { cardId } = useParams()
  const cardDivRef = React.useRef(null);
  // const [error, setError] = useState(null)
  const [infoData, setInfoData] = useState(null);
  const [isBtnLoader, setIsBtnLoader] = useState(false);
  const dispatch = useDispatch();
  const [isKycError, setIsKycError] = useState(false)
  const { Text } = Typography;
  const navigate = useNavigate()
  const { t } = useTranslation();
  const applyCardKycInfo = useSelector((state) => state.cardsStore.applyCardKycInfo);
  const currentStep = useSelector((state) => state.cardsStore.currentStep);
  const error = useSelector((state) => state.cardsStore.stepsError);

  const setSaveApplyCard = (response) => {
    try {
      if (response) {
        successToaster({content : t('cards.Messages.CARD_APPLY_SUCCESSMESSAGE'),className : "custom-msg",duration : 3})
        cardDivRef.current?.scrollIntoView(0, 0);
        // setCurrentStep(currentStep + 1);
        dispatch(setCurrentStep(currentStep + 1));
        // setError(null)
        dispatch(setStepsError(null))
        dispatch(getSelectedAddress({ data: null }))
        dispatch(setApplyCardKycInfo(null))
        dispatch(fetchKpis({ showLoading: false }))
        dispatch(fetchGraphDetails({ showLoading: false }));
      } else {
        if (response.status == 523) {
          setIsKycError(true)
        }
        setIsBtnLoader(false)
        // setError(response)
        dispatch(setStepsError(response))
        cardDivRef.current.scrollIntoView(0, 0);
      }
    } catch (error) {
      // setError(deriveErrorMessage(error));
      dispatch(setStepsError(deriveErrorMessage(error)));
    }
  }
  const setError = useCallback((err) => {
    // setError(err)
    dispatch(setStepsError(err))
  }, [error])
  
  const applyCard = useCallback(async (selectedNetwork, formattedValues, isHaveCard, feeInfo) => {
    try {
      const filteredNetwork = props?.networksInfo?.find((item) => item.network === selectedNetwork)
      let obj = {
        programId: props?.cardId || cardId,
        name: feeInfo?.cardName,
        type: feeInfo?.cardType,
        image: feeInfo?.image,
        amount: feeInfo?.amountPaid || 0,
        cryptoWalletId: filteredNetwork?.id,
        personalAddressId: applyCardKycInfo?.kyc?.address?.addressId || AppDefaults?.GUID_ID,
        ...applyCardKycInfo
      }
      if (feeInfo?.cardType === 'Physical') {
        obj = {
          ...obj,
          iHaveCard: isHaveCard,
          envelopeNumber: formattedValues?.envelopenumber || null,
          cardNumber: formattedValues?.linkcardnumber && encryptAES(formattedValues?.linkcardnumber) || null,
          HandHoldIdPhoto: formattedValues?.handHoldingIdPhoto || null
        };
      }
      const urlParams = { obj: obj, type: feeInfo?.cardType }
      await saveApplyCard(setIsBtnLoader, setSaveApplyCard, setError, urlParams);
    } catch (error) {
      // setError(deriveErrorMessage(error));
      dispatch(setStepsError(deriveErrorMessage(error)));
    }
  }, [props?.networksInfo, props?.user?.id, props?.cardId, props?.selectedAddress, props?.trackauditlogs, cardId]);

  const changeNextStep = useCallback((infoData) => {
    setInfoData(infoData);
    // setCurrentStep(currentStep + 1);
     dispatch(setCurrentStep(currentStep + 1));
  }, [infoData, currentStep]);

  useEffect(() => {
    if (props.status) {
      // setCurrentStep(2)
      dispatch(setCurrentStep(2));
    }
  }, [props.status])

  const isError = useCallback((response) => {
    if (response) {
      // setError(response);
      dispatch(setStepsError(response));
      window.scrollTo(0, 0);
    } else {
      // setError(null);
      dispatch(setStepsError(null));
    }
  }, [error]);
  const steps = [
    {
      title: `${t('cards.applyCards.Application_Info')}`,
       icon:
        <span
          className={`icon appliactioninfo ${currentStep == 1 || currentStep == 2 ? 'check-icon-class' : 'step-one-icon-class'}`}
          aria-label="Step 1"
        />,
      content: <StepOne changeNextStep={changeNextStep} cardId={cardId || props.cardId} isError={isError} status={props?.status} customerId={props?.user?.id} currentStep={currentStep} />,
    },
    {
      title: `${t('cards.applyCards.Fee')}`,
      icon: <span
          className={` icon fee ${currentStep == 1 || currentStep == 2 ? 'check-icon-class' : 'step-one-icon-class'}`}
          aria-label="Step 1"
        />,
      content: <StepTwo applyCard={applyCard} infoData={infoData} cardId={cardId} isError={isError} isBtnLoader={isBtnLoader} />,
    },
    {
      title: `${t('cards.applyCards.To_Be_Reviewed')}`,
       icon:  <span
          className={`icon tobereview ${currentStep == 1 || currentStep == 2 ? 'check-icon-class' : 'step-one-icon-class'}`}
          aria-label="Step 1"
        />,
      content: <StepThree />,
    },
  ];

  const goBackSteps = () => {
    try {
      if (!props.status) {
        if (currentStep == 0) {
          navigate(`/cards/apply/${cardId || props.cardId}`)
        }
        else if (currentStep == 2) {
          // setError(null)
          dispatch(setStepsError(null))
          props?.backtoScreen()
        } else {
          // setError(null)
          dispatch(setStepsError(null))
          // setCurrentStep(currentStep - 1);
          dispatch(setCurrentStep(currentStep - 1));
        }
      }
    } catch (error) {
      // setError(deriveErrorMessage(error));
      dispatch(setStepsError(deriveErrorMessage(error)));
    }
  }
  const clearErrorMsg = useCallback(() => {
    // setError(null);
    dispatch(setStepsError(null));
  }, [])
  return (
    <>
      <div className="panel-card buy-card card-paddingrm">

        <div className=''>
          {/* {(currentStep == 0 || currentStep == 1) && !props.status && <span class="icon lg btn-arrow-back cursor-pointer" onClick={() => goBackSteps()}></span>} */}

          <div className="">
            <div className="mt-4 steps-sm-space custom-card-space">
              <Steps current={currentStep} >
                {steps.map((step) => (
                  <Step key={step?.title} title={step.title} icon={step.icon} />
                ))}
              </Steps>
              <div ref={cardDivRef}></div>
              {error && !isKycError && (
                <div className="alert-flex mb-24 mt-4">
                  <Alert
                    type="error"
                    description={error}
                    onClose={clearErrorMsg}
                    showIcon
                    className='!px-0'
                  />
                  <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
                </div>
              )}
              {error && isKycError && (
                <div className="alert-flex mb-24">
                  <Alert
                    type="error"
                    description={
                      <>
                        {t('cards.applyCards.Fill_Details')}
                        {error.split(',').map((item) => (
                          <Text key={item} className="ant-alert-description">
                            {item.trim()}
                            <br />
                          </Text>
                        ))}

                        <a onClick={() => {
                          window.open(`${window.runtimeConfig.VITE_PROFILE_URL}/profile/KycKyb`, "_blank");
                        }}> {t('cards.applyCards.Click_Here')}</a> {t('cards.applyCards.To_Fill_Details')}
                      </>
                    }
                    onClose={clearErrorMsg}
                    showIcon
                  />
                  <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
                </div>
              )}
              <div className="steps-content">{steps[currentStep]?.content}</div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};
const connectStateToProps = ({ userConfig, applyCard }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
    selectedAddress: applyCard?.selectedAddress?.data,
    cryptoNetwork: applyCard?.cryptoNetwork?.data,
    networksInfo: applyCard?.networksInfo?.data,
  };
};

export default connect(connectStateToProps)(ApplySteps);
