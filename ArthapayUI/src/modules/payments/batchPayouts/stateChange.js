import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Select } from "antd";
import useApi from "../../../utils/useApi";
import AppAlert from "../../../core/shared/appAlert";
import { getStatusChangeLookup, updatePayoutStatus } from "./services";
import { useSelector } from "react-redux";
import CustomButton from "../../../core/button/button";
import CommonDrawer from "../../../core/shared/drawer";
import SideDrawerLoader from '../../../core/skeleton/drawer.loaders/sidedrawer.loader'
import { useTranslation } from "react-i18next";
import { successToaster } from "../../../core/shared/toasters";
import { statusToaster } from "./batchPayoutServices";
const optionsKey = "options";
const saveKey = "save";

const StateChange = ({ isModalOpen, onCancel, onSuccess, selectedRecord }) => {
    const [form] = Form.useForm();
    const {t} = useTranslation();
    const { awaitingResponse, data, error, clearError, handleApi } = useApi(true);
    const userProfile = useSelector((info) => info.userConfig.details);

    const errorMessage = useMemo(() => {
        return error[optionsKey] || error[saveKey];
    }, [error]);
    const [initialStatus, setInitialStatus] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null); 

    useEffect(() => {
        if (isModalOpen) {
            form.setFieldsValue({ status: selectedRecord?.status });
            setInitialStatus(selectedRecord?.status);
            setCurrentStatus(selectedRecord?.status);
            handleApi(
                getStatusChangeLookup,
                null,
                optionsKey,
                true,
                [selectedRecord?.status],
                "onlyData"
            );
        }
    }, [selectedRecord, isModalOpen, form]);

    useEffect(() => {
        if (data[saveKey]) {
            onSuccess(data[saveKey]);
            onCancel();
        }
    }, [data[saveKey]]);

    const handleClearMessage=useCallback(()=>{
        clearError();
    },[])
    const handleSave = useCallback(() => {
        const values = form.getFieldsValue(true);
        if (values.status === selectedRecord?.status) {
            return;
        }
        handleApi(
            updatePayoutStatus,
            null,
            saveKey,
            true,
            [selectedRecord, values.status, userProfile],
            "dataWithError"
        );
        successToaster({ content: `${statusToaster}`})
    },[selectedRecord,userProfile,updatePayoutStatus]);
    const handleStatusChange = useCallback((value) => {
        setCurrentStatus(value);
        form.setFieldsValue({ status: value });
    },[]);

    const handleSubmit=useCallback(()=>{
        form.submit()
    },[form])

    const isSaveDisabled = currentStatus === initialStatus;

    return (
        <CommonDrawer
            isOpen={isModalOpen}
            onClose={onCancel}
            title="Change Status"
            className="status-drawer"
            maskClosable={false}
        >
            <Form form={form} onFinish={handleSave} className="basicinfo-form py-9">
                {errorMessage && (
                    <div className="alert-flex" style={{ width: "100%" }}>
                        <AppAlert
                            description={errorMessage}
                            type="error"
                            showIcon
                            onClose={handleClearMessage}
                        />
                        <span
                            className="icon sm alert-close"
                            onClick={handleClearMessage}
                        ></span>
                    </div>
                )}
                {awaitingResponse[optionsKey] && <SideDrawerLoader />}
                {!awaitingResponse[optionsKey] && (
                    <Form.Item
                        className="custom-select-float mb-0"
                        name="status"
                        label={t('common.status')}
                        colon={false}
                        rules={[{ required: true, message: "Is required", whitespace: true }]}
                    >
                        <Select
                            placeholder={t('common.selectstatus')}
                            maxLength={50}
                            onChange={handleStatusChange} 
                        >
                            {data[optionsKey]?.map((option) => (
                                <Select.Option key={option.code} value={option.code}>
                                    {option.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                <div className="mt-9 text-right">
                    <CustomButton
                        className=""
                        onClick={onCancel}
                        // disabled={awaitingResponse[saveKey]}
                    >
                        {t('common.cancel')}
                    </CustomButton>
                    <CustomButton
                        className={"md:ml-3.5"} type="primary"
                        onClick={handleSubmit}
                        loading={awaitingResponse[optionsKey] || awaitingResponse[saveKey]}
                        disabled={awaitingResponse[optionsKey] || awaitingResponse[saveKey] || isSaveDisabled}
                    >
                        {t('common.save')}
                        </CustomButton>
                </div>
            </Form>
        </CommonDrawer>
    );
};

export default StateChange;
