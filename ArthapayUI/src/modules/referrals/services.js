import moment from "moment";
import { textStatusColors } from "../../utils/statusColors";
import CopyComponent from "../../core/shared/copyComponent";
import { Link } from "react-router";
import { decryptAES } from "../../core/shared/encrypt.decrypt";

export const baseURL = window.runtimeConfig.VITE_WALLET_TYPE === "non_custodial" ? window.runtimeConfig.VITE_WEB3_API_END_POINT : window.runtimeConfig.VITE_CORE_API_END_POINT;
export const currentApiVersion='api/v1'

export const allowedDecimals = {
    fiat: 2,
    crypto: 4,
    percentage: 2,
}
export const getMinFieldValue = (type) => {
    type = typeof type === 'string' ? type?.toLowerCase() : type
    return 1 / (10 ** allowedDecimals[type])
}
export const groupCommissions = (data, fields = { action: 'action' }) => {
    const groupedObject = data?.reduce((group, product, productIndex) => {
        const action = product[fields.action];
        group[action] = group[action] ?? [];
        group[action].push({ ...product, productIndex });
        return group
    }, {});
    return groupedObject ? Object.entries(groupedObject) : groupedObject
}

export const TransactionstatusHandler = ({cellprops}) => {
    const status=cellprops?.dataItem?.status;
    return (
      <td className="text-left text-sm font-normal text-lightWhite">
        <span className={textStatusColors[status?.toLowerCase()]}>
          {status}
        </span>
      </td>
    );
  };

  export const TransactionRegisterDateHandler = ({dateProps}) => {
    const registeredDate=dateProps?.dataItem?.registeredDate;
    return (
            <td className="text-left   text-sm font-normal text-lightWhite">
                <div>
                    {
                        registeredDate
                            ? moment.utc(registeredDate).local().format("DD/MM/YYYY")
                            : registeredDate
                    }
                </div>
            </td>
    )
  };

  export const TransactionsNameHandler = ({propsData,customerImg}) => {
    return (
        <td>
        <div className="flex gap-3.5">
            <img src={propsData?.dataItem?.profileImage !== null ? propsData?.dataItem?.profileImage :customerImg} alt="" className="w-9 h-9 rounded-full object-cover"/>
          <div>
            <Link
              to={`referrer/${propsData?.dataItem?.refId}/${propsData?.dataItem?.name}/${propsData?.dataItem?.id}`}
              className="table-text c-pointertransaction-id-text text-link cursor-pointer capitalize"
            >
              {
              propsData?.dataItem['name']
              }
            </Link>
            <CopyComponent
              text={propsData?.dataItem?.refId || ""}
              options={{ format: "text/plain" }}
              shouldTruncate={false}
              componentClass="block referral-copy-icon"
              textClass="text-paraColor text-sm font-medium"
            >
              <h4
                copyable={{ tooltips: ["Copy", "Copied"] }}
                className=""
              >
                {propsData?.dataItem?.refId || "--"}
              </h4>
            </CopyComponent>
          </div>
        </div>
    </td>
    )
  };

  export const TranasactionDateHandler = ({dateProps}) => {
    const transactionDate=dateProps?.dataItem?.date;
    return (
        <td className="text-left   text-sm font-normal text-lightWhite">
        <div>
            {
                transactionDate
                    ? moment.utc(transactionDate).local().format("DD/MM/YYYY hh:mm:ss A")
                    : transactionDate
            }
        </div>
    </td>
    )
  };

  

  export const TransactionViewStatusHandler = ({cellprops}) => {
    const status=cellprops?.dataItem?.status;
    return (
        <td className="text-left  text-sm font-normal text-lightWhite">
        <span className={textStatusColors[status?.toLowerCase()]||'text-textGreen'}>{status}</span>
    </td>
    )
  };



  export const TransactionsEmailHandler = ({ propsData }) => {
    const email = propsData?.dataItem?.email;
    return (
      <td className="text-left text-base font-normal text-lightWhite">
        <span className="text-lightWhite">{decryptAES(email) || "--"}</span>
      </td>
    );

  }
