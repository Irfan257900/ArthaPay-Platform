import React, { useCallback, useEffect, useMemo, useState } from "react";
import AppAlert from "../../../core/shared/appAlert";
import { getPaymentFields} from '../http.services'
import moment from "moment";
import PreviewModal from "../../../core/shared/preview.model";
import { decryptAES } from "../../../core/shared/encrypt.decrypt";

const GetDecryptedValue = (value, shouldDecrypt) => {
  return useMemo(() => {
    if (!shouldDecrypt || !value) 
      return value;
    try {
      return decryptAES(value);
    } catch (error) {
      console.error("Decryption error:", error);
     return value;
    }
  }, [value, shouldDecrypt]);
};

const FormattedField = React.memo(({ field, data, fieldKey,isdecrypt }) => {
  const [previewDoc, setPreviewDoc] = useState(null)

  const handlePreviewClose = useCallback(() => {
    setPreviewDoc(null);
  },[previewDoc]);

  const value = GetDecryptedValue(data?.[field?.[fieldKey]],isdecrypt);
  const phoneCode = GetDecryptedValue(data?.phoneCode,isdecrypt || '');
  const ukShortCode = GetDecryptedValue(data?.ukShortCode,isdecrypt || '');

    const renderDate = useCallback((dateValue) => {
    const date = moment(dateValue, ["M/D/YYYY h:mm:ss A", "DD/MM/YYYY"]);
    if (date.isValid()) {
      return date.format("DD/MM/YYYY");
    }
    return (dateValue || '--');
  }, []);

  
  if (!value){
    return <>--</>;
  }
  else if (field?.label === 'Phone') {
    return (
      <>
        {phoneCode} {value}
      </>
    );
  }else if(field?.label === "UK SortCode" && ukShortCode){
    return (
      <>
        {ukShortCode}
      </>
    );
  }



  const renderImagePreview = () => {
    const displayText = (() => {
      if (field.dataType === "object" && value?.name) return value.name;
      if (typeof value === "string") return `${value.slice(0, 7)}...${value.slice(-4)}`;
      return "";
    })();

    const previewUrl =
      field.dataType === "object" && value?.url ? value.url : value;

    return (
      <>
        <button
          className="btn-plane text-link cursor-pointer text-right"
          onClick={() => setPreviewDoc(previewUrl)}
        >
          <span className="inline-block text-right">{displayText}</span>
        </button>
        <PreviewModal
          isVisible={!!previewDoc}
          onClose={handlePreviewClose}
          fileUrl={previewDoc}
        />
      </>
    );
  };

  switch (field.type || field.label) {
  case 'Date Of Birth':
  case 'date':
    return <>{renderDate(value)}</>;
  case 'image':
    return renderImagePreview();
  default:
    return <>{value}</>;
}
});
const DetailKpi = React.memo(({ fields, data, labelKey = 'label', fieldKey = 'field', onPreview }) => (
  <>
    {fields?.map((field) => {
      if (field?.label === 'Reason' && data?.whiteListState !== 'Rejected') {
        return null;
      }
      if (field?.label === 'UK SortCode' && !data?.ukShortCode) {
        return null;
      }
      const reasonStyle = field?.label === 'Reason' ? { color: 'red' } : {};
      return (
        <div key={field?.[fieldKey]} className="summary-list-item customsummary-list-item">
          <div className="summary-label !font-normal" style={{ flex: '0 180px',...reasonStyle }}>
            {field?.[labelKey]}
          </div>
          <div className={`summary-text text-right preview-img ${(field?.key === 'bankDocumentNumber' || field?.field === 'documentNumber')?'uppercase':'capitalize'}`}>
            <FormattedField data={data} field={field} fieldKey={fieldKey}  isdecrypt={field?.isdecrypt} onPreview={onPreview}/>
          </div>
        </div>
      );
    })}
  </>
));

