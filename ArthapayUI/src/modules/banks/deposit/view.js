import { EmailShareButton, WhatsappShareButton } from 'react-share';
import PendingAccount from '../pending.account';
import CopyComponent from '../../../core/shared/copyComponent';
import AppText from '../../../core/shared/appText';
import NumericText from '../../../core/shared/numericText';
import AppDefaults, { fiatCurrencySymbols } from '../../../utils/app.config';
import { decryptAES } from '../../../core/shared/encrypt.decrypt';
import RejectedAccount from '../rejected.rejected';
import numberFormatter from '../../../utils/numberFormatter';
const accountNumberLabel = {
  "usd": "Account Number",
  "eur": "IBAN",
  "gbp": "IBAN",
  "chf": "IBAN"
};
const Item = ({ label, isCopy, value, labelClass = "summary-label", textClass = "summary-text m-0 flex items-center gap-2", className = "summary-list-item" }) => {
  return <div className={className} >
    <AppText className={labelClass}>{label}</AppText>
    {isCopy &&
      <CopyComponent shouldTruncate={false} componentClass={textClass} text={value} />
    }
    {!isCopy &&
      <AppText className={textClass}>{value}</AppText>
    }
  </div>
}
const View = ({ accountDetails, selectedCurrency }) => {
  const client = window.runtimeConfig.VITE_CLIENT;
  const getBalanceText = (amount, isSuffix, isOnlyAmount) => {
    const numAmount = parseFloat(amount) || 0;
    if (isNaN(numAmount)) return '0.00';

    const { number, suffix } = numberFormatter(numAmount) || {};
    const formattedNumber = (number ?? 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (isSuffix) {
      return suffix || "";
    }
    if (isOnlyAmount) {
      return formattedNumber;
    }
    return `$ ${formattedNumber}`;
  };

  return (
    <>
      <div className='trans-card !w-full  md:!w-[465PX]'>
        {accountDetails?.map((data) => (
          <div className="summary-contentarea" key={data.id}>
            {data?.accountStatus === 'Approved' && (<>
              <div className='mb-2'>
                <h3 className='text-xl text-titleColor font-semibold capitalize'> Bank Account Details</h3>
                <div className='summary m-0 p-2 md:p-0'>
                  <Item
                    label="Account Holder Name"
                    value={data?.accountHolderName || "--"}
                  />
                  <Item
                    label={accountNumberLabel[selectedCurrency?.toLowerCase()] || "IBAN/Account Number"}
                    value={decryptAES(data?.accountNumber) || "--"}
                    isCopy={decryptAES(data?.accountNumber)}
                  />
                  <Item
                    label="Bank Name"
                    value={data?.bankName || "--"}
                  />
                  <Item
                    label="Swift/BIC Code"
                    value={data?.swiftRouteBICNumber || "--"}
                    isCopy={data?.swiftRouteBICNumber}
                  />
                  <Item
                    label="Routing Code"
                    value={data?.routingCode || "--"}
                    isCopy={data?.routingCode}
                  />
                  <Item
                    label="Routing  Type"
                    value={data?.routingType || "--"}
                    isCopy={data?.routingType}
                  />
                  <Item
                    label="Available Balance"
                    value={
                      <NumericText
                        value={getBalanceText(data?.balance, false, true) || 0}
                        decimalScale={AppDefaults.fiatDecimals}
                        thousandSeparator
                        className="block"
                        displayType="text"
                       prefixText={fiatCurrencySymbols[selectedCurrency?.toLowerCase()]}
                      />
                    }
                  />
                </div>
              </div>

              <div className='pt-5'>
                <h3 className='text-xl text-titleColor font-semibold capitalize'>Bank Address</h3>
                {data.banksDetails && Object.entries(data.banksDetails).map(([key, value]) => (
                  <Item
                    key={key}
                    label={key}
                    value={value || "--"}
                  // isCopy={!!value}
                  />
                ))}
              </div>
              <p className="border border-StrokeColor p-2.5 rounded-5 mt-3">
                <strong> Note : </strong> {" "}<span className="text-paraColor">{data?.note || '--'}</span>
              </p>
              <div className='rounded-5 border border-StrokeColor !bg-menuhover px-1.5 py-2 mt-3 md:space-y-0 space-y-3 md:w-full'>
                <div className='flex items-center gap-2 justify-between px-3'>
                  <h4 className='text-sm font-semibold text-left md:text-center text-paraColor'>Share On:</h4>
                  <div className="smm-icons space-x-3 md:text-center">
                    <WhatsappShareButton className="icon lg whatsapp" url={`${window.runtimeConfig.VITE_APP_URL} \n\nThank you.`}
                      title={`Hello,\nI would like to share my ` + `${selectedCurrency} ` + ` Account Details for receiving funds: ` + `\n\n` + `IBAN/Account Number : ` + `${decryptAES(data?.accountNumber) || decryptAES(data?.iban)}` + `\n` + `SWIFT/BIC Code : ` + ` ${data?.swiftRouteBICNumber}` + `\n` + `Account Holder Name : ` + ` ${data?.accountHolderName}` + `\n` + `Bank Name : ` + ` ${data?.bankName}` + `\n` + `Currency : ` + `${selectedCurrency}`+`\n\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using ${client}:`} >
                    </WhatsappShareButton>
                    <EmailShareButton className="icon lg mail ml-2" url={`${window.runtimeConfig.VITE_APP_URL} \n\nThank you.`} subject={"Account Details"}
                     body={`Hello,\nI would like to share my ` + `${selectedCurrency} ` + ` Account Details for receiving funds: ` + `\n\n` + `IBAN/Account Number : ` + `${decryptAES(data?.accountNumber) || decryptAES(data?.iban)}` + `\n` + `SWIFT/BIC Code : ` + ` ${data?.swiftRouteBICNumber}` + `\n` + `Account Holder Name : ` + ` ${data?.accountHolderName}` + `\n` + `Bank Name : ` + ` ${data?.bankName}` + `\n` + `Currency : ` + `${selectedCurrency}`+`\n\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using ${client}:`}></EmailShareButton>
                  </div>
                </div>
              </div>
            </>)}
            {data?.accountStatus === 'Rejected' && (
              <RejectedAccount data={data} />
            )}
            {(data.accountStatus === 'Pending' || data.accountStatus === 'Submitted') && (
              <PendingAccount selectedCurrency={selectedCurrency} />
            )}
            {/* {!['Submitted,Pending', 'Approved'].includes(data.accountStatus) && <AppEmpty />} */}
          </div>))}
      </div>
    </>
  )
}
export default View