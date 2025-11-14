import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { payinLookup, payoutKycKybrequirements, payoutPersonalDetails, saveKycKybrequirements, setErrorMessages } from "../../reducers/payout.reducer";
import AddressSelection from "./address.selection";
import FileUpload from "../../../../core/shared/file.upload";
import { InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Form, Input, Select, Tooltip } from "antd";
import { decryptAES, encryptAES } from "../../../../core/shared/encrypt.decrypt";
import { renderField } from "../../../../core/onboarding/http.services";
import UbosOrDirectorsGrid from "./ubos.directors.payments";
import CustomButton from "../../../../core/button/button";
import PreviewModal from "../../../../core/shared/preview.model";
import { ALLOWED_EXTENSIONS, checkFileName, checkFileSize, checkValidExtension, fileValidations, MAX_FILE_SIZE, updateFileList } from "../../../../core/shared/fileUploadVerifications";
import AppDefaults from "../../../../utils/app.config";
import KycDetailsloader from "../../../../core/skeleton/kycDetails.loader";
import AppDatePicker from "../../../../core/shared/appDatePicker";
import { documentNumberRegex, replaceExtraSpaces, validateDOB, validations } from '../../../../core/shared/validations';
import moment from "moment";
import { fetchVaults, setIsSenderApproved } from "../payout.accordion.reducer";
const { requiredValidator } = validations;

const disabledIncorporationYears = (current) => {
    return current.year() < 1920;
};

const parseKycRequirements = (requirementString) => {
    if (!requirementString) return new Set();
    return new Set(requirementString.split(",").map((req) => req.trim()));
};

const type = "kyb";

const REQUIRED_FIELDS = {
    Ubo: [
        'firstName',
        'lastName',
        'dob',
        'phoneNumber',
        'email',
        'country',
        'docDetails.documentNumber',
        // 'docDetails.docExpiryDate',  
        'docDetails.documentFront',
        'docDetails.documentBack'
    ]
};

