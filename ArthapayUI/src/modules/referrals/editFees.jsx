import React, { useCallback } from "react";
import {Form, Input} from 'antd';
import CustomButton from "../../core/button/button"
import { NumericFormat } from "react-number-format";
import Loader from "../../core/shared/loader";
import AppAlert from "../../core/shared/appAlert";

  const EditFees = (props) => {

    const feeHandler = useCallback((e) => {
        props.setField(e?.target?.name, e?.target?.value);
      },
      [props]
    );
    const saveHandleUpdateClick = useCallback(
      (e) => {
        props?.handleUpdate(e);
      },
      [props?.handleUpdate]
    );
    const cancelHandleUpdateClick = useCallback(
      () => {
        props?.toggleDrawer(false)
      },
      [props?.toggleDrawer]
    );
  return (
    <div className="">
      {props.formLoader ? <Loader /> : 
      <div className="mt-10">
         {props?.formErrorMsg &&
        <div className="alert-flex mb-24">
          <AppAlert
            className="w-100 "
            type="warning"
            description={props?.formErrorMsg}
            showIcon
          />
          <span className="icon sm alert-close" onClick={() => props?.localDispatch({ type: 'setFormErrorMsg', payload: null })}></span>
        </div>
      }
        <Form form={props.form} enableReinitialize >
            <div className="grid grid-cols-1 gap-7">
             <div className="relative">
                <div className="custom-input-lablel">
                Min <span className="text-textLightRed">*</span>
                </div>
             <Form.Item
              className="mb-0"
            
              name="minFee"
              type="number"
              colon={false}
             rules={[
              { required: true, message: "Is required" },
             ]}>
                <NumericFormat
                  className='bg-transparent border border-inputDarkBorder text-lightWhite p-2 rounded outline-0'
                  customInput={Input}
                  maxLength={10}
                  decimalScale={4}
                  thousandSeparator={true}
                  placeholder="Enter Amount"
                  displayType={"input"}
                  allowNegative={false}
                  onChange={feeHandler}
                />
              </Form.Item>
             </div>
             <div className="relative">
                <div className="custom-input-lablel">
                Max(%) <span className="text-textLightRed">*</span>
                </div>
             <Form.Item
              className="mb-0"
             name="maxFee"
             type="number"
             colon={false}
             rules={[
              { required: true, message: "Is required" },
             ]}>
                <NumericFormat
                  className='bg-transparent border border-inputDarkBorder text-lightWhite p-2 rounded outline-0'
                  customInput={Input}
                  maxLength={10}
                  decimalScale={4}
                  thousandSeparator={true}
                  placeholder="Enter Value"
                  displayType={"input"}
                  allowNegative={false}
                  onChange={feeHandler}
                />
              </Form.Item>
             </div>
             <div className="relative">
                <div className="custom-input-lablel">
                Flat<span className="text-textLightRed">*</span>
                </div>
             <Form.Item 
              className="mb-0"
               name="flatFee"
               type="number"
               colon={false}
               rules={[
                { required: true, message: "Is required" },
               ]}>
                <NumericFormat
                  className='bg-transparent border border-inputDarkBorder text-lightWhite p-2 rounded outline-0'
                  customInput={Input}
                  maxLength={10}
                  decimalScale={4}
                  thousandSeparator={true}
                  placeholder="Enter Value"
                  displayType={"input"}
                  allowNegative={false}
                  onChange={feeHandler}
                />
              </Form.Item>
             </div>
            </div>
         
          <div className=" mt-10">
            <CustomButton type="primary" className="w-full" loading={props.loader}  onClick={saveHandleUpdateClick}>
              Save
            </CustomButton>
            <CustomButton className="w-full mt-8" onClick={cancelHandleUpdateClick}>Cancle</CustomButton>
          </div>
        </Form>
      </div> }
    </div>
  );
}

export default EditFees;
