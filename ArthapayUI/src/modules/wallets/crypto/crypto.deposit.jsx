import { QRCodeSVG } from "qrcode.react";
import { EmailShareButton, WhatsappShareButton } from "react-share";
import { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { setSelectedNetWork } from "../../../reducers/vaults.reducer";
import CopyComponent from "../../../core/shared/copyComponent";
import { useTranslation } from "react-i18next";
import { defaultMessages } from "../../../utils/textMessges";
import AppButton from "../../../core/shared/appButton";
import AppDefaults from "../../../utils/app.config";
import NumericText from "../../../core/shared/numericText";
const Cryptodeposit = () => {
    const selectedNetworks = useSelector((storeInfo) => storeInfo?.withdrawReducer?.networks);
    const [selectedNetwork, setSelectedNetwork] = useState(null);
    const client = window.runtimeConfig.VITE_CLIENT;
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useEffect(() => {
        if (selectedNetworks?.length > 0) {
            setSelectedNetwork(selectedNetworks?.[0]);
            dispatch(setSelectedNetWork(selectedNetworks?.[0]));
        }
    }, [selectedNetworks]);
    const userProfile = useSelector((store) => store.userConfig.metadata)
    const handleNetworkClick = (network) => {
        setSelectedNetwork(network);
        dispatch(setSelectedNetWork(network));
    };
    return (<div className="">
        <div className="text-center">
            <hr className="border border-cryptoline my-5"></hr>
            <div className="flex items-center justify-center flex-wrap gap-2.5 cursor-pointer mb-2.5">
                {selectedNetworks?.length > 0 &&
                    selectedNetworks.map((network, index) => (
                        <div key={network?.id} onClick={() => handleNetworkClick(network)}>
                            <div
                                className={` ${selectedNetwork?.name === network.name ? "currency-active" : "currency-box"
                                    }`}
                            >
                                {network?.name}
                            </div>
                        </div>

                    ))}
            </div>
            {selectedNetwork?.address && <>
                <h4 className="text-base text-subTextColor font-semibold mb-0.5">{`Your ${selectedNetwork?.coinCode} Address`}</h4>
                <div>
                    <QRCodeSVG value={selectedNetwork?.address} className="qr-image" />
                    <div className="mt-3">
                        <CopyComponent text={selectedNetwork?.address || ''} options={{ format: 'text/plain' }} shouldTruncate={false} componentClass="flex align-center justify-center">
                            <h4 copyable={{ tooltips: ['Copy', 'Copied'] }} className="summary-text m-0">{selectedNetwork?.address || '--'}</h4>
                        </CopyComponent>
                    </div>
                </div>
                <div className="rounded-5 border border-StrokeColor bg-tableheaderBlack p-1.5 mt-3 md:space-y-0 space-y-3 md:w-52 mx-auto">
                    <div className="flex items-center gap-2 justify-between px-3">
                        <h4 className='text-sm font-semibold text-left md:text-center text-paraColor'>Share it On</h4>
                        <div className="smm-icons space-x-3 md:text-center">
                            <WhatsappShareButton
                                className="icon lg whatsapp"
                                url={`${window.runtimeConfig.VITE_APP_URL}`}
                                title={`Hello, I would like to share my ${selectedNetwork?.coinCode || ''} (${selectedNetwork?.network || ''}) address for receiving: \n${selectedNetwork?.address || ''}\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using ${client}:`}
                            />
                            <EmailShareButton
                                className="icon lg mail ml-2"
                                url={`${window.runtimeConfig.VITE_APP_URL}`}
                                subject={"Wallet Address"}
                                body={`Hello, I would like to share my ${selectedNetwork?.coinCode || ''} (${selectedNetwork?.network || ''}) address for receiving: \n${selectedNetwork?.address || ''}\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using ${client}:`}
                            />
                        </div>
                    </div>
                </div>
            </>}
        </div>
         {selectedNetwork?.minLimit && selectedNetwork?.minLimit > 0 && <div className="rounded-5 border border-StrokeColor bg-bgblack  p-2 mt-6 md:space-y-0 space-y-3 select-list text-center w-4/5 m-auto ">
            <p>The minimum amount required to process this deposit is <NumericText value={selectedNetwork?.minLimit} className='font-semibold' suffixText={`${selectedNetwork.coinCode} (${selectedNetwork?.name})`}/>. Deposits below this amount will not be processed.</p>
        </div>}
       {selectedNetwork?.maxLimit && selectedNetwork?.maxLimit > 0 && <div className="rounded-5 border border-StrokeColor bg-bgblack  p-2 mt-3 md:space-y-0 space-y-3 select-list text-center w-4/5 m-auto">
            <p>The maximum limit for a single transaction is <NumericText value={selectedNetwork?.maxLimit} className='font-semibold' suffixText={selectedNetwork?.name}/></p>
        </div>}
        {selectedNetwork?.address && <div className="rounded-5 border border-StrokeColor bg-bgblack md:p-5 p-2.5 mt-6 md:space-y-0 space-y-3 select-list text-center">
            <div dangerouslySetInnerHTML={{ __html: selectedNetwork?.remarks }} />
        </div>}
        {!selectedNetwork?.address &&
            <>
                {/* Consistent styled box */}
                <div className="rounded-sm border border-StrokeColor bg-bgblack md:p-5 p-2.5 mt-6 text-center">
                    <p className="text-sm text-warningColor font-medium">
                        {defaultMessages.depositAddressUnavailableTitle}
                        <span className="font-semibold">{selectedNetwork?.coinCode}</span> {defaultMessages.depositAddressUnavailableDescription}
                    </p>
                    <p className="text-sm text-subTextColor mt-2">
                        {defaultMessages.depositAddressUnavailableSuggestion}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                        {defaultMessages.depositAddressUnavailableContact} <a className="text-primaryColor" href={`mailto:${userProfile.AdminEmail}`}>{userProfile.AdminEmail}</a>
                    </p>
                </div>
            </>
        }
    </div>
    )
}
const mapStateToProps = ({ userConfig }) => {
    return { user: userConfig.details };
};

export default connect(mapStateToProps)(Cryptodeposit);
