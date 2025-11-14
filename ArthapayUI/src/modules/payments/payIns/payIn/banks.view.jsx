import { EmailShareButton, WhatsappShareButton } from "react-share";
import CopyComponent from "../../../../core/shared/copyComponent";
import { decryptAES } from "../../../../core/shared/encrypt.decrypt";
import NumericText from "../../../../core/shared/numericText";
import AppDefaults from "../../../../utils/app.config";

const accountNumberLabel = {
    "usd": "Account Number",
    "eur": "IBAN",
    "gbp": "IBAN",
    "chf": "IBAN"
};

const Item = ({ label, isCopy, value, labelClass = "summary-label", textClass = "summary-text m-0", className = "summary-list-item" }) => (
    <div className={className}>
        <span className={labelClass}>{label}</span>
        {isCopy
            ? <CopyComponent shouldTruncate={false} componentClass={textClass} text={value} />
            : <span className={textClass}>{value}</span>
        }
    </div>
);

const BankDetails = ({ bankList, selectedPayinFiat }) => (
    <div>
        {bankList.map((data) => (
                <div className="summary-contentarea" key={data.id}>
                    <Item
                        label={accountNumberLabel[selectedPayinFiat?.code?.toLowerCase()] || "IBAN/Account Number"}
                        value={decryptAES(data?.accountNumber) || "--"}
                        isCopy={decryptAES(data?.accountNumber)}
                    />
                    <Item
                        label="Swift/BIC Code"
                        value={data?.swiftRouteBICNumber || "--"}
                        isCopy={data?.swiftRouteBICNumber}
                    />
                    <Item
                        label="Available Balance"
                        value={<NumericText value={data?.balance} fixedDecimals={null} decimalScale={AppDefaults.fiatDecimals} />}
                    />
                    <div className='rounded-5 border border-StrokeColor bg-advcard px-1.5 py-2 mt-3 md:space-y-0 space-y-3 md:w-full'>
                        <div className='flex items-center gap-2 justify-between px-3'>
                            <h4 className='text-sm font-semibold text-left md:text-center text-paraColor'>Share On:</h4>
                            <div className="smm-icons space-x-3 md:text-center">
                                <WhatsappShareButton
                                    className="icon lg whatsapp"
                                    url={`${window.runtimeConfig.VITE_APP_URL} \n\nThank you.`}
                                    title={`Hello,\nI would like to share my ${selectedPayinFiat?.code} Account Details for receiving funds: \n\nIBAN/Account Number : ${decryptAES(data?.accountNumber) || decryptAES(data?.iban)}\nSWIFT/BIC Code : ${decryptAES(data?.iban)}\nBank Name : ${data?.name}\n\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using Arthapay:`}
                                />
                                <EmailShareButton
                                    className="icon lg mail ml-2"
                                    url={`${window.runtimeConfig.VITE_APP_URL} \n\nThank you.`}
                                    subject="Account Details"
                                    body={`Hello,I would like to share my ${selectedPayinFiat?.code} Account Details for receiving funds: \n\nIBAN/Account Number : ${decryptAES(data?.accountNumber) || decryptAES(data?.iban)}\nSWIFT/BIC Code : ${decryptAES(data?.iban)}\nBank Name : ${data?.name}\n\nPlease make sure you are using the correct protocol; otherwise, you risk losing the funds.\nI am using Arthapay:`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
        ))}
    </div>
);

export default BankDetails;