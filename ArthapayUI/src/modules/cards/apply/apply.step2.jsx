import React, { useCallback, useEffect, useReducer, useState } from 'react';
import handCoin from '../../../assets/images/amount.gif';
import infoIcon from '../../../assets/images/info-icon.svg';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import { Button, Form, Radio, Select } from 'antd';
import { Option } from 'antd/lib/mentions';
import { selectedCryptoWallet, setNetworksData } from '../reducers/applyCardReducer';
import { NumericFormat } from 'react-number-format';
import QuickLink from './apply.physicalCard';
import { fetchFeeInfo, getAssetInCards, getNetworkLuCrads } from '../httpServices';
import ContentLoader from '../../../core/skeleton/common.page.loader/content.loader';
import AppAlert from '../../../core/shared/appAlert';
import { stepTworeducer, stepTwoState } from './reducer';
import { useTranslation } from 'react-i18next';
import NumericText from '../../../core/shared/numericText';
import AppDefaults from '../../../utils/app.config';
const formData = { selectedNetwork: "", handHoldingIdPhoto: "", CardNumber: "", EnvelopeNumber: "" }

const StepTwo = (props) => {
  const [loader, setLoader] = useState(false)
  const [feeInfo, setFeeInfo] = useState()
  const [assets, setAssets] = useState([])
  const [form] = Form.useForm();
  const [confirmAsset, setConfirmAsset] = useState(null)
  const [networks, setNetworks] = useState()
  const [selectedNetwork, setSelectedNetwork] = useState(null)
  const { cardId } = useParams();
  const [networkAmt, setNetworkAmt] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null)
  const [isHaveCard, setIsHaveCard] = useState({
    yes: true,
    no: false,
  });
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [fileLists, setFileLists] = useState({ handHoldingIdPhoto: [] });
  const [previewImages, setPreviewImages] = useState({ handHoldingIdPhoto: "", });
  const cardDivRef = React.useRef(null)
  const [localState, localDispatch] = useReducer(stepTworeducer, stepTwoState);
  const { t } = useTranslation();
  const Smalldecimals = window.runtimeConfig.VITE_APP_SMALL_DECIMALS_ENABLED

  useEffect(() => {
    getAssetData(props?.user?.id)
  }, [props?.user?.id])
  useEffect(() => {
    if (confirmAsset) {
      getNetworks(confirmAsset, props?.user?.id)
    }
  }, [confirmAsset])

  useEffect(() => {
    if (props?.cryptoNetwork) {
      getFeeInfo(props?.user?.id, props?.cardId || cardId, props?.cryptoNetwork?.id, isHaveCard.yes)
    }
  }, [props?.user?.id, cardId, props.cardId, props?.cryptoNetwork])
  const setGetFeeInfo = (response) => {
    if (response) {
      setFeeInfo(response)
      setEstimatedAmount(response?.estimatedPaymentAmount);
      setLoader(false)
    }
    else {
      setLoader(false)
      setErrorMessage(response);
      cardDivRef.current?.scrollIntoView(0, 0);
    }
  }
  const getFeeInfo = async (customerId, cardId, walletId, haveCard) => {
    const urlParams = { id: customerId, cardId: props?.cardId || cardId, walletId: walletId, isHaveCard: haveCard }
    await fetchFeeInfo(setLoader, setGetFeeInfo, setErrorMessage, urlParams);
  }
  const applyCard = useCallback(async (values) => {
    let formattedValues = null;
    if (feeInfo?.cardType === "Physical" && !isHaveCard.yes && !isHaveCard.no) {
      setErrorMessage(t('cards.Messages.SELECT_OPTION'));
      window.scrollTo(0, 0);
      return;
    }
    if (isHaveCard?.yes === true) {
      await form.validateFields();
      formattedValues = {
        ...values,
        handHoldingIdPhoto: fileLists.handHoldingIdPhoto?.length > 0 ? fileLists.handHoldingIdPhoto?.[0].response?.[0] || fileLists.handHoldingIdPhoto[0].url : values?.handHoldingIdPhoto || null,
      }
    }

    if (!selectedNetwork) {
      setErrorMessage(t('cards.Messages.SELECT_PAID_NETWORK'));
      window.scrollTo(0, 0)
    } else if (!networkAmt || networkAmt <= 0 || networkAmt < feeInfo?.amountPaid) {
      setErrorMessage(t('cards.Messages.INSUFFICIENT_FUNDS'));
      window.scrollTo(0, 0)
    } else {
      const haveCard = isHaveCard?.yes === true || false;
      props.applyCard(selectedNetwork, formattedValues, haveCard, feeInfo)
    }

  }, [t, props, feeInfo, isHaveCard, form, confirmAsset, selectedNetwork, fileLists]);
  const setGetAssetData = (response) => {
    if (response) {
      form.setFieldsValue({ setConfirmAsset: response?.[0]?.currencyCode });
      setAssets(response)
      setConfirmAsset(response?.[0]?.currencyCode)
    }
    else {
      setErrorMessage(response)
      window.scrollTo(0, 0)
      setLoader(false)
    }
  }
  const getAssetData = async (id) => {
    const urlParams = { id: id, cardId: cardId }
    await getAssetInCards(localDispatch, setGetAssetData, urlParams);
  }
  const getSelectedAsset = useCallback((selectedAsset) => {
    setErrorMessage(null)
    window.scrollTo(0, 0)
    const selectedValue = assets?.find(item => item?.currencyCode === selectedAsset)
    setConfirmAsset(selectedValue?.currencyCode)
    form.setFieldsValue({ setConfirmAsset: selectedValue?.currencyCode });
    form.setFieldsValue({ selectedNetwork: undefined });
  }, [assets, form]);
  const setGetNetworks = (response) => {
    if (response) {
      const trc20Object = response?.find(item => item.network === "TRC-20");
      form.setFieldsValue({ selectedNetwork: trc20Object?.network || response[0]?.network });
      props?.dispatch(setNetworksData({ data: response }))
      setNetworkAmt(trc20Object?.amount >=0 ? trc20Object?.amount : response[0]?.amount)
      setSelectedNetwork(trc20Object?.network || response[0]?.network)
      setNetworks(response)
      props?.dispatch(selectedCryptoWallet({ data: trc20Object || response[0] }))
    }
    else {
      setErrorMessage(response);
      window.scrollTo(0, 0)
      setLoader(false)
    }
  }
  const getNetworks = async (walletCode, id) => {
    const urlParams = { id: id, walletCode: walletCode, cardId: cardId || props?.cardId }
    await getNetworkLuCrads(localDispatch, setGetNetworks, urlParams);
  }
  const getSelectedNetwork = useCallback((selectedCode) => {
    const selectedValue = networks?.find(item => item?.network === selectedCode)
    form.setFieldsValue({ selectedNetwork: selectedValue.network });
    setSelectedNetwork(selectedValue.network)
    setNetworkAmt(selectedValue?.amount)
    props?.dispatch(selectedCryptoWallet({ data: selectedValue }))
  }, [form, props, networks]);
  const handleFontSize = (amount) => {
    const amountPaid = amount?.toString();
    return amountPaid && amountPaid?.length >= 9 ? 'amount-text-small' : '';
  };

  const handleIsHaveCard = useCallback((e) => {
    setErrorMessage(null);
    const { value } = e.target;
    setIsHaveCard({
      yes: value === 'yes',
      no: value === 'no',
    });
    getFeeInfo(props?.user?.id, props?.cardId || cardId, props?.cryptoNetwork?.id, value === 'yes');
  }, [props, cardId]);
  const clearErrorMsg = () => {
    setErrorMessage(null)
    localDispatch({ type: 'setErrorMsg', payload: null });
  }

  return (<>
    {(loader || localState?.loader) && <ContentLoader />}
    {(errorMessage || localState.errorMsg) && (<div className="alert-flex mb-24" >
      <AppAlert
        type="error"
        description={(errorMessage || localState.errorMsg)}
        showIcon className='px-0'
      />
      <span className="icon sm alert-close c-pointer" onClick={clearErrorMsg}></span>
    </div>)}
    {(!loader || !localState?.loader) && <div>
      <Form form={form} scrollToFirstError={true} initialValues={formData} onFinish={applyCard}
      >
        <div className='grid grid-cols-2 apply-cards mt-4 gap-6'>
          <div>
            <div className='buy-token '>
              <div className={`relative mb-2 panel-form-items-bg`}>
                <Form.Item className='mb-0 custom-select-float relative'
                  name="setConfirmAsset"
                  label={t('cards.applyCards.Paid_Currency')}
                  colon={false}
                  rules={[{ required: true, message: t('cards.Is_required') }]}>
                  <Select
                    className="p-0 rounded outline-0 w-full text-lightWhite"
                    maxLength={15}
                    placeholder={t('cards.topUp.Select_Currency')}
                    defaultValue={confirmAsset}
                    value={confirmAsset}
                    onChange={getSelectedAsset}>
                    {Array.isArray(assets) && assets.map((item) => (
                      <Option key={item?.id} value={item?.currencyCode}>
                        {item?.currencyCode}
                        <img className={`crypto coin sm rounded-[50%] ml-2`} src={item?.logo} alt="" />
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>
          </div>
          <div>
            <div className={`relative mb-2 panel-form-items-bg`}>
              <Form.Item className="mb-0 custom-select-float relative"
                name="selectedNetwork"
                label={t('cards.applyCards.Network')}
                colon={false}
                rules={[
                  {
                    required: true,
                    message: t('cards.Is_required'),
                  },
                ]}>
                <Select
                  className=""
                  maxLength={15}
                  allowClear
                  placeholder={t('cards.topUp.Select_Network')}
                  onChange={getSelectedNetwork}
                >
                  {networks?.map((item) => (
                    <Option key={item?.id} value={item?.network}>{item?.network}</Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-4 mt-2.5'>
          <p className="text-base font-semibold text-lightWhite mb-0">{t('cards.applyCards.Available_balance')} :</p>
          <p className="text-md font-semibold text-titleColor mb-0">
            {/* <NumericFormat value={networkAmt || 0}
            displayType={'text'} thousandSeparator={true} decimalScale={false}></NumericFormat>{' '} {confirmAsset} */}
            <NumericText className="font-semibold text-subTextColor"
              value={networkAmt || 0}
              decimalScale={AppDefaults.cryptoDecimals}
              suffixText={confirmAsset}
              isdecimalsmall={Smalldecimals === 'true' ? true : false} />
          </p>
        </div>
        <div className="flex items-center justify-between amount-field mt-4 py-0">
          <div>
            <p className="xl:text-base lg:text-sm font-medium text-paraColor mt-1">{t('cards.applyCards.Amount_to_be_Paid')}</p>
          </div>
          <div>
            <h4 className="mb-0 items-baseline flex">
              <span className={`amount-text text-[36px] font-medium text-primaryColor ${handleFontSize(feeInfo?.amountPaid)}`}>
                {/* {estimatedAmount?.toLocaleString(undefined, { maximumFractionDigits: 8 })} */}
                <NumericText className=" "
                  value={estimatedAmount || 0}
                  decimalScale={AppDefaults.cryptoDecimals}
                  isdecimalsmall={Smalldecimals === 'true' ? true : false}

                />
              </span>
              <span className='text-xs font-medium text-primaryColor' style={{ marginLeft: 6 }}>{confirmAsset} {selectedNetwork && <>({selectedNetwork})</>}</span>
            </h4>
          </div>
          <div>
            <img src={handCoin} width={116} className='coin-flip' />
          </div>
        </div>
        <div className="flex amount-field items-center mt-5 gap-2">
          <img src={infoIcon} className='' />
          <p className="text-sm font-medium text-labelGrey mb-0 !max-w-full">
            {t('cards.applyCards.Pay_Account_Opening_Fee')} {feeInfo?.reviewTime}
          </p>
        </div>
        {feeInfo?.cardType === "Physical" && (<>
          <div className='custom-checkbox mt-5'>
            <Radio.Group
              className="new-custom-radiobtn mb-0 newcustome-radiocheck"
              onChange={handleIsHaveCard}
              value={isHaveCard.yes && 'yes' || isHaveCard.no && 'no' || null}
            >
              <Radio value="yes" className="text-lightWhite">
                {t('cards.applyCards.I_have_the_card_on_hand_and_do_not_require_freight')}
              </Radio>
              <Radio value="no" className="text-lightWhite">
                {t('cards.applyCards.Please_send_a_card_to_me')}
              </Radio>
            </Radio.Group>
          </div>
          {isHaveCard?.yes && (<QuickLink form={form} fileLists={fileLists} setFileLists={setFileLists} envelopeNoRequired={feeInfo?.envelopeNoRequired} needPhotoForActiveCard={feeInfo?.needPhotoForActiveCard} cardName={feeInfo?.cardName} additionalDocforActiveCard={feeInfo?.additionaldocForActiveCard} setErrorMessage={setErrorMessage} previewImages={previewImages} setPreviewImages={setPreviewImages} />)}
        </>)}
        <div className='darkbg-section mt-4'>
          <div className="summary-list-item pt-0">
            <div className="summary-label">{t('cards.applyCards.Issuing_Fee')}</div>
            <div className="text-sm font-semibold text-lightWhite mb-0 text-right">
              {/* {feeInfo?.issuingFee?.toLocaleString(undefined, { maximumFractionDigits: 8 })}{" "}{confirmAsset} */}
              <NumericText className=""
                value={feeInfo?.issuingFee || 0}
                decimalScale={AppDefaults.cryptoDecimals}
                suffixText={confirmAsset}
              />
            </div>
          </div>
          {feeInfo?.firstRecharge !== null && <div className="summary-list-item">
            <div className="summary-label">{t('cards.applyCards.First_Recharge_Amount')}</div>
            <div className="text-sm font-semibold text-lightWhite mb-0 text-right">
              {/* {feeInfo?.firstRecharge?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0.00"}{' '}{feeInfo?.cardCurrency} */}
              <NumericText className=""
                value={feeInfo?.firstRecharge || 0}
                decimalScale={AppDefaults.fiatDecimals}
                suffixText={feeInfo?.cardCurrency}
              />
            </div>
          </div>}
          {feeInfo?.cardType === "Physical" && (isHaveCard?.yes || isHaveCard?.no) && (<div className="summary-list-item">
            <div className="summary-label">{t('cards.applyCards.Freight_Fee')}</div>
            <div className="text-sm font-semibold text-lightWhite mb-0 text-right">
              {/* {feeInfo?.freightFee?.toLocaleString(undefined, { maximumFractionDigits: 8 })}{' '}{confirmAsset} */}
              <NumericText className=""
                value={feeInfo?.freightFee || 0}
                decimalScale={AppDefaults.cryptoDecimals}
                suffixText={confirmAsset}
              />
            </div>
          </div>)}
          <div className="summary-list-item">
            <div className="summary-label">{t('cards.applyCards.Estimated_Payment_Amount')}</div>
            <div className="text-sm font-semibold text-lightWhite mb-0 text-right">
              {/* {feeInfo?.estimatedPaymentAmount?.toLocaleString(undefined, { maximumFractionDigits: 8 })}{' '}{confirmAsset} */}
              <NumericText className=""
                value={feeInfo?.estimatedPaymentAmount || 0}
                decimalScale={AppDefaults.cryptoDecimals}
                suffixText={confirmAsset}
              />
            </div>
          </div>
        </div>
        <div className='w-full mt-9'>
          <Button className="rounded-5 border-0 bg-primaryColor hover:!bg-buttonActiveBg h-[38px] dark:hover:!bg-buttonActiveBg text-sm font-medium !text-textWhite md:min-w-[100px] uppercase disabled:!bg-btnDisabled disabled:cursor-not-allowed disabled:text-textBlack" block htmlType="submit"
            loading={props?.isBtnLoader}
          >
            {t('cards.assignCard.Submit')}
          </Button>
        </div>
      </Form>
    </div>}
  </>);
};
const connectStateToProps = ({ userConfig, applyCard }) => {
  return {
    user: userConfig.details,
    cryptoNetwork: applyCard?.cryptoNetwork?.data,
    networksInfo: applyCard?.networksInfo?.data,
  };
};

export default connect(connectStateToProps)(StepTwo);