import React from 'react';
import { QRCodeSVG } from "qrcode.react";
import { EmailShareButton, WhatsappShareButton } from "react-share";
import CopyComponent from '../../../core/shared/copyComponent';
const clientName = window.runtimeConfig.VITE_CLIENT_NAME;

const getStatusClass = (data) => {
  if (data?.status === "Inactive" || data?.whiteListState === "Rejected") {
    return "bg-redMerunGradiant";
  }
  if (data?.whiteListState?.toLowerCase() === "draft") {
    return "bg-yellowGradient";
  }
  if (data?.whiteListState?.toLowerCase() === "submitted") {
    return "bg-blueGradient"
  }
  return "bg-greenLightDarkGradiant";
};
const Details = ({ data }) => {
  const statusClass = getStatusClass(data);
  return (
    <div className='text-center'>
      <p className="text-center text-lightWhite mb-0 capitalize">
        {data?.favouriteName}
      </p>
      <div> <p className="m-0 text-center !text-lightWhite text-lg font-semibold">Your <span className="fw-500"> {data?.currency}</span> Address</p></div>

      <div className="flex justify-center text-center f-12 !text-lightWhite custom-crypto-btns netwok-stye mt-2" >
        <span className={'currency-active'} > {data?.network}</span>
      </div>
      <div> <h2 className="summary-text m-0 text-center mb-4 !text-nameCircle"></h2></div>
      <div className='deposit-crypto mb-3'>
        <QRCodeSVG value={data?.walletaddress} className="qr-image mx-auto rounded-md" />
      </div>
      <div className='mb-3 text-center !text-nameCircle'>
        <CopyComponent className="!text-primaryColor" text={data?.walletaddress} shouldTruncate={false} />
      </div>
      <p className="py-2"><span className={`status-label ${statusClass}`}> {data?.status?.toLowerCase() == "inactive" ? "Deactivated" : data?.whiteListState}</span></p>
      {data?.whiteListState?.toLowerCase() === 'rejected' && <div> <p className="mb-3 text-center !text-lightWhite text-sm font-narmal">Reason{" "}:{" "}<span className='text-paraColor'>{data?.rejectReason}</span></p></div>}
      <div className='rounded-5 border border-StrokeColor bg-tableheaderBlack p-1.5 mt-4 md:space-y-0 space-y-3 md:w-52 mx-auto'>
        <div className='flex items-center gap-2 justify-between px-3'>
          <h4 className='text-sm font-semibold text-left md:text-center text-paraColor'>Share On</h4>
          <div className="smm-icons space-x-3">
            <WhatsappShareButton className="icon lg whatsapp" url={`${window.runtimeConfig.VITE_APP_URL} \nThank you.`} title={`Hello, I would like to share my ` + `${data?.currency} ` + `(${data?.network}) ` + ` address for receiving: ` + `\n${data?.walletaddress}` + `\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using ${clientName}`}></WhatsappShareButton>
            <EmailShareButton className="icon lg mail" url={`${window.runtimeConfig.VITE_APP_URL} \nThank you.`} subject={"Wallet Address"} body={`Hello, I would like to share my ` + `${data?.currency} ` + `(${data?.network})` + ` address for receiving: ` + `\n${data?.walletaddress}` + `\nPlease make sure you are using the correct protocol otherwise you are risking losing the funds.\nI am using ${clientName}`}></EmailShareButton>
          </div>
        </div>
      </div>
      {data?.note &&
        <div className='!rounded-5 border border-StrokeColor bg-bgblack  p-3 mt-4 text-start'>
          <p className="font-medium mb-1 !text-base">Note :  <span className='text-paraColor font-normal text-sm'>{data?.note}</span></p>

        </div>
      }
    </div>
  )
}

export default Details