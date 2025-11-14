import React, { useCallback, useEffect, useReducer } from "react";
import CommonDrawer from "../../../core/shared/drawer";
import { Form } from "antd";
import { useSelector } from "react-redux";
import { addCardToMember, getAddCardDetails } from "../httpServices";
import CustomButton from "../../../core/button/button";
import AppAlert from "../../../core/shared/appAlert";
import SideDrawerLoader from "../../../core/skeleton/drawer.loaders/sidedrawer.loader";
import { successToaster } from "../../../core/shared/toasters";
import AppSelect from "../../../core/shared/appSelect";
import { assignCardreducer, assignCardState } from "./card.reducer";
import { useTranslation } from "react-i18next";
const AddCard = ({
  isOpen,
  title = "Add",
  onClose,
  cardDetails,
  handleAssignCardModel
}) => {
  const [form] = Form.useForm();
  const [localState, localDispatch] = useReducer(assignCardreducer, assignCardState);
  const userProfile = useSelector((store) => store.userConfig.details || {} );
  const { t } = useTranslation();
  useEffect(() => {
    if (userProfile.id) {
      const urlParams = {
        customerId: userProfile.id,
        search:null
      };
      getAddCardDetails(localDispatch, urlParams);
    }
  }, [userProfile.id]);
  const gethandleUpdate = useCallback((info) => {
    if(info){
      successToaster({content : t('cards.Messages.APPLY_CARD_SUCCESSMESSAGE'),className : "custom-msg",duration : 3});
      handleClose();
      handleAssignCardModel("save")
    }
  }, [t]);
  const onSubmit = useCallback(async () => {
    await form.validateFields();
    const values = {
      employeeId: localState?.filteredPayees?.id,
      programId: cardDetails?.programId
    };
    const urlParams = {reqObj:values}
   await addCardToMember(localDispatch,gethandleUpdate,urlParams);
  }, [form, localState, userProfile, cardDetails, localDispatch]);
  const handleClose = useCallback(() => {
    localDispatch({ type: 'setData', payload: [] });
    localDispatch({ type: 'setError', payload: null });
    form.resetFields();
    onClose?.(false);
    localDispatch({ type: 'setFilteredPayees', payload: null });
  }, [form]);

  const setField = useCallback((fieldName, value) => {
    const selectedObject = localState?.data?.find((item) => item.name === value);
    localDispatch({ type: 'setFilteredPayees', payload: selectedObject || null });
    form.setFieldValue(fieldName, value);
  }, [localState, form])
  const getFieldsValues = useCallback((e) => {
    setField("assignCard", e);
  }, [setField])
  const clearErrorMsg = useCallback(() => {
    localDispatch({ type: 'setError', payload: null })
  }, [])
  
  return (
    <CommonDrawer title={title} isOpen={isOpen} onClose={handleClose}>
      <Form form={form} className={` mb-5`}>
        {localState?.loader && <SideDrawerLoader />}
        {localState?.error && (
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
            className="w-100 "
            type="warning"
            description={localState?.error}
            showIcon
          />
          <span className="icon sm alert-close" onClick={clearErrorMsg }></span>
          </div>
        )}
        {!localState?.loader && (
          <>
          <Form.Item
          className="mb-0 custom-select-float relative mt-5"
          name="employee"
          label={t('cards.assignCard.Employee')}
          colon={false}
          rules={[ { required: true,message: t('cards.Is_required') } ]}>
          <AppSelect
            className="p-0 rounded outline-0 w-full text-lightWhite"
            showSearch
            allowClear
            placeholder={t('cards.assignCard.Select_Employee')}
            onChange={getFieldsValues}
            options={localState?.data}
            fieldNames={{label:'name',value:'name'}}
          />
        </Form.Item>
            <div className="text-right mt-9">
            <CustomButton
              type="primary"
              onClick={onSubmit}
              className={""}
              loading={localState?.saveBtnLoader}
              disabled={localState?.saveBtnLoader}
            >
              {t('cards.assignCard.Submit')}
            </CustomButton>
            </div>
          </>
        )}
      </Form>
    </CommonDrawer>
  );
};

export default AddCard;
