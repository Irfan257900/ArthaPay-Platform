import { Form, Select, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { InfoCircleOutlined } from '@ant-design/icons';
import { validations } from "../../../../utils/validations";
import { useEffect, useState } from "react";
import { fetchCoinDetails, setSelectedPayinWallet, fetchFiatDetails, getPayinCurrencyLists, setSelectedCurrencyIDR, setSelectedFiatCoin } from "../../reducers/payin.reducer";
import { useDispatch, useSelector } from "react-redux";
const { requiredValidator } = validations;
const MerchantDropDown = ({ currrencyType, isform = false, setSelectedPayinFiat, isDisable = false, forAdd = false, getPaymentsLinksIDR, setDetailsView }) => {
    const { t } = useTranslation();
    const { vaultName, mode } = useParams();
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading: coinsDetailsLoading, data: coinsDetails, error: coinsDetailsError } = useSelector((state) => state.payinstore.coinDetails);
    const { loading: fiatDetailsLoading, data: fiatDetails, error: fiatDetailsError } = useSelector((state) => state.payinstore.fiatDetails);
    const selectedFiatCoin = useSelector((state) => state.payinstore.selectedFiatCoin);
    const selectedPayinWallet = useSelector(state => state.payinstore.selectedPayinWallet);



    const fiatOptions = forAdd
        ? fiatDetails?.assets?.filter(asset => asset.type === 'Payments')
        : fiatDetails?.assets;


    useEffect(() => {
        if (currrencyType === 'crypto') {
            dispatch(fetchCoinDetails());
        }
        // else {
        //     dispatch(fetchFiatDetails())
        // }
    }, [currrencyType]);

    useEffect(() => {
        if (currrencyType === 'fiat' && fiatDetails?.assets?.length > 0) {
            if (mode !== 'fiatadd') {
                dispatch(setSelectedFiatCoin(fiatDetails.assets[0]));
                setSelectedPayinFiat?.(fiatDetails.assets[0]);
                dispatch(getPayinCurrencyLists({ faitCoint: fiatDetails.assets[0]?.code, setDetailsView, navigate, navigateOrNot: true }));
            }
            // else {
            //     const fiatOptions = forAdd
            //         ? fiatDetails?.assets?.filter(asset => asset.type === 'Payments')
            //         : fiatDetails?.assets;
            //     dispatch(setSelectedFiatCoin(fiatOptions?.[0]));
            //     setSelectedPayinFiat?.(fiatDetails?.[0]);
            // }
        }
    }, [currrencyType, fiatDetails]);

    useEffect(() => {
        if (form && selectedPayinWallet?.id) {
            form.setFieldsValue({ walletsId: selectedPayinWallet?.id });
        }
    }, [selectedPayinWallet, form]);


    // useEffect(() => {
    //     if (forAdd) {
    //          dispatch(setSelectedFiatCoin(fiatOptions?.[0]));
    //     }
    // }, [forAdd, fiatOptions])



    const handleSetSelectedFiatCoin = async (value) => {
        // dispatch(setSelectedCurrencyIDR(""));
        const selectedCoin = fiatDetails?.assets?.find(coin => coin.id === value);
        setSelectedPayinFiat?.(selectedCoin)
        dispatch(setSelectedFiatCoin(selectedCoin));
        dispatch(getPayinCurrencyLists({ faitCoint: selectedCoin?.code, setDetailsView, navigate, navigateOrNot: selectedCoin?.code?.toLowerCase() !== 'all' ? false : true }));
        dispatch(setSelectedCurrencyIDR(selectedCoin?.code));
        if (selectedCoin?.type !== 'Payments') {
            navigate(`/payments/payins/payin/${selectedCoin?.id}/${selectedCoin?.code}/view/${selectedCoin?.code}/fiat`)
        } else {
            navigate(`/payments/payins/payin/${selectedCoin?.id}/${selectedCoin?.code}/view/${selectedCoin?.type}/fiat`);
            await getPaymentsLinksIDR?.();
        }
        setSelectedPayinFiat?.(selectedCoin);
    };

    const handleMerchantId = (selectedNetworkId) => {
        // Find the selected network object from coinsDetails
        let selectedNetwork = null;
        let selectedWallet = null;
        let selectedMerchant = null;

        if (coinsDetails) {
            for (const wallet of coinsDetails) {
                for (const merchant of wallet.merchantsDetails) {
                    for (const network of merchant.networks) {
                        if (network.id === selectedNetworkId) {
                            selectedNetwork = network;
                            selectedWallet = wallet;
                            selectedMerchant = merchant;
                            break;
                        }
                    }
                    if (selectedNetwork) break;
                }
                if (selectedNetwork) break;
            }
        }
        if (selectedNetwork) {
            // Save to Redux for global sync
            dispatch(setSelectedPayinWallet({
                ...selectedNetwork,
                wallet: selectedWallet,
                merchant: selectedMerchant,
            }));
            // Optionally, call setSelectedPayinFiat for local/parent sync if needed
            setSelectedPayinFiat?.({
                ...selectedNetwork,
                wallet: selectedWallet,
                merchant: selectedMerchant,
            });
            form.setFieldsValue({ walletsId: selectedNetworkId });
        }
    };


    const vaultOptions = coinsDetails?.flatMap(wallet => {
        const walletName = wallet.name || 'Unnamed Wallet';
        const showWalletName = coinsDetails.length > 1;
        return wallet.merchantsDetails.flatMap(merchant => {
            const coin = merchant.coin;
            return merchant.networks.map(network => ({
                label: `${showWalletName ? walletName + " - " : ""}${coin} (${network.code})`,
                value: network.id,
            }));
        });
    });
    return (
        <div>
            <Form form={form} className="w-full">
                {currrencyType === 'crypto' && <div className={`relative `}>
                    <div className="custom-input-lablel">
                        {t('payments.payin.static.vault')} <span className="text-requiredRed">{isform && '*'}</span>&nbsp;
                        <Tooltip className="c-pointer" title='The funds paid by the client will be transferred  to your business wallet'><InfoCircleOutlined /></Tooltip>

                    </div>
                    <div className="text-left">
                        <Form.Item
                            name="walletsId"
                            rules={[requiredValidator()]}
                            className="mb-0 custom-select-float"
                            colon={false}
                        >
                            <Select
                                value={selectedPayinWallet?.id}
                                onChange={handleMerchantId}
                                placeholder={t('payments.placeholders.selectvault')}
                                className="p-0 rounded outline-0 w-full text-lightWhite"
                                maxLength={30}
                                // fieldNames={{ label: 'name', value: 'id' }}
                                options={vaultOptions || []}
                            ///disabled={mode !== 'generate' || (mode !== 'generate' && form.getFieldValue('status') !== 'Not Paid')}
                            />
                        </Form.Item>
                    </div>
                </div>}
                {currrencyType === 'fiat' && (
                    <div className="relative">
                        <div className="custom-input-lablel">
                            Select Currency <span className="text-requiredRed">{isform && '*'}</span>&nbsp;
                        </div>
                        <div className="text-left">
                            <Form.Item
                                name="merchantId"
                                rules={[requiredValidator()]}
                                className="mb-0 custom-select-float"
                                colon={false}
                                initialValue={forAdd ? fiatOptions?.[0]?.id : fiatDetails?.assets?.[0]?.id}
                            >
                                <Select
                                    onChange={handleSetSelectedFiatCoin}
                                    placeholder="Select Currency"
                                    className="p-0 rounded outline-0 w-full text-lightWhite"
                                    maxLength={30}
                                    defaultValue={"All"}
                                    value={forAdd ? fiatOptions?.[0]?.id : selectedFiatCoin?.id || fiatDetails?.assets?.[0]?.id}
                                    fieldNames={{ label: "code", value: "id" }}
                                    options={
                                        forAdd
                                            ? fiatDetails?.assets?.filter(asset => asset.type === "Payments")
                                            : fiatDetails?.assets || []
                                    }
                                    disabled={isDisable}
                                />
                            </Form.Item>
                        </div>
                    </div>
                )}
            </Form>
        </div>
    );
}

export default MerchantDropDown;