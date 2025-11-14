
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Form,Image} from 'antd';
import { connect } from 'react-redux';
import {NumericFormat} from 'react-number-format';
import { getKycSampleUrls } from '../httpServices';
import { successToaster } from '../../../core/shared/toasters';
import FileUpload from '../../../core/shared/file.upload';
import { deriveErrorMessage } from '../../../core/shared/deriveErrorMessage';
import { useTranslation } from 'react-i18next';
import { alphaNumWithUnderscore } from '../../../core/shared/validations';

const QuickLink = ({form,envelopeNoRequired,fileLists,setFileLists,additionalDocforActiveCard,setErrorMessage,previewImages, setPreviewImages}) => {
  const[sampleUrls,setSampleUrls] = useState(null);
  const[isviewOpen, setIsviewOpen] = useState(false);
  const[imageurl, setImageurl] = useState(null);
  const customInput = useCallback((inputProps) => <input {...inputProps} />, []);
  const { t } = useTranslation();
  useEffect(() =>{
    // as of now we are not using this API, but we can use it in future if required. // NOSONAR
    // getSampleUrls(); // NOSONAR
  },[])

  const getSampleUrls = async () => { // NOSONAR
    await getKycSampleUrls((response)=>setSampleUrls(response), setErrorMessage);
}
 

  const handleUploadChange = useCallback((type, { fileList }) => {
    try{
      setErrorMessage(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const allowedExtensions = ["png", "jpg", "jpeg", "pdf"];
    if (fileList[0].size > MAX_FILE_SIZE) {
      setErrorMessage(t('cards.Messages.FILE_SIZE_EXCEEDS_LIMIT'));
      window.scrollTo(0,0);
        return;
    }
    const fileName = fileList[0].name;
    const fileNameParts = fileName.split('.');
    if(fileNameParts?.length > 2){
      setErrorMessage( t('cards.Messages.INVALID_DOUBLE_EXTENSION'))
        window.scrollTo(0,0);
        return;
     }
     const fileExtension = fileName.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setErrorMessage(t('cards.Messages.INVALID_FILE_EXTENSION'));
      window.scrollTo(0,0);
      return;
    }
    setFileLists({ ...fileLists, [type]: fileList });
    if (fileList?.length > 0) {
        form.setFields([
            {
                name: type,
                errors: [],
            },
        ]);
    }
    const latestFile = fileList[fileList?.length - 1];
    if(latestFile && latestFile.status ==='done') {
        successToaster({content : t('cards.Messages.UPLOAD_SUCCESS'),className : "custom-msg",duration : 3});
        const imageUrl = latestFile.response?.url || latestFile.response?.[0] || URL.createObjectURL(latestFile.originFileObj);
        form.setFieldsValue({ [type]: imageUrl });
        setFileLists({ ...fileLists,
          [type]: [...fileList],
      });
      setPreviewImages((prevImages) => ({ ...prevImages, [type]: imageUrl }));
    }
    }catch(error){
      setErrorMessage(deriveErrorMessage(error));
    }
  },[fileLists,form,previewImages,t]);
const handleRemove = useCallback((type) =>{
  form.setFieldsValue({ [type]: null });
  setFileLists({ ...fileLists, 
    [type]: [],
});
setPreviewImages((prevImages) => ({ ...prevImages, [type]: "" }));
},[form,fileLists,previewImages]);
const viewImage = (type) => {
  let _url = sampleUrls[type];
  setIsviewOpen(true);
  setImageurl(_url)
};
const handleCancel = useCallback(() =>{
  setIsviewOpen(false);
  setImageurl(null)
},[isviewOpen,imageurl]);
  return (<>  
        <div className="grid md:grid-cols-2 gap-6 basicinfo-form panel-form-items-bg mt-5">
          <div>
            <Form.Item
              className="mb-0"
              name="linkcardnumber"
              label={t('cards.applyCards.Link_Card_Number')}
              rules={[{ required: true, message: t('cards.Is_required') }, { min: 16, max: 16, message: t('cards.applyCards.Link_Card_Number_Validation') }]}
              colon={false}
            >
              <NumericFormat
                className="custom-input-field outline-0"
                placeholder={t('cards.applyCards.Link_Card_Number')}
                maxLength={16}
                thousandSeparator={false}
                allowNegative={false}
                customInput={customInput}
              />
            </Form.Item>
          </div>
          {envelopeNoRequired && (<> <div>
            <Form.Item
              className="mb-0"
              name="envelopenumber"
              label={t('cards.applyCards.Member_Number')}
              rules={[{ required: true, message: t('cards.Is_required') }, {
                validator: (_, value) => {
                  if (
                    value &&
                    !alphaNumWithUnderscore.test(value)
                  ) {
                    return Promise.reject(
                      t('cards.applyCards.Member_Number_Validation')
                    );
                  } else {
                    return Promise.resolve();
                  }
                },
              }]}
              colon={false}
            >
              <input
                className="custom-input-field outline-0"
                placeholder={t('cards.applyCards.Member_Number')}
                type="input"
                maxLength={6}
              />
            </Form.Item>
          </div></>)}
          {additionalDocforActiveCard && (<div className='col-span-2'>
            <Form.Item name={"handHoldingIdPhoto"}
              className="mb-0"
              rules={[{ required: true, message: t('cards.Is_required') }]}

            >
              <div className="flex itemsn-center justify-between mb-1 gap-4"> <p className="ant-form-item-required mb-0">{additionalDocforActiveCard} (2MB) <span className="text-requiredRed">*</span></p>{sampleUrls?.atmHoldingIdPhoto && <a className="m-0 !text-sm !font-medium !text-primaryColor" onClick={() => viewImage('atmHoldingIdPhoto')}>{t('cards.applyCards.View_Sample_Image')}</a>}</div>
               <FileUpload
                    name="handHoldingIdPhoto"
                    fileList={fileLists.handHoldingIdPhoto}
                    previewImage={previewImages.handHoldingIdPhoto}
                    handleUploadChange={handleUploadChange}
                    handleRemoveImage={handleRemove}
                    isImagesOnly={true}
                />
            </Form.Item>
          </div>)}
        </div>
    <Modal
      visible={isviewOpen}
      closable={true}
      onCancel={handleCancel}
      centered
      title={<h1 className='text-2xl text-titleColor font-semibold'>{t('cards.applyCards.Preview')} </h1>}
      destroyOnClose
      footer={false}
      closeIcon={<button onClick={handleCancel}><span className="icon lg close cursor-pointer" title="close"></span></button>}
      maskStyle={{ backdropFilter: 'blur(5px)' ,display:"block"}}
                mask={true}
                wrapClassName='image-preview-modal'
        >
          
          <div className='modal-wcontent text-center'>
            <Image src={imageurl} alt="" preview={false} className="custom-preview-image" />
            <div className='flex items-center justify-end'>          
            <Button block className="outlined-btn payee-popup pop-btn mt-16" onClick={ handleCancel}>{t('cards.applyCards.close')}</Button>
            </div>
          </div>
    </Modal>
  </>)
}
const connectStateToProps = ({ userConfig }) => {
  return { user: userConfig.details };
};
export default connect(connectStateToProps)(QuickLink)