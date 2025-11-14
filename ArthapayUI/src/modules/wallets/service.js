import { deriveErrorMessage } from "../../core/shared/deriveErrorMessage";
import { saveMerchant, updateMerchant } from "./api";
import numberFormatter from "../../utils/numberFormatter";
import moment from "moment";
import { textStatusColors } from "../../utils/statusColors";

export const handleVaultSave = async (values,  mode) => {
    const name = values.merchantName.trim();
    let obj = {
        id: mode === 'edit' ? values.id : "00000000-0000-0000-0000-000000000000",
        name,
    };
    if (mode !== 'edit') {
        obj = {
            ...obj,
            id : "00000000-0000-0000-0000-000000000000",
            name,
        };
    }
    const response = mode === 'edit'
        ? await updateMerchant(values.id, obj)
        : await saveMerchant(obj);

    if (response) {
        return response
    } else {
        throw new Error(deriveErrorMessage(response))
    }
}
export const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
export const coinSymbols = {
    CHF: "₣", // Swiss Franc
    EUR: "€", // Euro
    GBP: "£", // British Pound
    USD: "$", // US Dollar
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
  export const statusColor = {
    approved: "text-textGreen",
    submitted: "text-textSkyblue",
    "not paid": "text-darkyellowStatus",
    failed: "text-textLightRed",
    cancelled: "text-textLightRed",
    pending : "text-darkyellowStatus",
}

  export const Messages = {
    CONTACT_ADMIN: "Please contact administrator for freeze/unfreeze",
    CARD_FREEZE_TOPUP: "Card cannot be topped up while it is in a Freeze state.",
    CARD_FREEZE_PIN: "Card cannot be set pin while it is in a Freeze state.",
    NEW_PATH :`/wallets/fiat/null/null/null/00000000-0000-0000-0000-000000000000`
  };
  export const getBalanceText = (amount) => {
    const { number, suffix } = numberFormatter(amount)
    return number?.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + suffix
}
 export const formatCardNumber = (details, isViewCard) => {
  if (details?.number && details.number.length > 0) {
    return isViewCard
      ? details.number.replace(/(\d{4})(?=\d)/g, '$1 ')
      : `XXXX XXXX XXXX ${details.number.substr(-4)}`;
  }
  return 'XXXX XXXX XXXX XXXX';
};
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
  const isFreezed = state === 'Freezed';
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



export const FiatTransactionsDateHandler=({dateProps})=>{
  const date=dateProps.dataItem.date
  return(
        <td className="text-left px-3 py-2 border border-borderLightGreen text-sm font-normal text-lightWhite">
      <div>
          {
              date
                  ? moment.utc(date).local().format("DD/MM/YY hh:mm A")
                  : date
          }
      </div>
  </td>
  )
}

export const FiatTransactionsStatusHandler=({statusProps})=>{
  const status = statusProps.dataItem.state || ''
  return (
      <td>
          <span className={`text-left  text-sm font-medium ${textStatusColors[status?.toLowerCase()]}`}>
              {status}
          </span>
      </td>
  )
}

export const selectTab="Crypto"
export const selectTabs="Fiat"

