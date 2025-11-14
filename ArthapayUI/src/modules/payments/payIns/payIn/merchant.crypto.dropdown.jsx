import { Form, Select, Tooltip } from "antd";
import { InfoCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { setSelectedPayinWallet } from "../../reducers/payin.reducer";
import { validations } from "../../../../utils/validations";
const { requiredValidator } = validations;

const CryptoMerchantDropDown = ({ form, isform = false, isDisable = false, setSelectedPayinFiat, coinsDetails }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedPayinWallet = useSelector(state => state.payinstore.selectedPayinWallet);
    useEffect(() => {
        if (form && selectedPayinWallet?.id) {
            form.setFieldsValue({ walletsId: selectedPayinWallet.id });
        }
    }, [selectedPayinWallet, form]);

    const handleMerchantId = (selectedNetworkId) => {
        if (!coinsDetails) return;
        let selectedNetworkInfo = null;
        // Flatten the structure and find the first matching network
        for (const wallet of coinsDetails) {
            const match = wallet.merchantsDetails
                .flatMap(merchant =>
                    merchant.networks.map(network => ({
                        wallet,
                        merchant,
                        network
                    }))
                )
                .find(item => item.network.id === selectedNetworkId);
            if (match) {
                selectedNetworkInfo = match;
                break;
            }
        }
        if (selectedNetworkInfo) {
            const { wallet, merchant, network } = selectedNetworkInfo;

            const payload = {
                ...network,
                wallet,
                merchant
            };

            dispatch(setSelectedPayinWallet(payload));
            setSelectedPayinFiat?.(payload);
            form?.setFieldsValue({ walletsId: selectedNetworkId });
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
        <Form form={form} className="w-full">
            <div className="relative">
                <div className="custom-input-lablel">
                    Vault <span className="text-requiredRed">{isform && '*'}</span>&nbsp;
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
                            placeholder='Select Vault'
                            className="p-0 rounded outline-0 w-full text-lightWhite"
                            maxLength={30}
                            options={vaultOptions || []}
                            disabled={isDisable}
                        />
                    </Form.Item>
                </div>
            </div>
        </Form>
    );
};

export default CryptoMerchantDropDown;