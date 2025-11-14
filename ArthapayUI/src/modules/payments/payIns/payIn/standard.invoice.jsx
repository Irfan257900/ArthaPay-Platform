import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { NumericFormat } from "react-number-format";
import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, Tooltip } from "antd";
import { replaceExtraSpaces, validations } from "../../../../utils/validations";
import { normalizeFormattedNumber } from "./service";
import { useTranslation } from "react-i18next";
import CustomButton from "../../../../core/button/button";
import { useDispatch, useSelector } from "react-redux";
import { getPayinFiatPreview, savePaymentLink, setErrorMessages, showFiatPreviewModal, hideFiatPreviewModal } from "../../reducers/payin.reducer";
import moment from "moment";
import MerchantDropDown from "./merchantDropdown";
import AppAlert from "../../../../core/shared/appAlert";
import FiatPreview from "./fiat.preview";
import PreviewModal from "../../../../core/shared/previewModal";

const { requiredValidator, textValidator, numberValidator } = validations;

const StandardInvoice = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux selectors
    const { loading, error: saveLinkError } = useSelector((state) => state.payinstore.savePaymentLinks);
    const { loading: previewLoading, error: previewError } = useSelector((state) => state.payinstore.preview);
    const isFiatPreviewModalOpen = useSelector((state) => state.payinstore.isFiatPreviewModalOpen);
    const { data: fiatDetails } = useSelector((state) => state.payinstore.fiatDetails);

    const fiatOptions = fiatDetails?.assets?.filter(asset => asset.type === 'Payments')?.[0];
    const { data: currencyLists } = useSelector((state) => state.payinstore.currencyLists);
    const firstCurrency = currencyLists?.[0];
    const [limitError, setLimitError] = useState("");

    // Context from parent
    const { selectedPayinFiat, getPaymentsLinksIDR } = useOutletContext();


    // Helper to set a form field value
    const setField = useCallback((field, value) => {
        form.setFieldsValue({ [field]: value });
    }, [form]);

    // Handle amount change
    const handleAmountChange = useCallback((e) => {
        setField('amount', e.floatValue);
    }, [setField]);

    // Normalize amount input
    const normalizeAmount = useCallback(
        (value) => (value ? normalizeFormattedNumber(value) : undefined),
        []
    );

    // Navigation helpers
    const navigatetoPayins = useCallback(() => {
        navigate(`/payments/payins/payin/${fiatOptions?.id}/${fiatOptions?.code}/view/payments/fiat`);
        dispatch(setErrorMessages([{ key: 'savePaymentLinks', message: '' }]));
    }, [navigate, fiatOptions]);

    const navigateToPaymentLink = useCallback(async (response) => {
        await getPaymentsLinksIDR();
        navigate(`/payments/payins/payin/${response?.id}/${response?.currency}/view/payments/fiat`);
    }, [getPaymentsLinksIDR, navigate]);

    // Preview handler
    const handlePreview = useCallback(async () => {
        dispatch(setErrorMessages([{ key: 'preview', message: '' }]))
        try {
            const values = await form.validateFields();
            const previewObject = {
                customerWalletId: fiatOptions?.id,
                invoiceType: "Payment Link",
                orderId: values.orderId,
                // dueAmount: values.amount,
                amount: values?.amount,
                currency: fiatOptions?.code,
                coin: fiatOptions?.code,
                renderDueDate: moment().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss')
            };
            await dispatch(getPayinFiatPreview(previewObject));
            dispatch(showFiatPreviewModal());
        } catch (err) {
            // Validation errors are handled by antd form
        }
    }, [form, fiatOptions, dispatch]);

    // Save handler
    const handleSavePaymentLink = useCallback(async () => {
        try {
            const values = await form.validateFields();
                        if (firstCurrency) {
                if (values.amount < firstCurrency.minLimit) {
                    setLimitError(`Amount should be greater than or equal to ${firstCurrency?.minLimit?.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
                    return;
                }
                if (values.amount > firstCurrency.maxLimit) {
                    setLimitError(`Amount should be less than or equal to ${firstCurrency?.maxLimit?.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
                    return;
                }
            }
            setLimitError("");
            const saveObject = {
                customerWalletId: fiatOptions?.id,
                invoiceType: "Payment Link",
                orderId: values.orderId,
                amount: values.amount,
                currency: fiatOptions?.code,
                coin: fiatOptions?.code,
                dueDate: moment().add(24, 'hours').format('YYYY-MM-DD HH:mm:ss'),
            };
            dispatch(savePaymentLink({ saveObject, onSuccess: navigateToPaymentLink }));
        } catch (err) {
            // Validation errors are handled by antd form
        }
    }, [form, fiatOptions, dispatch, navigateToPaymentLink]);

    const clearErrorMessage = useCallback(() => {
        dispatch(setErrorMessages([{ key: 'savePaymentLinks', message: '' }]));
        setLimitError('')
    }, [dispatch]);

    const closePreviewModal = useCallback(() => {
        dispatch(hideFiatPreviewModal());
    }, [dispatch]);

    return (
        <>
            {(saveLinkError || limitError) && (
                <div className="alert-flex mt-5" style={{ width: "100%" }}>
                    <AppAlert
                        className="w-100"
                        type="warning"
                        description={saveLinkError || limitError}
                        showIcon
                    />
                    <button className="icon sm alert-close" onClick={clearErrorMessage}></button>
                </div>
            )}
            <div ref={formRef}>
                <Form form={form} layout="vertical">
                    <div className="mt-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <MerchantDropDown currrencyType="fiat" isDisable={true} forAdd={true} isform={true} />
                            <div>
                                <div className="relative">
                                    <div className="custom-input-lablel">
                                        {t('payments.payin.static.orderid')}&nbsp;
                                        <Tooltip className="c-pointer" title="Helps your client understand what they are paying for.">
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </div>
                                    <div className="text-left">
                                        <Form.Item
                                            className="payees-input m-0 error-block orderid-input"
                                            name="orderId"
                                            colon={false}
                                            rules={[
                                                textValidator('order id', 'alphaNumWithUsHyphenAndAt', ['onlyNumbers']),
                                                {
                                                    whitespace: true,
                                                    message: 'Invalid order id',
                                                },
                                            ]}
                                        >
                                            <input
                                                className="custom-input-field"
                                                placeholder={t('payments.placeholders.enterorderid')}
                                                maxLength={30}
                                                onBlur={e => setField("orderId", replaceExtraSpaces(e.target.value))}
                                            />
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-2xl text-titleColor font-semibold mt-5 mb-2">
                            {t('payments.payin.static.amounttopay')}
                        </h1>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="relative">
                                    <div className="custom-input-lablel">
                                        {t('payments.payin.static.amount')} <span className="text-requiredRed">*</span>
                                    </div>
                                    <Form.Item
                                        className="payees-input amount-label"
                                        name="amount"
                                        colon={false}
                                        rules={[
                                            requiredValidator(),
                                            // numberValidator('Amount')
                                        ]}
                                        normalize={normalizeAmount}
                                    >
                                        <NumericFormat
                                            className="custom-input-field"
                                            placeholder={t('payments.placeholders.enteramount')}
                                            name="amount"
                                            isAllowed={(values) => {
                                                const { value } = values;
                                                if (!value) return true;
                                                const digitsOnly = value.replace(/\D/g, "");
                                                return digitsOnly.length <= 15;
                                            }}
                                            thousandSeparator={true}
                                            thousandsGroupStyle="lakh"
                                            allowNegative={false}
                                            decimalScale={0}
                                            allowDecimals={false}
                                            onValueChange={handleAmountChange}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:flex gap-2.5 justify-end mt-6">
                        <CustomButton onClick={navigatetoPayins} disabled={loading || previewLoading}>
                            {t('common.cancel')}
                        </CustomButton>
                        <CustomButton onClick={handlePreview} loading={previewLoading} disabled={previewLoading || loading}>
                            {t('common.preview')}
                        </CustomButton>
                        <CustomButton type="primary" loading={loading} onClick={handleSavePaymentLink} disabled={loading || previewLoading}>
                            Save
                        </CustomButton>
                    </div>
                </Form>
            </div>
            <PreviewModal
                title={""}
                isModalOpen={isFiatPreviewModalOpen}
                onCancel={closePreviewModal}
                width={800}
                destroyOnClose
                footer={[
                    <CustomButton key="close" onClick={closePreviewModal}>
                        Close
                    </CustomButton>,
                ]}
            >
                <FiatPreview />
            </PreviewModal>
        </>

    );
};
export default StandardInvoice;