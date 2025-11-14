import React, { useCallback, useRef, useState } from "react";
import { connect, useSelector } from "react-redux";
import moment from "moment";
import AppAlert from "../../../core/shared/appAlert";
import AppRow from "../../../core/shared/appRow";
import AppCol from "../../../core/shared/appCol";
import { Form, message, Steps } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { validateContentRules } from "../../../core/shared/validations";
import KpiItem from "../../../core/shared/kpi.item";
import { handleSatoshiTestSubmission } from "../http.services";
import CopyComponent from "../../../core/shared/copyComponent";
import { useNavigate ,useParams} from "react-router";
import CustomButton from "../../../core/button/button";
import PayeeFormInput from "../formInput";
import { setCryptoPayeeDetails } from "../../../reducers/payees.reducer";
import NumericText from "../../../core/shared/numericText";
const { Step } = Steps;
const icon = <WarningOutlined />;


const SatoshiTest = (props) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id, mode, name } = useParams();
  const payeeDivRef = useRef(null);
  const [step, setStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState('');
  const cryptoPayeeDetails = useSelector((state) => state.payeeStore?.cryptoPayeeDetails);
  const formData = cryptoPayeeDetails?.formData;
  const satoshiDetails = cryptoPayeeDetails?.satoshiDetails;
  const saveResponse = cryptoPayeeDetails?.saveResponse;
  const setField = (field, value) => {
    form.setFieldsValue({ ...form.getFieldsValue(true), [field]: value });
  };
  const savePayeeCrypto = useCallback(async () => {
    setLoading('save');
    try {
      const values = form.getFieldsValue(true)
      const saveValues = { satoshiDetails, formData, ...values }
      await handleSatoshiTestSubmission(saveValues, props?.userConfig)
      message.success({
        content: mode === "add" ? "Payee saved successfully." : "Payee updated successfully.",
        className: "custom-msg",
        duration: 3,
      });
      payeeDivRef.current?.scrollIntoView(0, 0);
      navigate(`/payees/crypto/${id}/${name}/${mode}/success`);
      props.dispatch(setCryptoPayeeDetails(null));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading('');
    }
  },[form,satoshiDetails,formData,props,payeeDivRef,id,name,mode]);

  const steps = [
    {
      title: 'Please follow the instruction below:',
      content: (
        <>
          {(
            <>
            <div className="recive-runtext mb-2"><p className="mb-1 text-base text-paraColor font-medium">{`Please Send : `}</p> 
                <p><span className="text-paraColor font-normal text-base mb-1">Amount: </span> &nbsp; <span className="font-semibold text-base text-subTextColor">
                  <NumericText
                    value={satoshiDetails?.amount || 0}
                    thousandSeparator
                    decimalScale={4}
                    fixedDecimals={4}
                    isdecimalsmall={true}
                    suffixText={` ${satoshiDetails?.code}(${satoshiDetails?.asset})`}
                  />
                  </span>
                </p>
              <p className="recive-runtext mt-3 text-paraColor text-base font-normal">From Address :</p> 
              <div className="copy-payees-address">
              <span className="address-bold recive-copy font-semibold !text-sm text-subTextColor">
                <CopyComponent text={satoshiDetails?.fromAddress} shouldTruncate={false} />
              </span>
              </div>
              </div>
              <div className="copy-payees-address">
              <span className="recive-runtext mt-3 text-paraColor text-sm font-normal">{`To The Following Address : `}</span>  <br />
              <span className="recive-copy font-semibold text-sm text-subTextColor">
                <CopyComponent text={satoshiDetails?.toAddress} shouldTruncate={false} />
              </span>
             </div>
              <div className="mt-3 recive-runtext"> <p className="!text-paraColor text-base font-normal">Before Time line : </p>
                <span className="font-semibold text-sm text-subTextColor">{`${satoshiDetails?.txDate ? moment.utc(satoshiDetails?.txDate).local().format('DD/MM/YYYY hh:mm:ss A') : ''}`}</span>
                <span className="ml-2 text-paraColor text-sm font-normal">to prove your control over the address.</span>
              </div>
            </>
          )}
          <br />

        </>
      ),
    },
    {
      title: 'Find Transaction ID',
      content: (
        <>
          <div>
         <span className="recive-runtext text-paraColor text-base font-normal">{`To verify ownership of the following address : `}</span> <br />
          <div className="copy-payees-address">
          <span className="recive-copy font-semibold text-sm text-subTextColor">
            <CopyComponent text={satoshiDetails?.fromAddress} shouldTruncate={false} />
          </span>
          </div>
         </div>
          <p className="recive-runtext mt-3 text-paraColor text-base font-normal">Please inspect the block explorer page for this deposit address</p>
          <p className="mt-3 recive-runtext text-paraColor text-base font-normal"><span >Look for a transaction of </span> <span className="mx-2 text-base font-medium text-subTextColor">
            <NumericText
              value={satoshiDetails?.amount || 0}
              thousandSeparator
              decimalScale={4}
              fixedDecimals={4}
              isdecimalsmall={true}
              suffixText={` ${satoshiDetails?.code}(${satoshiDetails?.asset})`}
            />
          </span> <span className="recive-runtext">to confirm ownership</span></p>
        </>
      ),
    },
    {
      title: 'Enter Transaction ID',
      content: (
        <AppCol xs={24} sm={24} md={24} lg={24} xl={24} xxl={24}>
          <div className="text-left payee-field p-relative">
             <PayeeFormInput isRequired={true} label={"Transaction ID/Hash"}>                 <Form.Item
                    name="walletaddress"
                    rules={[
                      {
                        required: true,
                        message: 'Is required',
                        whitespace: true,
                      },
                      { validator: validateContentRules },
                    ]}
                  >
                    <input
                     className=" custom-input-field "
                     placeholder="Transaction ID or Hash"
                     maxLength={100}
                     autoComplete="off"
                     onChange={(e) => setField('transactionId', e.target.value)}
                    />
                  </Form.Item>
                   <p className="text-paraColor w-full"></p><span className="text-paraColor"><strong>Note:</strong> Please wait for your transaction to be confirmed on the blockchain</span>
              </PayeeFormInput>
          </div>
        </AppCol>
      ),
    },
  ];

  const next = useCallback(async () => {
    const isSave = step === steps.length - 1
    if (!isSave) {
      setStep(prevStep => (prevStep + 1));
      return
    }
    setLoading('save');
    try {
      await form.validateFields()
      form.submit()
    } catch (error) {
      setErrorMessage(error.message)
      setLoading('');
    }
  },[step,steps,form]);

  const prev = useCallback(() => {
    setStep(prevStep => (prevStep - 1));
    form.resetFields();
    setErrorMessage(null);
  },[step, form]);
  const clearErrorMsg = useCallback(() => {
    setErrorMessage(null);
  }, []);
  return (
    <AppRow gutter={24}>
      <div ref={payeeDivRef}></div>
      <AppCol sm={24} md={24} lg={24} xl={24} xxl={24}>
        <div className="panel-card buy-card">
          {errorMessage !== undefined &&
            errorMessage !== null &&
            errorMessage !== "" && (
              <div className="alert-flex">
                <AppAlert
                  type="error"
                  description={errorMessage}
                  onClose={clearErrorMsg}
                  icon={icon}
                  showIcon
                />
                <span
                  className="icon sm alert-close c-pointer"
                  onClick={clearErrorMsg}
                ></span>
              </div>
            )}
          <Form
            className="payees-form payees-rightpanel custom-label  mb-0 fw-400"
            form={form}
            onFinish={savePayeeCrypto}
            scrollToFirstError
          >
            <div>
              <div className=' panel-card summary-list summary-panel satosi-summary-list'>
                <KpiItem className={"dt-flex fait-content"} label="Proof:" value={satoshiDetails?.id} />
                <KpiItem className={"dt-flex fait-content"} label="Proof Type:" value='Sathoshi Test' />
                <KpiItem className={"dt-flex fait-content"} label="Wallet Address:" value={satoshiDetails?.fromAddress} isCopy={true} />
                <KpiItem className={"dt-flex fait-content"} label="Network:" value={satoshiDetails?.asset} isCopy={""} />
                <KpiItem className={"dt-flex fait-content"} label="Created Date:" value={moment.utc(saveResponse?.modifiedDate || satoshiDetails?.createdDate).local().format('DD/MM/YYYY hh:mm:ss A')} isCopy={""} />
               <div className="my-7 satosi-step">
                <h2 className="mb-2.5 text-2xl text-subTextColor font-semibold">Verify This Proof</h2>
                <Steps current={step} className="cust-steps-design payes-steps payee-icon">
                  {steps?.map((item) => (
                    <Step key={item.title} title={item.title} />
                  ))}
                </Steps>
               </div>
                <div className="kpicardbg !border border-StrokeColor">
                <div className="">
                  {steps[step].content}
                </div>
                </div>
               
              </div>
              <div className="steps-action flex items-center  justify-end gap-5" style={{ marginTop: 24 }}>
                  {step > 0 && (
                    <CustomButton  onClick={prev} disabled={loading === 'save'}>
                      Previous
                    </CustomButton>
                  )}
                  <CustomButton className={"capitalize"} onClick={next} type="primary" disabled={loading === 'save'} loading={loading === 'save'}>
                    {step === steps.length - 1 ? 'Submit' : 'Next'}
                  </CustomButton>
                </div>

            </div>
          </Form>
        </div>
      </AppCol>
    </AppRow>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return { userConfig: userConfig.details };
};
const connectDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(
  connectStateToProps,
  connectDispatchToProps
)(SatoshiTest);