const PaymentsKycDetails = ({ hideWizard, handleSaveKyc }) => {
    const [form] = Form.useForm();
    const useDivRef = useRef(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [previewFile, setPreviewFile] = useState("");
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isPersonalDocPreFilled, setIsPersonalDocPreFilled] = useState(false);
    const [isDOBPreFilled, setIsDOBPreFilled] = useState(false);
    const [isDocNumberPreFilled, setIsDocNumberPreFilled] = useState(false);
    const [isDocPhotosPreFilled, setIsDocPhotosPreFilled] = useState(false);

    const [previewImages, setPreviewImages] = useState({
        frontImage: "",
        backDocImage: "",
        BusinessRegistrationProof: "",
        personalfrontImage: '',
        personalBackPhoto: ''
    });
    const [pdfPreview, setPdfPreview] = useState({
        frontImage: "",
        backDocImage: "",
        BusinessRegistrationProof: "",
        personalfrontImage: '',
        personalBackPhoto: ''
    });
    const [fileLists, setFileLists] = useState({
        frontImage: [],
        backDocImage: [],
        BusinessRegistrationProof: [],
        personalfrontImage: [],
        personalBackPhoto: []
    });

    // Selectors for Redux data
    const selectedCoin = useSelector((storeInfo) => storeInfo?.payoutAccordianReducer?.selectedCryptoCoin);
    const { loading, data, error } = useSelector((storeInfo) => storeInfo?.payoutReducer?.payoutKycKybrequirementsData);
    const { loading: saveKycLoading, data: saveKycData, error: saveKycError } = useSelector((storeInfo) => storeInfo?.payoutReducer?.saveKycKybrequirementsData);
    const { data: payoutDetailsPersonal } = useSelector((storeInfo) => storeInfo?.payoutReducer?.payoutPersonalDetails);
    const payinLookupData = useSelector((storeInfo) => storeInfo?.payoutReducer?.payinLookupData?.data);
    const Ubo = useSelector((store) => store.payoutReducer.uboBenficiaries);
    const userConfig = useSelector((store) => store.userConfig.details);

    const [kycrequirements, setKycRequirements] = useState({});
    const [requiredKycSections, setRequiredKycSections] = useState(new Set());
    const dispatch = useDispatch();
    console.log("payoutDetailsPersonal",payoutDetailsPersonal)


    // MODIFIED: Find the first matched document between kyb.documents and BusinessRegistrationProof (Case-Insensitive)
    const findBusinessRegistrationDocument = () => {
        if (!data?.kyb?.documents || !Array.isArray(data.kyb.documents) ||
            !payinLookupData?.BusinessRegistrationProof || !Array.isArray(payinLookupData.BusinessRegistrationProof)) {
            return null;
        }

        const matchedDoc = data?.kyb?.documents.find(doc =>
            payinLookupData.BusinessRegistrationProof.some(lookup =>
                // Case-insensitive comparison
                lookup.name.toLowerCase() === doc.type?.type?.toLowerCase()
            )
        );

        return matchedDoc || null;
    };

    // MODIFIED: Find the first matched document between kyb.documents and Documents (for Choose Document Type) (Case-Insensitive)
    const findDocumentTypeDocument = () => {
        if (!data?.kyb?.documents || !Array.isArray(data.kyb.documents) ||
            !payinLookupData?.Documents || !Array.isArray(payinLookupData.Documents)) {
            return null;
        }

        const matchedDoc = data.kyb.documents.find(doc =>
            payinLookupData.Documents.some(lookup =>
                // Case-insensitive comparison
                lookup.name.toLowerCase() === doc.type?.type?.toLowerCase()
            )
        );

        return matchedDoc || null;
    };


    const matchedBusinessRegistrationDoc = findBusinessRegistrationDocument();
    // Declare constant for Document Type
    const matchedDocumentTypeDoc = findDocumentTypeDocument();

    // MODIFIED: Effect to set dropdown and file on initial load (Business Registration Proof) (Case-Insensitive)
    useEffect(() => {
        if (matchedBusinessRegistrationDoc && payinLookupData?.BusinessRegistrationProof) {
            const docType = matchedBusinessRegistrationDoc.type?.type;
            const docUrl = matchedBusinessRegistrationDoc.type?.blob;

            const matchedLookup = payinLookupData.BusinessRegistrationProof.find(
                // Case-insensitive comparison
                lookup => lookup.name.toLowerCase() === docType?.toLowerCase()
            );
            if (matchedLookup) {
                form.setFieldsValue({
                    BusinessRegistration: matchedLookup.name
                });

                // Set file preview
                const file = {
                    uid: matchedBusinessRegistrationDoc.id,
                    name: matchedBusinessRegistrationDoc.fileName, // Use fileName from new structure
                    status: 'done',
                    url: docUrl,
                    response: [docUrl]
                };

                setFileLists(prev => ({
                    ...prev,
                    BusinessRegistrationProof: [file]
                }));

                if (docUrl?.toLowerCase().endsWith('.pdf')) {
                    setPdfPreview(prev => ({
                        ...prev,
                        BusinessRegistrationProof: docUrl
                    }));
                } else {
                    setPreviewImages(prev => ({
                        ...prev,
                        BusinessRegistrationProof: docUrl
                    }));
                }

                form.setFieldsValue({ BusinessRegistrationProof: docUrl });
            }
        }
    }, [matchedBusinessRegistrationDoc, payinLookupData?.BusinessRegistrationProof, form]);

    // MODIFIED: Effect to set dropdown and file on initial load (Document Type) (Case-Insensitive)
    useEffect(() => {
        if (matchedDocumentTypeDoc && payinLookupData?.Documents) {
            const docType = matchedDocumentTypeDoc.type?.type;
            const docUrl = matchedDocumentTypeDoc.type?.blob;

            const matchedLookup = payinLookupData.Documents.find(
                // Case-insensitive comparison
                lookup => lookup.name.toLowerCase() === docType?.toLowerCase()
            );
            if (matchedLookup) {
                form.setFieldsValue({
                    documentstype: matchedLookup.name
                });

                // Set file preview
                const file = {
                    uid: matchedDocumentTypeDoc.id,
                    name: matchedDocumentTypeDoc.fileName, // Use fileName from new structure
                    status: 'done',
                    url: docUrl,
                    response: [docUrl]
                };

                setFileLists(prev => ({
                    ...prev,
                    frontImage: [file] // Note the key is frontImage for Document Photo
                }));

                if (docUrl?.toLowerCase().endsWith('.pdf')) {
                    setPdfPreview(prev => ({
                        ...prev,
                        frontImage: docUrl // Note the key is frontImage
                    }));
                } else {
                    setPreviewImages(prev => ({
                        ...prev,
                        frontImage: docUrl // Note the key is frontImage
                    }));
                }

                form.setFieldsValue({ frontImage: docUrl }); // Note the key is frontImage
            }
        }
    }, [matchedDocumentTypeDoc, payinLookupData?.Documents, form]);

    // MODIFIED: Watch for dropdown changes and auto-fill file (Business Registration Proof) (Case-Insensitive)
    const selectedBusinessRegistration = Form.useWatch('BusinessRegistration', form);
    // Watch for dropdown changes and auto-fill file (Document Type)
    const selectedDocumentType = Form.useWatch('documentstype', form);

    useEffect(() => {
        if (!selectedBusinessRegistration || !data?.kyb?.documents?.length) return;
        // MODIFIED: Match against doc.type.type and use doc.type.blob for URL (Case-Insensitive)
        const matchedDoc = data.kyb.documents.find(doc =>
            // Case-insensitive comparison
            doc.type?.type?.toLowerCase() === selectedBusinessRegistration?.toLowerCase()
        );
        if (matchedDoc) {
            const docUrl = matchedDoc.type?.blob;
            const file = {
                uid: matchedDoc.id,
                name: matchedDoc.fileName, // Use fileName
                status: 'done',
                url: docUrl,
                response: [docUrl]
            };

            setFileLists(prev => ({
                ...prev,
                BusinessRegistrationProof: [file]
            }));

            if (docUrl?.toLowerCase().endsWith('.pdf')) {
                setPdfPreview(prev => ({
                    ...prev,
                    BusinessRegistrationProof: docUrl
                }));
            } else {
                setPreviewImages(prev => ({
                    ...prev,
                    BusinessRegistrationProof: docUrl
                }));
            }

            form.setFieldsValue({ BusinessRegistrationProof: docUrl });
        } else {
            // Clear if no match
            setFileLists(prev => ({ ...prev, BusinessRegistrationProof: [] }));
            setPreviewImages(prev => ({ ...prev, BusinessRegistrationProof: "" }));
            setPdfPreview(prev => ({ ...prev, BusinessRegistrationProof: "" }));
            form.setFieldsValue({ BusinessRegistrationProof: "" });
        }
    }, [selectedBusinessRegistration, data?.kyb?.documents, form]);

    // MODIFIED: Auto-fill logic for Document Type dropdown (Case-Insensitive)
    useEffect(() => {
        if (!selectedDocumentType || !data?.kyb?.documents?.length) return;
        // MODIFIED: Match against doc.type.type and use doc.type.blob for URL (Case-Insensitive)
        const matchedDoc = data.kyb.documents.find(doc =>
            // Case-insensitive comparison
            doc.type?.type?.toLowerCase() === selectedDocumentType?.toLowerCase()
        );
        if (matchedDoc) {
            const docUrl = matchedDoc.type?.blob;
            const file = {
                uid: matchedDoc.id,
                name: matchedDoc.fileName, // Use fileName
                status: 'done',
                url: docUrl,
                response: [docUrl]
            };

            setFileLists(prev => ({
                ...prev,
                frontImage: [file] // Note the key is frontImage
            }));

            if (docUrl?.toLowerCase().endsWith('.pdf')) {
                setPdfPreview(prev => ({
                    ...prev,
                    frontImage: docUrl // Note the key is frontImage
                }));
            } else {
                setPreviewImages(prev => ({
                    ...prev,
                    frontImage: docUrl // Note the key is frontImage
                }));
            }

            form.setFieldsValue({ frontImage: docUrl }); // Note the key is frontImage
        } else {
            // Clear if no match
            setFileLists(prev => ({ ...prev, frontImage: [] })); // Note the key is frontImage
            setPreviewImages(prev => ({ ...prev, frontImage: "" })); // Note the key is frontImage
            setPdfPreview(prev => ({ ...prev, frontImage: "" })); // Note the key is frontImage
            form.setFieldsValue({ frontImage: "" }); // Note the key is frontImage
        }
    }, [selectedDocumentType, data?.kyb?.documents, form]);

    // MODIFIED: Effect to pre-fill personal document data for KYC flow AND disable fields
    useEffect(() => {
        // ADDED CONDITION: Only proceed if "Passport" is required for non-Business accounts
        if (userConfig?.accountType !== "Business" && payoutDetailsPersonal && requiredKycSections.has("Passport") && payoutDetailsPersonal?.sections?.IdentificationDocuments?.[0]?.documentType?.toLowerCase() === 'passport') {

            // Extract document details
            const identificationDocs = payoutDetailsPersonal.sections?.IdentificationDocuments;
            const doc = identificationDocs?.length > 0 ? identificationDocs[0] : {};
            const { documentNumber, frontDoc, backDoc } = doc;

            // Extract Date of Birth
            const dobString = payoutDetailsPersonal?.sections?.PersonalInformation?.dateOfBirth || payoutDetailsPersonal?.dob;

            // 1. DOB Disabling Logic
            // if (dobString) {
            //     setIsDOBPreFilled(true);
            // } else {
            //     setIsDOBPreFilled(false);
            // }

            // 2. Document Number Disabling Logic
            // if (documentNumber) {
            //     setIsDocNumberPreFilled(true);
            // } else {
            //     setIsDocNumberPreFilled(false);
            // }

            // 3. Document Photos Disabling Logic
            // if (frontDoc || backDoc) {
            //     setIsDocPhotosPreFilled(true);
            // } else {
            //     setIsDocPhotosPreFilled(false);
            // }

            // For backward compatibility/consistency, you might still set this if any document is pre-filled,
            // but it's no longer used for specific field disabling.
            // if (documentNumber || frontDoc || backDoc) {
            //     setIsPersonalDocPreFilled(true);
            // } else {
            //     setIsPersonalDocPreFilled(false);
            // }


            // 1. Set Document Number
            form.setFieldsValue({ personalDocumentNumber: documentNumber });

            // 2. Set Date of Birth
            if (dobString) {
                form.setFieldsValue({ dob: moment(dobString) });
            }

            // 3. Set Front Document
            if (frontDoc) {
                const frontFile = {
                    uid: 'personal-front',
                    name: 'Front ID Photo',
                    status: 'done',
                    url: frontDoc,
                    response: [frontDoc]
                };

                setFileLists(prev => ({ ...prev, personalfrontImage: [frontFile] }));

                if (frontDoc.toLowerCase().endsWith('.pdf')) {
                    setPdfPreview(prev => ({ ...prev, personalfrontImage: frontDoc }));
                } else {
                    setPreviewImages(prev => ({ ...prev, personalfrontImage: frontDoc }));
                }
                form.setFieldsValue({ personalfrontImage: frontDoc });
            }

            // 4. Set Back Document
            if (backDoc) {
                const backFile = {
                    uid: 'personal-back',
                    name: 'Back ID Photo',
                    status: 'done',
                    url: backDoc,
                    response: [backDoc]
                };

                setFileLists(prev => ({ ...prev, personalBackPhoto: [backFile] }));

                if (backDoc.toLowerCase().endsWith('.pdf')) {
                    setPdfPreview(prev => ({ ...prev, personalBackPhoto: backDoc }));
                } else {
                    setPreviewImages(prev => ({ ...prev, personalBackPhoto: backDoc }));
                }
                form.setFieldsValue({ personalBackPhoto: backDoc });
            }
        }
    }, [payoutDetailsPersonal, userConfig, form, requiredKycSections]); // Added requiredKycSections dependency

    // ... (handleFilePreview, handleSelectedAddress, removeImage, handleClosePreview, handlePreview, onDownload, useEffects for dispatch and state updates, handleScrollTop, validateBeneficiaries, onSuccess, clearErrorMessage, handleUploadChange, handleAddressError, setField, incorporationDateChange, registrationNumberChange remain unchanged)


    const handleFilePreview = useCallback((fileList, type) => {
        const latestFile = fileList[fileList.length - 1];
        if (latestFile?.status === "done") {
            if (latestFile.type?.startsWith("image/")) {
                const imageUrl =
                    latestFile?.response?.[0] || URL.createObjectURL(latestFile?.originFileObj);
                form.setFieldsValue({ [type]: imageUrl });
                setPreviewImages((prevImages) => ({ ...prevImages, [type]: imageUrl }));
            } else if (latestFile.type === "application/pdf") {
                const pdfUrl =
                    latestFile?.response?.[0] || URL.createObjectURL(latestFile?.originFileObj);
                setPdfPreview((prev) => ({ ...prev, [type]: pdfUrl }));
                form.setFieldsValue({ [type]: pdfUrl });
                setPreviewImages((prevImages) => ({ ...prevImages, [type]: pdfUrl }));
            }
        } else if (latestFile?.status === "error") {
            setErrorMsg("Upload failed. Please try again.");
        }
    }, [form]);

    const handleSelectedAddress = useCallback((addr) => {
        setSelectedAddress(addr);
    }, []);

    const removeImage = useCallback(
        (type) => {
            setFileLists((prev) => ({ ...prev, [type]: [] }));
            setPreviewImages((prev) => ({ ...prev, [type]: "" }));
            setPdfPreview((prev) => ({ ...prev, [type]: "" }));
            form.setFieldsValue({ [type]: "" });
        },
        [form]
    );

    const handleClosePreview = useCallback(() => {
        setIsPreviewVisible(false);
        setPreviewFile("");
    }, []);

    const handlePreview = useCallback((file) => {
        const fileUrl = file.url || file.thumbUrl || file.response?.url;
        if (fileUrl) {
            setPreviewFile(fileUrl);
            setIsPreviewVisible(true);
        } else {
            console.error("Preview URL is not available.");
        }
    }, []);

    const onDownload = useCallback((file) => {
        const fileUrl = file.url || file.response?.url;
        if (fileUrl) {
            window.open(fileUrl, "_self");
        } else {
            console.error("Download URL is not available.");
        }
    }, []);

    useEffect(() => {
        dispatch(payoutKycKybrequirements({ productId: selectedCoin?.productId }));
        dispatch(payinLookup());
        if (userConfig?.accountType !== "Business") {
            dispatch(payoutPersonalDetails());
        }
    }, [selectedCoin, userConfig, dispatch]);

    useEffect(() => {
        if (data) {
            userConfig?.accountType !== "Business" ? setKycRequirements(data?.kyc) : setKycRequirements(data?.kyb);
        }
    }, [data, userConfig]);

    useEffect(() => {
        if (data && data?.kyb?.kybpfc) {
            form.setFieldsValue({
                identificationNumber: data?.kyb?.kybpfc?.identificationNumber || "",
                registrationDate: data?.kyb?.kybpfc?.registrationDate ? moment(data?.kyb?.kybpfc?.registrationDate) : null,
                businessTypes: data?.kyb?.kybpfc?.businessType || undefined,
            });
        }
    }, [data, form]);

    useEffect(() => {
        if (kycrequirements) {
            const requirements = parseKycRequirements(kycrequirements?.requirement);
            setRequiredKycSections(requirements);
        }
    }, [kycrequirements]);

    const isSectionRequired = useCallback(
        (sectionCode) => {
            return requiredKycSections?.has(sectionCode);
        },
        [requiredKycSections]
    );

    const handleScrollTop = useCallback(() => {
        if (useDivRef.current) {
            useDivRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    const validateBeneficiaries = (beneficiaries, position) => {
        if (!beneficiaries || beneficiaries.length === 0) {
            return `Please add at least one ${position} to proceed.`;
        }
        const requiredFields = REQUIRED_FIELDS[position];
        for (const beneficiary of beneficiaries) {
            const missingFields = [];
            for (const field of requiredFields) {
                const keys = field.split('.');
                let value = beneficiary;
                let found = true;
                for (const key of keys) {
                    if (value === null || typeof value !== 'object' || !(key in value)) {
                        found = false;
                        break;
                    }
                    value = value[key];
                }
                if (!found || value === null || value === '') {
                    missingFields.push(field);
                }
            }
            if (missingFields.length > 0) {
                const formattedFields = missingFields.map(f => `'${f.replace('docDetails.', '')}'`).join(', ');
                return `Required fields for a ${position}: ${formattedFields}. Please complete all required information.`;
            }
        }
        return null;
    };

    const onSuccess = async () => {
        await handleSaveKyc();
        dispatch(setIsSenderApproved('Pending'));
    };

    const handlePayWithWallet = useCallback(async () => {
        debugger
        let documentTypeForPersonal;
        if (isSectionRequired("NATIONAL_ID")) {
            documentTypeForPersonal = "NATIONAL_ID"
        } else if (isSectionRequired("ID_CARD")) {
            documentTypeForPersonal = "ID_CARD"
        } else {
            documentTypeForPersonal = isSectionRequired("Passport") && 'passport';
        }
        try {
            await form.validateFields();
            const values = form.getFieldsValue(true);
            if (isSectionRequired("Address") && !selectedAddress) {
                setErrorMsg("Please select an address.");
                handleScrollTop();
                return;
            }
            let submissionData;
            if (userConfig?.accountType === 'Business') {
                if (type === "kyb") {
                    if (isSectionRequired("UBO")) {
                        const uboError = validateBeneficiaries(Ubo, 'Ubo');
                        if (uboError) {
                            setErrorMsg(uboError);
                            handleScrollTop();
                            return;
                        }

                        // NEW LOGIC: Validate total shareHolderPercentage for UBOs
                        const totalPercentage = Ubo.reduce((sum, ubo) => {
                            const percentage = parseFloat(ubo.shareHolderPercentage) || 0;
                            return sum + percentage;
                        }, 0);

                        if (totalPercentage !== 100) {
                            let errorMessage;
                            if (totalPercentage < 100) {
                                errorMessage = `The total shareholder percentage for UBOs is ${totalPercentage}%. It must be exactly 100%. Please adjust the share percentages.`;
                            } else {
                                errorMessage = `The total shareholder percentage for UBOs is ${totalPercentage}%. It cannot exceed 100%. Please adjust the share percentages.`;
                            }
                            setErrorMsg(errorMessage);
                            handleScrollTop();
                            return;
                        }
                    }
                }
                // MODIFIED: Document object structure for submission
                submissionData = {
                    kyb: {
                        requirement: kycrequirements?.requirement,
                        fullName: {
                            firstName: kycrequirements?.fullName?.businessName,
                            lastName: kycrequirements?.fullName?.businessName,
                            businessName: values?.BusinessName || kycrequirements?.fullName?.businessName,
                        },
                        basic: {
                            dob: kycrequirements?.basic?.dob,
                            email: kycrequirements?.basic?.email,
                            phoneCode: kycrequirements?.basic?.phoneCode,
                            phoneNo: kycrequirements?.basic?.phoneNo,
                        },
                        addressDto: {
                            addressId: selectedAddress || null,
                        },
                        ubo: Ubo,
                        kybpfc: {
                            businessType: values?.businessTypes,
                            identificationNumber: values?.identificationNumber,
                            registrationDate: values?.registrationDate
                                ? moment(values?.registrationDate).toISOString()
                                : null,
                        },
                        documents: [
                            {
                                id: AppDefaults.GUID_ID,
                                fileName: values?.documentstype,
                                type: {
                                    type: values?.documentstype,
                                    blob: values?.frontImage
                                },
                            },
                            {
                                id: AppDefaults.GUID_ID,
                                fileName: values?.BusinessRegistration,
                                type: {
                                    type: values?.BusinessRegistration,
                                    blob: values?.BusinessRegistrationProof
                                },
                            }
                        ]
                    }
                };
            } else {
                submissionData = {
                    kyc: {
                        requirement: kycrequirements?.requirement,
                        fullName: {
                            firstName: encryptAES(payoutDetailsPersonal?.sections?.PersonalInformation?.firstName),
                            lastName: encryptAES(payoutDetailsPersonal?.sections?.PersonalInformation?.lastName),
                        },
                        basic: {
                            dob: values?.dob ? moment(values.dob).toISOString() : payoutDetailsPersonal?.sections?.PersonalInformation?.dateOfBirth, // Use new DOB if available, otherwise existing
                            email: kycrequirements?.basic?.email,
                            phoneCode: kycrequirements?.basic?.phoneCode,
                            phoneNo: kycrequirements?.basic?.phoneNo,
                            occupation: values?.occupation
                        },
                        addressDto: {
                            addressId: selectedAddress || null,
                        },
                        kycpfc: {
                            documentType: documentTypeForPersonal,
                            documentNumber:  values?.personalDocumentNumber,
                            documentFront: isSectionRequired("DocFront") ?  values?.personalfrontImage : null,
                            documentBack: isSectionRequired("DocBack") ?  values?.personalBackPhoto : null,
                        }
                    }
                };
            }
            dispatch(saveKycKybrequirements({
                payload: submissionData,
                onSuccess: () => onSuccess()
            }));
            setErrorMsg(null);
        } catch (err) {
            setErrorMsg("Please ensure all required fields are filled out correctly before proceeding.");
            handleScrollTop();
        }
    }, [form, handleScrollTop, type, Ubo, selectedAddress, isPersonalDocPreFilled, payoutDetailsPersonal, isSectionRequired, userConfig, kycrequirements, dispatch, handleSaveKyc]);


    const clearErrorMessage = useCallback(() => {
        dispatch(setErrorMessages([
            { key: "payoutKycKybrequirementsData", message: "" },
            { key: "saveKycKybrequirementsData", message: "" }
        ]));
        setErrorMsg(null);
    }, [dispatch]);

    const handleUploadChange = useCallback(
        (type, { fileList }) => {
            // ... (existing file validation logic)
            setErrorMsg(null);
            const file = fileList[0]?.name || "";
            const fileExtension = file?.split(".").pop().toLowerCase();
            const isValidFileExtension = checkValidExtension(fileExtension, ALLOWED_EXTENSIONS);
            if (!isValidFileExtension) {
                setErrorMsg(fileValidations.fileExtension);
                handleScrollTop();
                return;
            }
            const isFileSizeValid = checkFileSize(fileList[0]?.size, MAX_FILE_SIZE);
            if (!isFileSizeValid) {
                setErrorMsg(fileValidations.fileSize);
                handleScrollTop();
                return;
            }
            const isValidFileName = checkFileName(fileList[0]?.name);
            if (!isValidFileName) {
                setErrorMsg(fileValidations.fileName);
                handleScrollTop();
                return;
            }
            const updatedFileList = updateFileList(fileList, type);
            setFileLists((prevFileLists) => ({
                ...prevFileLists,
                [type]: updatedFileList,
            }));
            handleFilePreview(fileList, type);
        },
        [handleScrollTop, handleFilePreview]
    );

    const handleAddressError = useCallback((msg) => setErrorMsg(msg), []);

    const setField = useCallback((event, isInputEvent = true) => {
        const {
            name: fieldName,
            value,
            checked,
        } = isInputEvent ? event.target : event;
        const valueToSet = event.type === "blur" && value ? replaceExtraSpaces(value) : value;
        errorMsg && setErrorMsg("");
        form.setFieldValue(fieldName, valueToSet);
    }, [form, errorMsg]);

    const incorporationDateChange = useCallback((value) => {
        setField({ name: 'registrationDate', value }, false);
    }, [setField]);

    const registrationNumberChange = useCallback((e) => {
        setField({ name: 'identificationNumber', value: e?.target?.value }, false);
    }, [setField]);

    const RegistrationDateLabel = (
        <>
            Registration Date
            <Tooltip className="c-pointer pl-2" title='Future dates not allowed'>
                <InfoCircleOutlined />
            </Tooltip>
        </>
    );

    return (
        <>
            {loading && <KycDetailsloader />}
            {!loading && <div className="text-secondaryColor h-full mt-6" ref={useDivRef}>
                {(error || saveKycError || errorMsg) && (
                    <div className="alert-flex">
                        <Alert
                            className="w-100 px-0 py-2"
                            type="warning"
                            description={error || saveKycError || errorMsg}
                            showIcon
                        />
                        <button
                            type="button"
                            className="icon sm alert-close"
                            onClick={() => clearErrorMessage()}
                        ></button>
                    </div>
                )}
                <Form form={form}>
                    {userConfig?.accountType !== "Business" ? (
                        <div className="mt-3 w-full flex-1 rounded-5 border-dbkpiStroke">
                            {isSectionRequired("FullName") ? (
                                <>
                                    <h3 className="text-2xl font-semibold text-titleColor mb-2">
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 custom-info">
                                        {isSectionRequired("FullName") && data?.kyc?.fullName?.firstName &&
                                            renderField("First Name", decryptAES(data?.kyc?.fullName?.firstName))}
                                        {isSectionRequired("FullName") && data?.kyc?.fullName?.lastName &&
                                            renderField("Last Name", decryptAES(data?.kyc?.fullName?.lastName))}
                                    </div>
                                </>
                            ) : null}
                            {isSectionRequired("Basic") ? (
                                <>
                                    <h3 className="text-2xl font-semibold text-titleColor mb-2 mt-5">
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {isSectionRequired("Basic") && data?.kyc?.basic?.email &&
                                            renderField("Email", decryptAES(data?.kyc?.basic?.email))}
                                        {isSectionRequired("Basic") && data?.kyc?.basic?.phoneNo &&
                                            renderField(
                                                "Phone Number",
                                                `${decryptAES(data?.kyc?.basic?.phoneCode)} ${decryptAES(data?.kyc?.basic?.phoneNo)}`
                                            )}
                                        {isSectionRequired("Basic") && data?.kyc?.basic?.country &&
                                            renderField("Country", data?.kyc?.basic?.country)}
                                        <Form.Item
                                            label="Select Occupation"
                                            name="occupation"
                                            className="custom-select-float mb-0"
                                            colon={false}
                                            rules={[
                                                { required: true, message: 'Is required' }
                                            ]}
                                        >
                                            <Select className="" placeholder="Select Occupation" allowClear>
                                                {payinLookupData?.Occupations?.map((item) => (
                                                    <Select.Option key={item.code} value={item.name}   >
                                                        {item.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            label="Date Of Birth"
                                            name="dob"
                                            rules={[
                                                { required: true, message: "Is required" },
                                                { validator: validateDOB },
                                            ]}
                                            className="custom-select-float mb-0"
                                        >
                                            <AppDatePicker
                                                format="DD/MM/YYYY"
                                                datesToDisable="futureAndCurrentDates"
                                                disabled={isDOBPreFilled}
                                            />
                                        </Form.Item>
                                    </div>
                                </>
                            ) : null}
                            <div className="mt-7 w-full rounded-5 border-dbkpiStroke mb-4">
                                <h3 className="text-2xl font-semibold text-titleColor mb-4">
                                    Documents Upload
                                    {/* <Tooltip title="Please upload clear and legible copies of your identification documents. Ensure that all details are visible and not obscured by glare or shadows.">
                                        <span className='icon bank-info ml-2'></span>
                                    </Tooltip> */}
                                </h3>
                                <div className="grid grid-cols-1 gap-5 ">
                                    {isSectionRequired("Passport") && <div className={`grid gap-6`}>
                                        <h1 className="text-lg text-subTextColor font-medium mb-1.5">Passport</h1>
                                    </div>}
                                    {isSectionRequired("NATIONAL_ID") && <div className={`grid gap-6`}>
                                        <h1 className="text-lg text-subTextColor font-medium mb-1.5">National ID</h1>
                                    </div>}
                                    {isSectionRequired("ID_CARD") && <div className={`grid gap-6`}>
                                        <h1 className="text-lg text-subTextColor font-medium mb-1.5">ID Card</h1>
                                    </div>}
                                    {isSectionRequired("DocumentNumber") && <div className="grid md:grid-cols-2 gap-5 ">
                                        <Form.Item
                                            className="custom-select-float mb-0"
                                            name="personalDocumentNumber"
                                            label={'Document Number'}
                                            required
                                            colon={false}
                                            rules={[
                                                { required: true, message: "is required" },
                                                { whitespace: true, message: "Invalid Document Number" },
                                                validations.regexValidator(
                                                    "document number",
                                                    documentNumberRegex
                                                ),
                                            ]}
                                        >
                                            <Input
                                                className="custom-input-field outline-0 uppercase placeholder:capitalize"
                                                placeholder={'Enter Document Number'}
                                                type="input"
                                                maxLength={30}
                                                // Disabled using the separate Document Number flag
                                                disabled={isDocNumberPreFilled}
                                            />
                                        </Form.Item>
                                    </div>}
                                    <div className="grid md:grid-cols-2 gap-5 ">
                                        {isSectionRequired("DocFront") && <Form.Item
                                            name="personalfrontImage"
                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                            rules={[{ required: isSectionRequired("DocFront"), message: "is required" }]}
                                        >
                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                    Front ID Photo <span className="text-requiredRed">*</span>
                                                </p>
                                            </div>
                                            <FileUpload
                                                name="personalfrontImage"
                                                fileList={fileLists.personalfrontImage}
                                                previewImage={previewImages.personalfrontImage || pdfPreview.personalfrontImage || (fileLists.personalfrontImage[0]?.url || '')}
                                                handleUploadChange={handleUploadChange}
                                                handleRemoveImage={isDocPhotosPreFilled ? null : removeImage}
                                                onPreview={handlePreview}
                                                onDownload={onDownload}
                                                disabled={isDocPhotosPreFilled}
                                            />
                                        </Form.Item>}
                                        {isSectionRequired("DocBack") && <Form.Item
                                            name="personalBackPhoto"
                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                            rules={[{ required: isSectionRequired("DocBack"), message: "is required" }]}
                                        >
                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                    Back ID Photo <span className="text-requiredRed">*</span>
                                                </p>
                                            </div>
                                            <FileUpload
                                                name="personalBackPhoto"
                                                fileList={fileLists.personalBackPhoto}
                                                previewImage={previewImages.personalBackPhoto || pdfPreview.personalBackPhoto || (fileLists.personalBackPhoto[0]?.url || '')}
                                                handleUploadChange={handleUploadChange}
                                                // Disabled using the separate Document Photos flag
                                                handleRemoveImage={isDocPhotosPreFilled ? null : removeImage}
                                                onPreview={handlePreview}
                                                onDownload={onDownload}
                                                // Disabled using the separate Document Photos flag
                                                disabled={isDocPhotosPreFilled}
                                            />
                                        </Form.Item>}
                                    </div>
                                </div>
                            </div>
                            {isSectionRequired("Address") && data && <AddressSelection form={form} Form={Form} isError={handleAddressError} selectedAddressData={handleSelectedAddress} />}
                        </div>
                    ) : (
                        <>
                            <div className="mt-0 w-full flex-1 rounded-5 border-dbkpiStroke">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-semibold text-titleColor mb-2.5">
                                        Company Information
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
                                    {isSectionRequired("FullName") && renderField('Business Name', decryptAES(kycrequirements?.fullName?.businessName))}
                                    {isSectionRequired("FullName") &&
                                        <>
                                            <Form.Item
                                                label="Enter Registration Number"
                                                name="identificationNumber"
                                                className="custom-select-float mb-0"
                                                colon={false}
                                                rules={[
                                                    { required: true, message: "is required" },
                                                    { whitespace: true, message: "Invalid Registration Number" },
                                                    validations.regexValidator(
                                                        "document number",
                                                        documentNumberRegex
                                                    ),
                                                ]}
                                            >
                                                <Input
                                                    className="custom-input-field outline-0 uppercase placeholder:capitalize"
                                                    placeholder={'Enter Registration Number'}
                                                    type="input"
                                                    maxLength={30}
                                                    onChange={registrationNumberChange}
                                                    disabled={data?.kyb?.kybpfc?.identificationNumber}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                className="custom-select-float mb-0"
                                                name="registrationDate"
                                                label={RegistrationDateLabel}
                                                colon={false}
                                                rules={[
                                                    requiredValidator(),
                                                    {
                                                        validator(_, value) {
                                                            if (!value) {
                                                                return Promise.resolve();
                                                            }
                                                            const formatted = moment(value).startOf("day").unix();
                                                            const current = moment().startOf("day").unix();
                                                            if (formatted > current) {
                                                                return Promise.reject(
                                                                    new Error('Registration date must be today or earlier.')
                                                                );
                                                            }
                                                            return Promise.resolve();
                                                        },
                                                    },
                                                ]}
                                            >
                                                <AppDatePicker onChange={incorporationDateChange} disableDates={disabledIncorporationYears} disabled={data?.kyb?.kybpfc?.registrationDate} />
                                            </Form.Item>
                                            <Form.Item
                                                label="Select Business type"
                                                name="businessTypes"
                                                className="custom-select-float mb-0"
                                                colon={false}
                                                rules={[
                                                    { required: true, message: 'Is required' }
                                                ]}
                                            >
                                                <Select className="" placeholder="Select Business Type" allowClear disabled={data?.kyb?.kybpfc?.businessType}>
                                                    {payinLookupData?.BusinessTypes?.map((item) => (
                                                        <Select.Option key={item.code} value={item.name}   >
                                                            {item.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </>
                                    }
                                </div>
                            </div>
                            {isSectionRequired("UBO") &&
                                <div className="mt-3">
                                    {data && <UbosOrDirectorsGrid setSelectionError={handleAddressError}
                                        apiData={data?.kyb?.ubo?.[0]}
                                    />}
                                </div>
                            }
                            {isSectionRequired("Documents") && data &&
                                <div className="mt-7 w-full rounded-5 border-dbkpiStroke mb-4">
                                    <h3 className="text-2xl font-semibold text-titleColor mb-4">
                                        Documents Upload
                                        <Tooltip title="Please upload clear and legible copies of your identification documents. Ensure that all details are visible and not obscured by glare or shadows.">
                                            <span className='icon bank-info ml-2'></span>
                                        </Tooltip>
                                    </h3>
                                    <div className="grid grid-cols-1 gap-5 ">
                                        <div className="grid md:grid-cols-2 gap-5 ">
                                            <Form.Item
                                                label="Select Document Type"
                                                name="documentstype"
                                                className="custom-select-float mb-0"
                                                colon={false}
                                                rules={[
                                                    { required: true, message: 'Is required' }
                                                ]}
                                            >
                                                <Select className="" placeholder="Select Document Type" allowClear>
                                                    {payinLookupData?.Documents?.map((item) => (
                                                        <Select.Option key={item.code} value={item.name}   >
                                                            {item.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                label="Select Business Registration Proof"
                                                name="BusinessRegistration"
                                                className="custom-select-float mb-0"
                                                colon={false}
                                                rules={[
                                                    { required: true, message: 'Is required' }
                                                ]}
                                            >
                                                <Select className="" placeholder="Select Business Registration Proof" allowClear>
                                                    {payinLookupData?.BusinessRegistrationProof?.map((item) => (
                                                        <Select.Option key={item.id} value={item.name}   >
                                                            {item.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-5 ">
                                            <Form.Item
                                                name="frontImage"
                                                className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                rules={[{ required: isSectionRequired("Documents"), message: "is required" }]}
                                            >
                                                <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                    <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                        Document Photo <span className="text-requiredRed">*</span>
                                                    </p>
                                                </div>
                                                <FileUpload
                                                    name="frontImage"
                                                    fileList={fileLists.frontImage}
                                                    previewImage={previewImages.frontImage || pdfPreview.frontImage || (fileLists.frontImage[0]?.url || '')}
                                                    handleUploadChange={handleUploadChange}
                                                    handleRemoveImage={removeImage}
                                                    onPreview={handlePreview}
                                                    onDownload={onDownload}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                name="BusinessRegistrationProof"
                                                className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                rules={[{ required: isSectionRequired("Documents"), message: "is required" }]}
                                            >
                                                <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                    <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                        Business Registration Proof <span className="text-requiredRed">*</span>
                                                    </p>
                                                </div>
                                                <FileUpload
                                                    name="BusinessRegistrationProof"
                                                    fileList={fileLists.BusinessRegistrationProof}
                                                    previewImage={previewImages.BusinessRegistrationProof || pdfPreview.BusinessRegistrationProof || (fileLists.BusinessRegistrationProof[0]?.url || '')}
                                                    handleUploadChange={handleUploadChange}
                                                    handleRemoveImage={removeImage}
                                                    onPreview={handlePreview}
                                                    onDownload={onDownload}
                                                />
                                            </Form.Item>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                        <div className="grid md:grid-cols-1 gap-2 ">
                                        </div>
                                    </div>
                                </div>
                            }
                            {isSectionRequired("Address") && data && <AddressSelection form={form} Form={Form} isError={handleAddressError} selectedAddressData={handleSelectedAddress} />}
                        </>
                    )}
                </Form >
                {data && <div className="mt-6 p-5 text-right">
                    <CustomButton
                        type="primary"
                        onClick={handlePayWithWallet}
                        className=""
                        loading={saveKycLoading}
                        disabled={saveKycLoading}
                    >
                        Submit
                    </CustomButton>
                </div>
                }
                <PreviewModal
                    isVisible={isPreviewVisible}
                    fileUrl={previewFile}
                    onClose={handleClosePreview}
                />
            </div >}
        </>
    );
};

export default PaymentsKycDetails;