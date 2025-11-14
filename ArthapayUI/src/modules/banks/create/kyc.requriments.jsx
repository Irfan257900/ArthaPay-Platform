import React, { useCallback, useEffect, useState, useRef } from "react";
import { Alert, Form, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import PreviewModal from "../../../core/shared/preview.model";
import { decryptAES } from "../../../core/shared/encrypt.decrypt";
import KycDetailsloader from "../../../core/skeleton/kycDetails.loader";
import { formatDate } from "../../../utils/app.config";
import {
    createBankAccount,
    fetchAccountsToCreate,
    fetchKycRequirements,
    setAdditionalInfo,
    setAddressInformation,
    setKycDocInfo,
} from "../../../reducers/banks.reducer";
import { renderField } from "../../../core/onboarding/http.services";
import CustomButton from "../../../core/button/button";
import FileUpload from "../../../core/shared/file.upload";
import {
    checkFileName,
    checkFileSize,
    checkValidExtension,
    updateFileList,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    fileValidations,
} from "../../../core/shared/fileUploadVerifications";
import { useNavigate, useParams } from "react-router";
import AddressSelection from "./address.selection";
import UbosOrDirectorsGrid from "./ubos.directors";
import { documentNumberRegex, validations } from "../../../core/shared/validations";
import AppDatePicker from "../../../core/shared/appDatePicker";
import moment from "moment/moment";
import AdditionalInfo from "./additionalinfo";
import PersonalAdditionalInfo from "./personaladditionalinfo";

const parseKycRequirements = (requirementString) => {
    if (!requirementString) return new Set();
    return new Set(requirementString.split(",").map((req) => req.trim()));
};

const normalizeKycData = (raw) => {
    const kyc = raw?.kyc;
    const customerKycDetails = {
        firstName: kyc?.fullName?.firstName
            ? decryptAES(kyc.fullName.firstName)
            : "",
        lastName: kyc?.fullName?.lastName
            ? decryptAES(kyc.fullName.lastName)
            : "",
        gender: kyc?.basic?.gender || "",
        dob: kyc?.basic?.dob || "",
        idIssuingCountry: "",
        docNumber: kyc?.pfc?.docId || "",
        docExpireDate: kyc?.pfc?.docExpiryDate || "",
        addressDetails: {
            country: kyc?.basic?.country || "",
            state: "",
            town: "",
            city: kyc?.basic?.city || "",
            addressLine1: "",
            addressLine2: "",
            postalCode: "",
            phoneCode: kyc?.basic?.phoneCode
                ? decryptAES(kyc.basic.phoneCode)
                : "",
            phoneNumber: kyc?.basic?.phoneNo
                ? decryptAES(kyc.basic.phoneNo)
                : "",
            email: kyc?.basic?.email ? decryptAES(kyc.basic.email) : "",
        },
    };

    const kycDocInfo = [
        {
            documentType: kyc?.pfc?.docType || "Document",
            frontImage: kyc?.pfc?.frontDoc,
            backDocImage: kyc?.pfc?.backDoc,
            handHoldingImage: kyc?.pphs?.handHoldingIDPhoto,
            singatureImage: kyc?.pphs?.signImage,
            selfieImage: kyc?.pphs?.faceImage,
            docId: kyc?.pfc?.docId || '',
            docExpiryDate: kyc?.pfc?.docExpiryDate || '',
        },
        {
            documentType: kyc?.nationalId?.docType || "National ID",
            frontImage: kyc?.nationalId?.frontDoc,
            backDocImage: kyc?.nationalId?.backDoc,
            handHoldingImage: null,
            singatureImage: null,
            selfieImage: null,
            docId: kyc?.nationalId?.docId || '',
            docExpiryDate: kyc?.nationalId?.docExpiryDate || '',
        },
    ];
    return {
        customerKycDetails,
        kycDocInfo: kycDocInfo,
    };
};

const BankKycDetails = ({ hideWizard }) => {
    const [form] = Form.useForm();
    const userConfig = useSelector((store) => store.userConfig.details);
    const [error, setError] = useState(null);
    const [loader, setLoader] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [previewFile, setPreviewFile] = useState("");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [previewImages, setPreviewImages] = useState({
        frontImage: "",
        backDocImage: "",
        handHoldingImage: "",
        selfieImage: "",
        singatureImage: "",
        nationalIdFrontImage: "",
        nationalIdBackImage: "",
    });
    const [pdfPreview, setPdfPreview] = useState({
        frontImage: "",
        backDocImage: "",
        handHoldingImage: "",
        selfieImage: "",
        singatureImage: "",
        nationalIdFrontImage: "",
        nationalIdBackImage: "",
    });
    const [fileLists, setFileLists] = useState({
        frontImage: [],
        backDocImage: [],
        handHoldingImage: [],
        selfieImage: [],
        singatureImage: [],
        nationalIdFrontImage: [],
        nationalIdBackImage: [],
    });
    const [requiredKycSections, setRequiredKycSections] = useState(new Set());
    const accountToCreate = useSelector((store) => store.banks.accountToCreate);
    const bankForCreateAccount = useSelector(
        (store) => store.banks.bankForCreateAccount
    );

    const KycRequriments = useSelector((store) => store.banks.kycRequirements);
    const KycDocInfo = useSelector((store) => store.banks.kycDocInfo);
    const Ubo = useSelector((store) => store.banks.uboBenficiaries);
    const DirectorDetails = useSelector((store) => store.banks.directorBeneficiaries);
    const additionalinfo = useSelector((store) => store.banks.additionalInfo);
    const storedSelector = useSelector((store) => store.banks.selector);
    const storedType = useSelector((store) => store.banks.type);
    const addressInformation = useSelector((store) => store.banks.addressInformation);
    useEffect(() => {
        if (!accountToCreate || !bankForCreateAccount) {
            navigate('/banks/account/create');
        }
    }, [accountToCreate, bankForCreateAccount, navigate])
    useEffect(() => {
        if (additionalinfo) {
            const parsedDob = moment(additionalinfo);
            if (parsedDob.isValid()) {
                form.setFieldsValue({
                    dob: parsedDob,
                });
            }
        }
    }, [additionalinfo, form]);
    const useDivRef = useRef(null)
    const { productId, type } = useParams();
    useEffect(() => {
        const Id = accountToCreate?.banks?.[0]?.productId;
        if (productId || Id) {
            dispatch(fetchKycRequirements(Id || productId));
        }
    }, [accountToCreate, dispatch, productId]);
    useEffect(() => {
        if (addressInformation && Array.isArray(addressInformation) && addressInformation?.length > 0) {
            setSelectedAddress(addressInformation);
            form.setFieldsValue({
                addressIds: addressInformation.map(addr => addr.id),
            });
        }
    }, [addressInformation, form]);

    useEffect(() => {
        if (KycRequriments?.data?.kyc) {
            setLoader(true);
            const normalizedData = normalizeKycData(KycRequriments.data);
            setData(normalizedData);
            const requirements = parseKycRequirements(
                KycRequriments.data.kyc.requirement
            );
            setRequiredKycSections(requirements);
            setLoader(false);
        }
    }, [KycRequriments]);

    useEffect(() => {
        if (KycDocInfo && KycDocInfo.length > 0) {
            const passportDoc = KycDocInfo.find(
                (doc) => doc.documentType.toLowerCase().includes("passport") || doc.documentType === "Document"
            );
            const nationalIdDoc = KycDocInfo.find(
                (doc) => doc.documentType.toLowerCase().includes("national") || doc.documentType === "National ID"
            );

            const newFileLists = {
                frontImage: passportDoc?.frontImage ? [{ uid: "-1", name: "passport_front.jpg", status: "done", url: passportDoc.frontImage }] : [],
                backDocImage: passportDoc?.backDocImage ? [{ uid: "-2", name: "passport_back.jpg", status: "done", url: passportDoc.backDocImage }] : [],
                handHoldingImage: passportDoc?.handHoldingImage ? [{ uid: "-3", name: "hand_holding.jpg", status: "done", url: passportDoc.handHoldingImage }] : [],
                selfieImage: passportDoc?.selfieImage ? [{ uid: "-4", name: "selfie.jpg", status: "done", url: passportDoc.selfieImage }] : [],
                singatureImage: passportDoc?.singatureImage ? [{ uid: "-5", name: "signature.jpg", status: "done", url: passportDoc.singatureImage }] : [],
                nationalIdFrontImage: nationalIdDoc?.frontImage ? [{ uid: "-6", name: "national_id_front.jpg", status: "done", url: nationalIdDoc.frontImage }] : [],
                nationalIdBackImage: nationalIdDoc?.backDocImage ? [{ uid: "-7", name: "national_id_back.jpg", status: "done", url: nationalIdDoc.backDocImage }] : [],
            };
            setFileLists(newFileLists);
            form.setFieldsValue({
                docId: passportDoc?.docId,
                docExpiryDate: passportDoc?.docExpiryDate ? moment(passportDoc.docExpiryDate) : null,
                frontImage: newFileLists.frontImage[0]?.url,
                backDocImage: newFileLists.backDocImage[0]?.url,
                handHoldingImage: newFileLists.handHoldingImage[0]?.url,
                selfieImage: newFileLists.selfieImage[0]?.url,
                singatureImage: newFileLists.singatureImage[0]?.url,
                nidocId: nationalIdDoc?.docId,
                niExpiryDate: nationalIdDoc?.docExpiryDate ? moment(nationalIdDoc.docExpiryDate) : null,
            });
        } else if (KycRequriments?.data?.kyc) {
            const normalizedData = normalizeKycData(KycRequriments.data);
            const passportDoc = normalizedData.kycDocInfo.find(
                (doc) =>
                    doc.documentType.toLowerCase().includes("passport") ||
                    doc.documentType === "Document"
            );
            const nationalIdDoc = normalizedData.kycDocInfo.find(
                (doc) =>
                    doc.documentType.toLowerCase().includes("national") ||
                    doc.documentType === "National ID"
            );
            const newFileLists = {
                frontImage: passportDoc?.frontImage ? [{ uid: "-1", name: "passport_front.jpg", status: "done", url: passportDoc.frontImage }] : [],
                backDocImage: passportDoc?.backDocImage ? [{ uid: "-2", name: "passport_back.jpg", status: "done", url: passportDoc.backDocImage }] : [],
                handHoldingImage: passportDoc?.handHoldingImage ? [{ uid: "-3", name: "hand_holding.jpg", status: "done", url: passportDoc.handHoldingImage }] : [],
                selfieImage: passportDoc?.selfieImage ? [{ uid: "-4", name: "selfie.jpg", status: "done", url: passportDoc.selfieImage }] : [],
                singatureImage: passportDoc?.singatureImage ? [{ uid: "-5", name: "signature.jpg", status: "done", url: passportDoc.singatureImage }] : [],
                nationalIdFrontImage: nationalIdDoc?.frontImage ? [{ uid: "-6", name: "national_id_front.jpg", status: "done", url: nationalIdDoc.frontImage }] : [],
                nationalIdBackImage: nationalIdDoc?.backDocImage ? [{ uid: "-7", name: "national_id_back.jpg", status: "done", url: nationalIdDoc.backDocImage }] : [],
            };
            setFileLists(newFileLists);
            const docExpiryDateString = KycRequriments?.data?.kyc?.pfc?.docExpiryDate;
            const parsedDocExpiryDate = docExpiryDateString ? moment(docExpiryDateString, 'M/D/YYYY hh:mm:ss A') : null;
            const formattedDocExpiryDate = KycRequriments?.data?.kyc?.nationalId?.docExpiryDate;
            const parsedFormattedDocExpiryDate = formattedDocExpiryDate ? moment(formattedDocExpiryDate, 'M/D/YYYY hh:mm:ss A') : null;
            form.setFieldsValue({
                docId: KycRequriments?.data?.kyc?.pfc?.docId,
                docExpiryDate: parsedDocExpiryDate && parsedDocExpiryDate.isValid() ? parsedDocExpiryDate : null,
                frontImage: newFileLists.frontImage[0]?.url,
                backDocImage: newFileLists.backDocImage[0]?.url,
                handHoldingImage: newFileLists.handHoldingImage[0]?.url,
                selfieImage: newFileLists.selfieImage[0]?.url,
                singatureImage: newFileLists.singatureImage[0]?.url,
                nidocId: KycRequriments?.data?.kyc?.nationalId?.docId,
                niExpiryDate: parsedFormattedDocExpiryDate,
            });
        }
    }, [KycDocInfo, KycRequriments]);

    const clearErrorMessage = useCallback(() => setError(null), []);

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

    // const handleScrollTop = useCallback(() => {
    //     if (useDivRef.current) {
    //         useDivRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    //     }
    // }, []);
    const handleScrollTop = useCallback((offset = 250) => {
    // Scrolls to 100 pixels down from the top of the window.
    window.scrollTo({ top: offset, behavior: 'smooth' });
}, []);

    const onDownload = useCallback((file) => {
        const fileUrl = file.url || file.response?.url;
        if (fileUrl) {
            window.open(fileUrl, "_self");
        } else {
            console.error("Download URL is not available.");
        }
    }, []);

    const handleFilePreview = (fileList, type) => {
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
            setError("Upload failed. Please try again.");
        }
    };

    const handleUploadChange = useCallback(
        (type, { fileList }) => {
            setError(null);
            const file = fileList[0]?.name || "";
            const fileExtension = file?.split(".").pop().toLowerCase();

            const isValidFileExtension = checkValidExtension(
                fileExtension,
                ALLOWED_EXTENSIONS
            );
            if (!isValidFileExtension) {
                setError(fileValidations.fileExtension);
                handleScrollTop();
                return;
            }
            const isFileSizeValid = checkFileSize(fileList[0]?.size, MAX_FILE_SIZE);
            if (!isFileSizeValid) {
                setError(fileValidations.fileSize);
                handleScrollTop();
                return;
            }
            const isValidFileName = checkFileName(fileList[0]?.name);
            if (!isValidFileName) {
                setError(fileValidations.fileName);
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
        [handleScrollTop]
    );

    const removeImage = useCallback(
        (type) => {
            setFileLists((prev) => ({ ...prev, [type]: [] }));
            setPreviewImages((prev) => ({ ...prev, [type]: "" }));
            setPdfPreview((prev) => ({ ...prev, [type]: "" }));
            form.setFieldsValue({ [type]: "" });
        },
        [form]
    );

    const isSectionRequired = useCallback(
        (sectionCode) => {
            return requiredKycSections.has(sectionCode);
        },
        [requiredKycSections]
    );

    const REQUIRED_FIELDS = {
        Ubo: [
            'firstName',
            'lastName',
            'dob',
            'phoneNumber',
            'email',
            'country',
            'docDetails.type',
            'docDetails.number',
            'docDetails.expiryDate',
            'docDetails.frontImage',
            'docDetails.backImage'
        ],
        Director: [
            'firstName',
            'lastName',
            'dob',
            'phoneNumber',
            'country',
            'docDetails.type',
            'docDetails.number',
            'docDetails.expiryDate',
            'docDetails.frontImage',
            'docDetails.backImage',
            'email',
        ]
    };

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

    const handlePayWithWallet = useCallback(async () => {
        try {
            setLoading(true);
            await form.validateFields();
            if (type === "kyb" && isSectionRequired("Address")) {
                if (!selectedAddress || selectedAddress.length < 2) {
                    setError("Please select at least two addresses.");
                    handleScrollTop();
                    return;
                }
            } else if (isSectionRequired("Address") && !selectedAddress) {
                setError("Please select an address.");
                handleScrollTop();
                return;
            }
            // if (type === "kyb") {
            //     let beneficiaries = [];

            //     if (isSectionRequired("UBO")) {
            //         const uboError = validateBeneficiaries(Ubo, 'Ubo');
            //         if (uboError) {
            //             setError(uboError);
            //             handleScrollTop();
            //             return;
            //         }
            //         beneficiaries = beneficiaries.concat(Ubo);
            //     }

            //     if (isSectionRequired("Director")) {
            //         const directorError = validateBeneficiaries(DirectorDetails, 'Director');
            //         if (directorError) {
            //             setError(directorError);
            //             handleScrollTop();
            //             return;
            //         }
            //         beneficiaries = beneficiaries.concat(DirectorDetails);
            //     }
            //     if (isSectionRequired("UBO") || isSectionRequired("Director")) {
            //         const totalPercentage = beneficiaries.reduce((sum, beneficiary) => {
            //             const percentage = parseFloat(beneficiary?.shareHolderPercentage) || 0;
            //             return sum + percentage;
            //         }, 0);

            //         if (totalPercentage !== 100) {
            //             let errorMessage;
            //             if (totalPercentage < 100) {
            //                 errorMessage = `The total shareholder percentage for UBOs and Directors is ${totalPercentage}%. It must be exactly 100%. Please adjust the share percentages.`;
            //             } else {
            //                 errorMessage = `The total shareholder percentage for UBOs and Directors is ${totalPercentage}%. It cannot exceed 100%. Please adjust the share percentages.`;
            //             }
            //             setError(errorMessage);
            //             handleScrollTop();
            //             return;
            //         }
            //     }
            // }

             if (type === "kyb") {
                if (isSectionRequired("UBO")) {
                    const uboError = validateBeneficiaries(Ubo, 'Ubo');
                    if (uboError) {
                        setError(uboError);
                        handleScrollTop();
                        return;
                    }
                }
                if (isSectionRequired("Director")) {
                    const directorError = validateBeneficiaries(DirectorDetails, 'Director');
                    if (directorError) {
                        setError(directorError);
                        handleScrollTop();
                        return;
                    }
                }
            }
            const documents = [
                {
                    documentType: 'Passport',
                    frontImage: fileLists.frontImage[0]?.url || '',
                    backDocImage: fileLists.backDocImage[0]?.url || '',
                    handHoldingImage: fileLists.handHoldingImage[0]?.url || '',
                    singatureImage: fileLists.singatureImage[0]?.url || '',
                    selfieImage: fileLists.selfieImage[0]?.url || '',
                    docId: form.getFieldValue('docId'),
                    docExpiryDate: parseDate(form.getFieldValue('docExpiryDate')),
                },
                // {
                //     documentType: "national Id",
                //     frontImage: fileLists.nationalIdFrontImage[0]?.url || '',
                //     backDocImage: fileLists.nationalIdBackImage[0]?.url || '',
                //     docId: form.getFieldValue('nidocId'),
                //     docExpiryDate: parseDate(form.getFieldValue('niExpiryDate')),
                // },
            ];
            dispatch(setKycDocInfo(documents));
            dispatch(setAdditionalInfo(parseDate(form.getFieldValue('dob'))));
            setError(null);
            const accountCreationFee = bankForCreateAccount?.accountCreationFee;
            if (accountCreationFee === 0.00) {
                const saveResponse = await dispatch(createBankAccount(productId));
                if (saveResponse?.meta.requestStatus === 'fulfilled') {
                    navigate("success");
                } else {
                    setError(saveResponse?.payload);
                    handleScrollTop();
                }
            } else {
                navigate(`/banks/account/create/${productId}/${type}/pay`);
            }

        } catch (err) {
            setError("Please ensure all required fields are filled out correctly before proceeding.");
            handleScrollTop();
        }
        finally {
            setLoading(false);
        }
    }, [form, handleScrollTop, type, selectedAddress, navigate, DirectorDetails, Ubo, fileLists, bankForCreateAccount, dispatch]);

    const handleAddressError = useCallback((msg) => setError(msg), []);
    const handleSelectedAddress = useCallback((addr) => {
        setSelectedAddress(addr);
        dispatch(setAddressInformation(addr))
    }, [dispatch])

    const parseDate = (date) => {
        return date && moment(date).isValid() ? moment(date) : null;
    };

    return (
        <>
            {KycRequriments?.loading && <KycDetailsloader />}
            {loader && <KycDetailsloader />}
            <div className="text-secondaryColor  mt-2" ref={useDivRef}>
                <div className="h-full rounded-5">
                    <div className="basicinfo-form">
                        {error && (
                            <div className="alert-flex">
                                <Alert
                                    type="error"
                                    description={error}
                                    onClose={clearErrorMessage}
                                    showIcon
                                />
                                <button
                                    className="icon sm alert-close"
                                    onClick={clearErrorMessage}
                                ></button>
                            </div>
                        )}
                        <Form form={form} initialValues={{ selector: storedSelector, type: storedType }}>
                            {userConfig?.accountType !== "Business" ? (
                                <div className="mt-3 w-full rounded-5 border-dbkpiStroke">
                                    {isSectionRequired("FullName") || isSectionRequired("Basic") || isSectionRequired("PFC") ? (
                                        <>
                                            <h3 className="text-2xl font-semibold text-titleColor mb-2">
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 custom-info">
                                                {isSectionRequired("FullName") && data?.customerKycDetails?.firstName &&
                                                    renderField("First Name", data.customerKycDetails.firstName)}
                                                {isSectionRequired("FullName") && data?.customerKycDetails?.lastName &&
                                                    renderField("Last Name", data.customerKycDetails.lastName)}
                                                {isSectionRequired("Basic") && data?.customerKycDetails?.gender &&
                                                    renderField("Gender", data.customerKycDetails.gender, "", "capitalize")}
                                            </div>
                                        </>
                                    ) : null}

                                    {isSectionRequired("Basic") || isSectionRequired("Address") ? (
                                        <>
                                            <h3 className="text-2xl font-semibold text-titleColor mb-2 mt-5">
                                                Basic Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                                {isSectionRequired("Basic") && data?.customerKycDetails?.addressDetails?.email &&
                                                    renderField("Email", data.customerKycDetails.addressDetails.email)}
                                                {isSectionRequired("Basic") && data?.customerKycDetails?.addressDetails?.phoneNumber &&
                                                    renderField(
                                                        "Phone Number",
                                                        `${data.customerKycDetails.addressDetails.phoneCode} ${data.customerKycDetails.addressDetails.phoneNumber}`
                                                    )}
                                                {isSectionRequired("Basic") && data?.customerKycDetails?.addressDetails?.country &&
                                                    renderField("Country", data.customerKycDetails.addressDetails.country)}
                                                {isSectionRequired("Address") && data?.customerKycDetails?.addressDetails?.state &&
                                                    renderField("State", data.customerKycDetails.addressDetails.state)}
                                                {isSectionRequired("Address") && data?.customerKycDetails?.addressDetails?.town &&
                                                    renderField("Town", data.customerKycDetails.addressDetails.town)}
                                                {isSectionRequired("Address") && data?.customerKycDetails?.addressDetails?.city &&
                                                    renderField("City", data.customerKycDetails.addressDetails.city)}
                                                {isSectionRequired("Address") && data?.customerKycDetails?.addressDetails?.addressLine1 &&
                                                    renderField("Address Line 1", data.customerKycDetails.addressDetails.addressLine1)}
                                                {isSectionRequired("Address") && data?.customerKycDetails?.addressDetails?.addressLine2 &&
                                                    renderField("Address Line 2", data.customerKycDetails.addressDetails.addressLine2)}
                                                {isSectionRequired("Address") && data?.customerKycDetails?.addressDetails?.postalCode &&
                                                    renderField("Postal Code", data.customerKycDetails.addressDetails.postalCode, "", "uppercase")}
                                            </div>
                                        </>
                                    ) : null}
                                    <div>

                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 w-full rounded-5 border-dbkpiStroke">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-semibold text-titleColor mb-2">
                                            Company Information
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                        {KycRequriments?.data?.kyb?.companyName && renderField("Company Name", decryptAES(KycRequriments.data.kyb.companyName))}
                                        {KycRequriments?.data?.kyb?.country && renderField("Country", KycRequriments.data.kyb.country)}
                                        {KycRequriments?.data?.kyb?.registrationNumber && renderField("Registration Number", decryptAES(KycRequriments.data.kyb.registrationNumber), '', 'uppercase')}
                                        {KycRequriments?.data?.kyb?.incorporationDate && renderField("Date of Registration", KycRequriments.data.kyb.incorporationDate, formatDate)}
                                    </div>
                                    <h3 className="text-xl font-semibold text-titleColor mt-3 mb-2">
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                                        {data?.customerKycDetails?.addressDetails?.firstName && renderField("First Name", data?.customerKycDetails?.addressDetails?.firstName)}
                                        {data?.customerKycDetails?.addressDetails?.lastName && renderField("Last Name", data?.customerKycDetails?.addressDetails?.lastName)}
                                        {data?.customerKycDetails?.addressDetails?.email && renderField("Email", data?.customerKycDetails?.addressDetails?.email)}
                                        {data?.customerKycDetails?.addressDetails?.state && renderField("State", data?.customerKycDetails?.addressDetails?.state)}
                                        {data?.customerKycDetails?.addressDetails?.town && renderField("Town", data?.customerKycDetails?.addressDetails?.town)}
                                        {data?.customerKycDetails?.addressDetails?.city && renderField("City", data?.customerKycDetails?.addressDetails?.city)}
                                        {data?.customerKycDetails?.addressDetails?.addressLine1 && renderField("Address Line1", data?.customerKycDetails?.data?.customerKycDetails?.addressDetails?.addressLine1)}
                                        {data?.customerKycDetails?.addressDetails?.addressLine2 && renderField("Address Line2", data?.customerKycDetails?.data?.customerKycDetails?.addressDetails?.addressLine2)}
                                        {data?.customerKycDetails?.addressDetails?.postalCode && renderField("Postal Code", data?.customerKycDetails?.addressDetails?.postalCode)}
                                        {data?.customerKycDetails?.addressDetails?.phoneNumber && renderField("Phone Number", `${data?.customerKycDetails?.addressDetails?.phoneCode}${' '}${data?.customerKycDetails?.addressDetails?.phoneNumber}`)}
                                        {data?.customerKycDetails?.addressDetails?.country && renderField("Country", data?.customerKycDetails?.addressDetails?.country)}

                                    </div>
                                </div>
                            )}
                            {KycRequriments?.data?.kyb?.sector === null && userConfig?.accountType === "Business" && <AdditionalInfo />}
                            {userConfig?.accountType === "Personal" && (
                                <PersonalAdditionalInfo form={form} />
                            )}
                            {(isSectionRequired("UBO") || isSectionRequired("Director")) &&
                                <div className="">
                                    {data && <UbosOrDirectorsGrid setSelectionError={handleAddressError} apiData={KycRequriments?.data?.kyb} />}
                                </div>
                            }
                            <div className="mt-3 w-full rounded-5 border-dbkpiStroke">
                                {(isSectionRequired("PFC") || isSectionRequired("PB") || isSectionRequired("PPHS") || isSectionRequired("NI")) ? (
                                    <>
                                        <h3 className="text-2xl font-semibold text-titleColor mb-2 mt-5">
                                            Documents
                                        </h3>
                                        <div className={`mt-4 w-full ${(!hideWizard && "") || ""}`}>
                                            {isSectionRequired("PFC") && (
                                                <>
                                                    <div className={`grid ${(!hideWizard && "gap-7 xl:grid-cols-3") || "gap-6"}`}>
                                                        <h1 className="text-lg text-subTextColor font-medium mb-1.5">Passport</h1>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4 mt-1.5 mb-4">
                                                        <div>
                                                            <Form.Item
                                                                className="mb-0"
                                                                name="docId"
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
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                        <div>
                                                            <Form.Item
                                                                className="mb-0"
                                                                name="docExpiryDate"
                                                                required
                                                                label={'Document Expiry Date'}
                                                                rules={[{ required: true, message: "is required" }]}
                                                            >
                                                                <AppDatePicker
                                                                    className="bg-transparent border-[1px] border-dbkpiStroke text-lightWhite p-2 rounded-5 outline-0 w-full"
                                                                    datesToDisable="pastAndCurrentDates"
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                    </div>
                                                    <div className={`grid md:grid-cols-1 gap-4 ${(!hideWizard && "xl:grid-cols-2") || ""}`}>
                                                        <Form.Item
                                                            name="frontImage"
                                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                            rules={[{ required: isSectionRequired("PFC"), message: "is required" }]}
                                                        >
                                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                                    Front ID Photo <span className="text-requiredRed">*</span>
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
                                                            name="backDocImage"
                                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                            rules={[{ required: isSectionRequired("PFC"), message: "is required" }]}
                                                        >
                                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                                    Back ID Photo <span className="text-requiredRed">*</span>
                                                                </p>
                                                            </div>
                                                            <FileUpload
                                                                name="backDocImage"
                                                                fileList={fileLists.backDocImage}
                                                                previewImage={previewImages.backDocImage || pdfPreview.backDocImage || (fileLists.backDocImage[0]?.url || '')}
                                                                handleUploadChange={handleUploadChange}
                                                                handleRemoveImage={removeImage}
                                                                onPreview={handlePreview}
                                                                onDownload={onDownload}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </>
                                            )}
                                            {isSectionRequired("PPHS") && (
                                                <>
                                                    <div className={`grid md:grid-cols-1 gap-4 ${(!hideWizard && "xl:grid-cols-2") || ""}`}>
                                                        <Form.Item
                                                            name="handHoldingImage"
                                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                            rules={[{ required: isSectionRequired("PPHS"), message: "is required" }]}
                                                        >
                                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                                    Hand Holding ID Photo <span className="text-requiredRed">*</span>
                                                                </p>
                                                            </div>
                                                            <FileUpload
                                                                name="handHoldingImage"
                                                                fileList={fileLists.handHoldingImage}
                                                                previewImage={previewImages.handHoldingImage || pdfPreview.handHoldingImage || (fileLists.handHoldingImage[0]?.url || '')}
                                                                handleUploadChange={handleUploadChange}
                                                                handleRemoveImage={removeImage}
                                                                onPreview={handlePreview}
                                                                onDownload={onDownload}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            name="selfieImage"
                                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                            rules={[{ required: isSectionRequired("PPHS"), message: "is required" }]}
                                                        >
                                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                                    Face Photo <span className="text-requiredRed">*</span>
                                                                </p>
                                                            </div>
                                                            <FileUpload
                                                                name="selfieImage"
                                                                fileList={fileLists.selfieImage}
                                                                previewImage={previewImages.selfieImage || pdfPreview.selfieImage || (fileLists.selfieImage[0]?.url || '')}
                                                                handleUploadChange={handleUploadChange}
                                                                handleRemoveImage={removeImage}
                                                                onPreview={handlePreview}
                                                                onDownload={onDownload}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            name="singatureImage"
                                                            className="payees-input !mb-4 required-reverse"
                                                            rules={[{ required: isSectionRequired("PPHS"), message: "is required" }]}
                                                        >
                                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                                    Signature Photo <span className="text-requiredRed">*</span>
                                                                </p>
                                                            </div>
                                                            <FileUpload
                                                                name="singatureImage"
                                                                fileList={fileLists.singatureImage}
                                                                previewImage={previewImages.singatureImage || pdfPreview.singatureImage || (fileLists.singatureImage[0]?.url || '')}
                                                                handleUploadChange={handleUploadChange}
                                                                handleRemoveImage={removeImage}
                                                                onPreview={handlePreview}
                                                                onDownload={onDownload}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </>
                                            )}
                                            {isSectionRequired("NI") && (
                                                <div>
                                                    <h1 className="text-lg text-subTextColor font-medium mb-1.5">National ID</h1>
                                                    <div className={`grid md:grid-cols-1 gap-4 ${(!hideWizard && "xl:grid-cols-2") || ""}`}>
                                                        <div>
                                                            <Form.Item
                                                                className="mb-0"
                                                                name="nidocId"
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
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                        <div>
                                                            <Form.Item
                                                                className="mb-0"
                                                                name="niExpiryDate"
                                                                label={'Document Expiry Date'}
                                                            >
                                                                <AppDatePicker
                                                                    className="bg-transparent border-[1px] border-dbkpiStroke text-lightWhite p-2 rounded-5 outline-0 w-full"
                                                                    datesToDisable="pastAndCurrentDates"
                                                                />
                                                            </Form.Item>
                                                        </div>
                                                        <Form.Item
                                                            name="nationalIdFrontImage"
                                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                            rules={[{ required: isSectionRequired("NI"), message: "is required" }]}
                                                        >
                                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                                    Front ID Photo <span className="text-requiredRed">*</span>
                                                                </p>
                                                            </div>
                                                            <FileUpload
                                                                name="nationalIdFrontImage"
                                                                fileList={fileLists.nationalIdFrontImage}
                                                                previewImage={previewImages.nationalIdFrontImage || pdfPreview.nationalIdFrontImage || (fileLists.nationalIdFrontImage[0]?.url || '')}
                                                                handleUploadChange={handleUploadChange}
                                                                handleRemoveImage={removeImage}
                                                                onPreview={handlePreview}
                                                                onDownload={onDownload}
                                                            />
                                                        </Form.Item>
                                                        <Form.Item
                                                            name="nationalIdBackImage"
                                                            className={`payees-input required-reverse ${(!hideWizard && "!mb-4") || "mb-0"}`}
                                                            rules={[{ required: isSectionRequired("NI"), message: "is required" }]}
                                                        >
                                                            <div className="flex items-center justify-between mb-2 viewsmaple-image">
                                                                <p className="ant-form-item-required text-labelGrey text-sm font-medium">
                                                                    Back ID Photo <span className="text-requiredRed">*</span>
                                                                </p>
                                                            </div>
                                                            <FileUpload
                                                                name="nationalIdBackImage"
                                                                fileList={fileLists.nationalIdBackImage}
                                                                previewImage={previewImages.nationalIdBackImage || pdfPreview.nationalIdBackImage || (fileLists.nationalIdBackImage[0]?.url || '')}
                                                                handleUploadChange={handleUploadChange}
                                                                handleRemoveImage={removeImage}
                                                                onPreview={handlePreview}
                                                                onDownload={onDownload}
                                                            />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : null}
                            </div>
                            {isSectionRequired("Address") && data && <AddressSelection form={form} Form={Form} isError={handleAddressError} selectedAddressData={handleSelectedAddress} />}
                        </Form>
                        {data && <div className="mt-6 p-5 text-right">
                            <CustomButton
                                type="primary"
                                onClick={handlePayWithWallet}
                                className=""
                                disabled={uploading || loading}
                                loading={loading}
                            >
                                {bankForCreateAccount?.accountCreationFee === 0.00 ? "Submit" : "Continue"}
                            </CustomButton>
                        </div>
                        }
                    </div>
                </div>
                <PreviewModal
                    isVisible={isPreviewVisible}
                    fileUrl={previewFile}
                    onClose={handleClosePreview}
                />
            </div>
        </>
    );
};

export default BankKycDetails;