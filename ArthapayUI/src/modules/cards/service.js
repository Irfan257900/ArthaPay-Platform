import { useTranslation } from "react-i18next";
import StickyBox from "react-sticky-box";
import { decryptAES } from "../../core/shared/encrypt.decrypt";

export const Messages = {
  INSUFFICIENT_FUNDS: "You don't have sufficient balance",
  ENTER_AMOUNT: "Please enter amount",
  AMOUNT_GREATER_THAN_ZERO: "Amount must be greater than zero",
  SELECT_CURRENCY: "Please select Currency",
  SELECT_NETWORK: "Please select Network",
  MINIMUM_DEPOSIT: "The minimum amount for deposit is ",
  MAXIMUM_DEPOSIT: "The maximum amount for deposit is ",
  TOPUP_SUCCESS: "TopUp completed successfully",
  CONTACT_ADMIN: "Please contact administrator for freeze/unfreeze",
  CARD_FREEZE_TOPUP: "Card cannot be topped up while it is in a Freeze state.",
  CARD_FREEZE_PIN: "Card cannot be set pin while it is in a Freeze state.",
  APPLY_CARD_SUCCESSMESSAGE: 'Card assiged successfully!',
  REQUEST_SUBMITTED: `Your request has been successfully submitted!`,
  CARD_APPLY_SUCCESSMESSAGE: `Your card has been successfully created.`,
  FILE_SIZE_EXCEEDS_LIMIT: "File size cannot exceed 2MB.",
  INVALID_DOUBLE_EXTENSION: "File doesn't allow double extension.",
  INVALID_FILE_EXTENSION: "Only PNG, JPG, JPEG, and PDF file extensions are allowed.",
  UPLOAD_SUCCESS: "Upload successful!",
  UPLOAD_FAILED: "Upload failed. Please try again.",
  SELECT_OPTION: "Please select at least one option: either 'I have the card on hand' or 'Please send a card to me'.",
  SELECT_PAID_NETWORK: "Please select Paid Network",
  INSUFFICIENT_CARD_BALANCE: "Insufficient card balance to set the PIN.",
  EXPIRY_DATE:"Expiry date must be greater than Date of Birth",
  MINLIMIT : "Could you please top up with the minimum recharge amount",
  MAXLIMIT: "please top up with an amount less than the maximum limit",
};
  export const badgeStyle = {
    pending: "#E89900",
    approved: "#037A00",
    failed: "#FF0000",
    freezed: "#D7D7D7",
    unfreezed: "#D7D7D7",
    active: "#037A00",
    inactive: "#FF0000",
    suspended: "#FF0000",
    rejected: "#FF0000",
    canceled: "#FF0000",
    "freeze pending": "#E89900",
    "unfreeze pending": "#E89900",
    "under maintenance": "#E89900",
    "submitted": "#2f7cf7",
  }
  export const badgeColor = {
    pending: "#fff",
    approved: "#fff",
    failed: "#fff",
    freezed: "#000",
    unfreezed: "#000",
    active: "#fff",
    inactive: "#fff",
    suspended: "#fff",
    rejected: "#fff",
    canceled: "#fff",
    "freeze pending": "#fff",
    "unfreeze pending": "#fff",
    "under maintenance": "#fff",
    "submitted": "#000",
  }
  export function allCardsGridcolumns (){
     const { t } = useTranslation(); 
  return[
    {
      field: 'name',
      title: t('cards.Name'),
      filter: false,
      filterType: "text",
      width: 150,
      customCell: (propsData) => (
        <td>
          <div className='flex items-center gap-2'>
          <img src={propsData?.dataItem?.logo} alt='logo' className='w-11 rounded-5'/>
          <div className=''>
         <p  className='text-sm font-medium text-subTextColor'>{propsData?.dataItem?.name}</p>
         <p className='text-xs font-medium text-subTextColor'> {propsData?.dataItem?.number?.substr(0, 8)} XXXX XXXX</p>
         </div>
          </div>

        </td>
      ),
    }, 
    {
      field: 'cardType',
      title: t('cards.Card Type'),
      filter: false,
      filterType: "text",
      width: 100,
    },
    {
      field: 'assignedTo',
      title: t('cards.Assigned To'),
      filter: false,
      filterType: "text",
      width: 120,
    },
    {
        field: 'available ',
        title: t('cards.Available'),
        filter: false,
        sortable:false,
        filterType: "text",
        width: 120,
      },
      {
        field: 'status',
        title: t('cards.Status'),
        filter: false,
        filterType: "text",
        width: 90,
      },
]}
export const formatCardNumber = ( isViewCard, details) => {
  const number = isViewCard?.number && decryptAES(isViewCard?.number)||null
  const defaultNumber = details?.number || null;
  if (number && number.length > 0) {
    return isViewCard
      ? number?.replace(/(\d{4})(?=\d)/g, '$1 ')
      : `${number.substr(0, 4) || "XXXX"}${' '}XXXX${' '}XXXX${' '}${number.substr(-4) || "XXXX"}`;
  } else if (defaultNumber) {
    return `${defaultNumber.substr(0, 4) || "XXXX"}${' '}XXXX${' '}XXXX${' '}${defaultNumber.substr(-4) || "XXXX"}`;
  } else {
    return 'XXXX XXXX XXXX XXXX';
  }
};
export const statusColor = {
  approved: "text-textGreen",
  submitted: "text-textSkyblue",
  "not paid": "text-darkyellowStatus",
  failed: "text-textLightRed",
  cancelled: "text-textLightRed",
  pending : "text-darkyellowStatus",
}
export const iconNames = {
  "Enable/Disable": "disable",
  enable: "disable",
  "enable/disable": "disable",
};
export const titles = {
  "kyc-kyb": "KYC/KYB",
  disable: "Enable/Disable",
};
export const getIconClass = (normalizedName, isViewCard, disabled, index,state) => {
  let iconClass = '';
  const isFreezed = state?.toLowerCase() === 'freezed';
  if (normalizedName === 'view') {
    iconClass = isViewCard ? 'icon view-hide' : 'icon view';
  } else {
    iconClass = iconNames[normalizedName] || normalizedName;
  }
  return `icon md ${
   ( (isFreezed && normalizedName !== 'freeze') || disabled[index] ) 
      ? 'cursor-not-allowed opacity-60' 
      : 'cursor-pointer'
  } ${iconClass}`;
};
export const getTooltipTitle = (actionName, status) => {
  if (actionName === 'Freeze') {
    return status?.toLowerCase() === 'approved' ? 'Freeze' : 'UnFreeze';
  }
  return titles[actionName?.toLowerCase()] || actionName;
};
export const initialFormData = {
      firstName:"",
      middleName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      phoneCode: null,
      country: null,
      dob: "",
      city: "",
      gender: null,
      face: "",
      docType: "passport",
      docId: "",
      docExpiryDate: "",
      frontDoc: "",
      backDoc: "",
      mixDoc: "",
      biomatricDoc: "",
      handHoldingIDPhoto: "",
      signImage: "",
      faceImage: "",
      idImage: "",
      addressId: null
}
export const getResetFields = (currentValues, retainKeys = []) => {
  return Object.keys(currentValues).reduce((acc, key) => {
    if (retainKeys.includes(key)) {
      acc[key] = currentValues[key];
    } else {
      acc[key] = null; 
    }
    return acc;
  }, {});
};


export const titleMapping = {
  FullName: "Personal Information",
  FullNameOnly: "Personal Information",
  comms: "Contact Information",
  passportonly: "ID Proofs",
  Passport: "ID Proofs",
  Address: "Address Information",
  FullAddress: "Address Information",
  EmergencyContact:"Emergency Contact",
  Basic : "Basic Information",
  PFC : "ID Proofs",
  PB : "ID Proofs",
  PF : "ID Proofs",
  PPHS :"ID Proofs",
};
export const myCardsTab = 'My Cards'
export const applyCardsTab = 'Apply Cards'
export const renderTabBar =(props, DefaultTabBar) => {
  return (
    <StickyBox>
        <DefaultTabBar {...props} />
    </StickyBox>
);
};