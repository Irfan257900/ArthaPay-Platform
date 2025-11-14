import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import PayeeFormInput from '../formInput';
import { documentNumberRegex, replaceExtraSpaces, validations } from '../../../core/shared/validations';
import { Input, Select } from 'antd';
import PreviewModal from '../../../core/shared/preview.model';
import FileUpload from '../../../core/shared/file.upload';
import { getKycSampleUrls } from '../http.services';

const { requiredValidator, regexValidator, businessRegNoValidator } = validations
const acceptImagesOf = ['png', 'jpeg', 'jpg']
const isValidFile = (file) => acceptImagesOf.includes(file.extension)
const AdditionalInfo = forwardRef(({ FormInstance, form, setField, setError, lookups, initialData, mode ,props}, ref) => {
    const [previewDoc, setPreviewDoc] = useState(null)
    const [docs, setDocs] = useState({ frontImage: [], backImage: [] })
    const [previewImages, setPreviewImages] = useState({
        frontImage: "",
        backImage: "",
      });
    const [isviewOpen, setIsViewOpen] = useState(false);
    const [imageurl, setImageUrl] = useState(null);
    const [sampleUrls, setSampleUrls] = useState(null);
    const hasFetched = React.useRef(false);
    useEffect(() => {
        if (!hasFetched.current) {
            getKycSampleImageUrls();
            hasFetched.current = true;
        }
    }, []);
    useEffect(() => {
        if (initialData && mode !== 'add') {
            setDocs({ frontImage: [initialData.frontImage ||{}], backImage: [initialData.backImage ||{}] })
            setPreviewImages({ frontImage: initialData.frontImage?.url, backImage: initialData.backImage?.url });
        }
    }, [initialData, mode])
    useImperativeHandle(ref, () => ({
        resetDocs: () => {
            setDocs({ frontImage: [], backImage: [] });
            setPreviewImages({ frontImage: "", backImage: "" });
            setField("frontImage", null);
            setField("backImage", null);
        }
    }));
    const onPreviewClose = useCallback(() => {
        setPreviewDoc(null)
    }, []);

    const handleImageChange = useCallback((field, { file }) => {
        const fileExtension = file.name?.split('.').pop();
        if (file.status === 'removed') {
            removeImage(field);
            return;
        }
        const isValid = isValidFile({ extension: fileExtension })
        const isSizeValid = file.size <= 2 * 1024 * 1024;
        if (!isValid) {
            setError?.(`Uploaded File is not allowed! Only ${acceptImagesOf.join(', ')} are allowed`)
            return;
        }
        else if (!isSizeValid) {
            setError?.(`File size cannot exceed 2MB.`)
            return;
        }
        else if (file.status === 'uploading' || file.status === 'done') {
            setDocs((prev) => ({ ...prev, [field]: [file] }))
            const dataToUpdate = { name: file.name, url: file?.response?.[0] || '' }
            setField(field, dataToUpdate)
            setPreviewImages((prevImages) => ({ ...prevImages, [field]: file?.response?.[0] }));
            return;
        }
        window.scrollTo(0, 0)
        removeImage(field)
    }, [acceptImagesOf,docs,setField,previewImages]);
    const removeImage = useCallback((field) => {
        setField(field, undefined)
        setDocs((prev) => ({ ...prev, [field]: [] }));
        setPreviewImages((prevImages) => ({ ...prevImages, [field]: "" }));
    }, [previewImages,setField,docs]);
    const onTypeChange = (field, value) => {
        const initialValue = initialData?.[field]
        const isSameAsCurrent = initialValue === value
        const setImages = (isCurrent) => {
            // if (isCurrent) {
            //     form.setFieldsValue({ ...form.getFieldsValue(true), frontImage: initialData?.frontImage, backImage: initialData?.backImage, documentNumber: initialData?.documentNumber })
            //     setDocs({ frontImage: [initialData?.frontImage], backImage: [initialData?.backImage] })
            //     setPreviewImages({ frontImage: initialData.frontImage?.url, backImage: initialData.backImage?.url });
            // } else {
                form.resetFields(['frontImage', 'backImage', 'documentNumber'])
                setDocs({ frontImage: [], backImage: [] })
                setPreviewImages({ frontImage:'', backImage: '' });

            // }
        }
        switch (field) {
            case 'businessType': isSameAsCurrent ? form.setFieldsValue({ ...form.getFieldsValue(true), businessRegistrationNo: initialData.businessRegistrationNo }) : form.resetFields(['businessRegistrationNo'])
                break;
            case 'documentType': isSameAsCurrent ? setImages(true) : setImages(false)
                break;
            default: break;
        }
        setField(field, value)
    }

    const getKycSampleImageUrls=()=>{
        getKycSampleUrls(setSampleUrls)
    }
    const viewImage = (type) => {
        let _url = sampleUrls[type];
         setIsViewOpen(true);
         setImageUrl(_url)
      };
      const handleCancel = useCallback(() =>{
        setIsViewOpen(false);
        setImageUrl(null)
    },[]);
    const handleDocumentTypeChange = useCallback((value) => {
        onTypeChange("documentType", value);
    },[onTypeChange]);
    const handleBusinessTypeChange = useCallback((value) => {
        onTypeChange("businessType", value);
    },[onTypeChange]);
    const handleBlur = useCallback((e) => {
        setField(e.target.id, replaceExtraSpaces(e.target.value));
    },[setField]);
    const handleChange = useCallback((e) => {
        setField(e.target.id, e.target.value);
    },[setField] );
    const normalizeFile = useCallback(({ file }) => {
        return { name: file.name, url: file.response?.[0] || '' };
    }, []);
    const shouldUpdate = useCallback((prevValues, currValues) => prevValues.accountTypeDetails !== currValues.accountTypeDetails,[]);
   
    return (
        <div className='custom-form-card'>
            <PayeeFormInput>
                <FormInstance.Item shouldUpdate={shouldUpdate} className='mb-2.5'>
                    {({ getFieldValue }) => (
                        <>
                            {getFieldValue('accountTypeDetails') === 'personal' &&
                                <>
                                <h1 className="text-xl font-semibold mb-3 text-titleColor mt-2 capitalize">
                                    Additional Info
                                </h1>
                                <div className={`${props?.IsOnTheGo
                                    ? "flex-1 space-y-5 basicinfo-form"
                                    : "grid xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 gap-4 basicinfo-form"
                                    }`}>
                                        <PayeeFormInput
                                            isRequired={true}
                                            label={"Document Type"}
                                        >
                                            <FormInstance.Item
                                                name="documentType"
                                                className="text-left !mb-0"
                                                rules={[
                                                    requiredValidator(),
                                                ]}
                                            >
                                                <Select
                                                    className=""
                                                    placeholder="Select Document Type"
                                                    onSelect={handleDocumentTypeChange}
                                                    fieldNames={{ label: 'name', value: 'code' }}
                                                    options={lookups.documentTypes || []}
                                                />
                                            </FormInstance.Item>
                                        </PayeeFormInput>
                                        <PayeeFormInput
                                            isRequired={true}
                                            label={"Document Number"}
                                        >
                                            <FormInstance.Item
                                                name="documentNumber"
                                                rules={[requiredValidator(), regexValidator('document number', documentNumberRegex)]}
                                                className="mb-0"
                                                colon={false}
                                            >
                                                <Input
                                                    className="custom-input-field outline-0 uppercase placeholder:capitalize"
                                                    placeholder="Enter Document Number"
                                                    type="input"
                                                    autoComplete="off"
                                                    maxLength={20}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                />
                                            </FormInstance.Item>

                                        </PayeeFormInput>
                                    </div>
                                <div className={`${props?.IsOnTheGo
                                    ? "flex-1 space-y-5 basicinfo-form"
                                    : "grid xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 gap-6 basicinfo-form"
                                    }`}>
                                    <div className='md:mt-2 mt-4 custom-upload-file'> 
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-labelGrey text-sm font-normal ">
                                                Front Side<span className="text-requiredRed">*</span>
                                            </p>
                                            <p className='text-primaryColor cursor-pointer preview-image-mask'><a className="m-0" onClick={()=>viewImage('frontIDPhoto')}><span className='icon info-icon cursor-pointer'></span></a></p>
                                        </div>
                                        <FormInstance.Item
                                            name="frontImage"
                                            className="mb-0"
                                            rules={[
                                                requiredValidator(),
                                            ]}
                                            normalize={normalizeFile}
                                        >
                                            <FileUpload
                                                name="frontImage"
                                                fileList={docs?.frontImage}
                                                previewImage={previewImages?.frontImage}
                                                handleUploadChange={handleImageChange}
                                                handleRemoveImage={removeImage}
                                                isImagesOnly = {true}
                                            />
                                        </FormInstance.Item>
                                    </div>
                                    <div className="md:mt-2 mt-4">
                                        <div className='mb-1 flex justify-between items-center'>
                                            <p className="text-labelGrey text-sm font-normal">Back Side<span className="text-requiredRed">*</span></p>
                                            <p className='text-primaryColor cursor-pointer'><a className="m-0" onClick={()=>viewImage('backIDPhoto')}><span className='icon info-icon cursor-pointer'></span></a></p>
                                        </div>
                                        <FormInstance.Item
                                            name="backImage"
                                            className="text-left"
                                            rules={[
                                                requiredValidator(),
                                            ]}
                                            normalize={normalizeFile}
                                        >
                                             <FileUpload
                                                name="backImage"
                                                fileList={docs?.backImage}
                                                previewImage={previewImages?.backImage}
                                                handleUploadChange={handleImageChange}
                                                handleRemoveImage={removeImage}
                                                isImagesOnly = {true}
                                            />
                                        </FormInstance.Item>
                                    </div>
                                    </div>
                                </>}
                            {getFieldValue('accountTypeDetails') === 'business'&&
                            <>
                            <h1 className="text-xl font-semibold mb-6 text-titleColor mt-6 capitalize">
                                    Additional Info
                                </h1>
                                <div className={`${props?.IsOnTheGo
                                    ? "flex-1 space-y-5 basicinfo-form"
                                    : "grid md:grid-cols-2 gap-6 basicinfo-form"
                                    }`}>
                                    <PayeeFormInput
                                        isRequired={true}
                                        label={"Business Type"}
                                    >
                                        <FormInstance.Item
                                            name="businessType"
                                            className="mb-0 custom-select-float"
                                            rules={[
                                                requiredValidator()
                                            ]}
                                        >
                                            <Select
                                                className="p-0 rounded outline-0 w-full text-lightWhite"
                                                placeholder="Business Type"
                                                onSelect={handleBusinessTypeChange}
                                                fieldNames={{ label: 'name', value: 'code' }}
                                                options={lookups.businessTypes || []}
                                            />
                                        </FormInstance.Item>
                                    </PayeeFormInput>
                                    <PayeeFormInput
                                        isRequired={true}
                                        label={"Business Registration Number"}
                                    >
                                        <FormInstance.Item
                                            name="businessRegistrationNo"
                                            rules={[requiredValidator(), businessRegNoValidator()]}
                                            className="text-left payee-field p-relative payees-registration"
                                            colon={false}
                                        >
                                            <Input
                                                className="custom-input-field outline-0 uppercase "
                                                placeholder="Business Registration Number"
                                                type="input"
                                                autoComplete="off"
                                                maxLength={30}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </FormInstance.Item>

                                    </PayeeFormInput>
                                </div>
                                </>
                            }

                        </>
                    )}
                </FormInstance.Item>
            </PayeeFormInput>
            <PreviewModal isVisible={previewDoc !== null} onClose={onPreviewClose} fileUrl={previewDoc?.url}/>
            <PreviewModal isVisible={isviewOpen} onClose={handleCancel} fileUrl={imageurl}/>
        </div>
    )
});

export default AdditionalInfo