const Details = ({ data }) => {

  const [paymentTypes, setPaymentTypes] = useState({ loading: true, data: null, error: '' })
  const fetchPaymentFields = useCallback(async () => {
    setPaymentTypes({ loading: true, data: null, error: '' })
    try {
      setPaymentTypes({ loading: false, data: await getPaymentFields(data.currency), error: '' })
    } catch (error) {
      setPaymentTypes({ loading: false, data: null, error: error.message })
    }
  }, [])
  useEffect(() => {
     data.currency && fetchPaymentFields()
  },[data.currency, fetchPaymentFields]);

  const paymentFields = Object.keys(data?.paymentInfo || {}).map(key => ({
  label: key
}));
  const decryptedPaymentInfo = { ...data?.paymentInfo }; // Create a copy
  if (decryptedPaymentInfo.accountNumber) { // Or whatever the actual field name is
    decryptedPaymentInfo.accountNumber = decryptAES(decryptedPaymentInfo.accountNumber);
  }
  const addressFields = useMemo(() => {
    const fieldsToDecrypt = ['Postal Code'];
    return Object.keys(data?.addressDetails || {}).map(key => ({
      label: key,
      isdecrypt: fieldsToDecrypt.includes(key),
    }));
  }, [data?.addressDetails]);
  const recipientFields = useMemo(() => {
    const fieldsToDecrypt = ['Email','Phone Number'];
    return Object.keys(data?.recipientDetails || {}).map(key => ({
      label: key,
      isdecrypt: fieldsToDecrypt.includes(key),
    }));
  }, [data?.recipientDetails]);
  const kycKybFields = useMemo(() => {
    const detailsObj = data?.kycDetails;

    if (!detailsObj) return [];

    return Object.keys(detailsObj).map((key) => {
      if (key === "Front Image" || key === "Back Image") {
        return {
          label: key,
          field: key,
          type: "image",
          dataType: "object",
        };
      }
      return { label: key };
    });
  }, [data?.recipientDetails, data?.kycDetails]);

  return (
    
    <div className="">
      <div className='payee-summary-bank'>
        <div className="trans-card !w-full  md:!w-[465PX]">
          <h1
            className="text-xl text-titleColor font-semibold capitalize" 
          >
            Recipient
          </h1>
          <div className="summary m-0 p-2 md:p-0">
            <DetailKpi data={data?.recipientDetails} fields={recipientFields} className="!px-0" labelKey="label" fieldKey="label"/>
          </div>
        </div>
      </div>
      <div>
        <div className='payee-summary-bank'>
          <div className="trans-card !w-full  md:!w-[465px]">
            <div className="summary m-0 p-2 md:p-0">
              <DetailKpi data={data?.addressDetails} fields={addressFields} labelKey="label" fieldKey="label" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className='payee-summary-bank'>
          <div className="trans-card !w-full  md:!w-[465PX]">
            <h1
              className="mt-4 text-xl text-titleColor font-semibold capitalize"
            >
              Bank Account
            </h1>
            <div className="summary m-0 p-2 md:p-0">
              {paymentTypes?.error && !paymentTypes?.loading && <div className="alert-flex">
                <AppAlert
                  type="error"
                  description={paymentTypes.error}
                  showIcon
                />
              </div>}
              <DetailKpi data={decryptedPaymentInfo} fields={paymentFields} labelKey="label" fieldKey="label"/>
            </div>
          </div>
        </div>
      </div>
      {data?.stableCoinPayout &&<div>
        <div className='payee-summary-bank'>
          <div className="trans-card !w-full  md:!w-[465PX]">
            <h1
              className="mt-4 text-xl text-titleColor font-semibold capitalize"
            >
              Additional Info
            </h1>
            <div className="summary m-0 p-2 md:p-0">
              <DetailKpi data={data?.kycDetails} fields={kycKybFields} labelKey="label" fieldKey="label"/>
            </div>
          </div>
        </div>
      </div>}
       {data?.providerDetails && Object.keys(data?.providerDetails)?.length > 0 && ( 
        <div className='payee-summary-bank'>
          {Object.entries(data?.providerDetails)?.map(([key, value]) => (
          <div className="trans-card !w-full md:!w-[465PX]" key={key}>
            <div className="!items-start mt-2">
              <div className="p-3 border border-StrokeColor rounded-5">
                <div className="summary-label !font-bold" style={{ flex: '0 180px' }}>
                {key}
              </div>
              <div className="summary-text">
                {value}
              </div>
              </div>
            </div>
          </div>
          ))}
        </div>
       )} 
      {data?.note &&
        <div className='payee-summary-bank'>
          <div className="trans-card !w-full md:!w-[465PX]">
            <div className="!items-start mt-2">
              <div className="p-3 border border-StrokeColor rounded-5">
                <div className="summary-label !font-bold" style={{ flex: '0 180px' }}>
                Note:
              </div>
              <div className="summary-text">
                {data.note || '--'}
              </div>
              </div>
            </div>
          </div>
        </div>
      }
     
      {data?.rejectReason && (
        <div className='payee-summary-bank'>
          <div className="trans-card !w-full md:!w-[465PX]">
            <div className="summary-list-item customsummary-list-item">
              <div className="summary-label !font-normal" style={{ flex: '0 180px' }}>
                Reason
              </div>
              <div className="summary-text text-right" style={{ color: 'red' }}>
                {data.rejectReason || '--'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default React.memo(Details);
