import { useCallback } from "react";
import moment from "moment";
import { Avatar, List } from "antd";
import { textStatusColors } from "../../utils/statusColors";
import CopyComponent from "../../core/shared/copyComponent";

export const WalletHandler = ({ cellprops }) => {
  const wallet = cellprops?.dataItem?.wallet;
  return (
    <td className="px-3.5 py-1 text-subTextColor font-semibold">
      <p className="w-max font-semibold">{wallet}</p>
    </td>
  );
};

export const TransactionIdCell = ({ dataItem }) => (
  <td>
    <div>
      <span
        className="table-text text-left">
        {dataItem}
      </span>
    </div>
  </td>
);
export const DateCell = ({ dataItem }) => (
    <div>
      {dataItem
        ? moment.utc(dataItem).local().format("DD/MM/YY hh:mm A")
        : dataItem}
    </div>
);
export const StatusCell = ({ dataItem }) => {
  const status = dataItem || "";
  return (
    
      <span className={`text-left text-sm font-medium ${textStatusColors[status?.toLowerCase()]}`}>
        {status}
      </span>
    
  );
};

export const AddressItem = ({ item, selectedAddress, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(item);
  }, [onClick, item]);
  return (
    <List.Item onClick={handleClick}
      className={`!p-3 mb-2.5 cursor-pointer hover:bg-cardbackground  border border-cardBorder border-solid rounded-5 ${item.favoriteName === selectedAddress?.favoriteName ? "bg-cardbackground activecheck-show" : "bg-StrokeColor check-hidden"}`}>
      <List.Item.Meta
        avatar={<Avatar className="text-xl font-semibold text-subTextColor bg-BlackBg">{item?.favoriteName?.charAt(0).toUpperCase()}</Avatar>}
        title={<div className="flex justify-between"><div><h4 className="text-base text-subTextColor font-semibold">{item?.favoriteName}</h4>
          <p className="text-sm font-normal text-titleColor">
            {/* {item?.currency?.toUpperCase()} account ending with {item?.walletAddress?.substr(item?.walletAddress?.length - 4)} */}
             {item?.name} - {item?.accountNoOrAddress}

            </p>
        </div>
          <div>
            <span className="icon md success-arrow scale-150"></span>
          </div>
        </div>
        }
        description={
          <div className="coin-val"></div>
        }
      />
    </List.Item>
  )
};


export const getDepositBreadCrumbList = (
  pathname,
  walletcode,
  navigate,
) => {
  const baseCrumbs = [
    { id: "1", title: "Banks" },
    { id: "2", title: "Deposit" },
  ];

  if (pathname.includes("details")) {
    return [
      ...baseCrumbs,
      { id: "3", title: walletcode },
      { id: "4", title: "Details" },
    ];
  }
  if (walletcode) {
    return [...baseCrumbs, { id: "3", title: walletcode }];
  }
  return baseCrumbs;
}


export const TransactionIdHandler = ({txIdProps}) => {
        const value = txIdProps;
        if (!value) return null;
        const shortTxId = `${value.slice(0, 4)}...${value.slice(-4)}`;
        return (
            <div className="flex items-center gap-2">
                <span>{shortTxId}</span>
                <CopyComponent
                    text={value}
                    noText="No refId"
                    shouldTruncate={false}
                        type=""
                        className="icon copy-icon cursor-pointer text-primaryColor"
                        textClass="text-primaryColor"
                    />

                </div>
        );
    };


export const getWithdrawBreadCrumbList = (pathname, walletCode, navigate) => {
  const baseCrumbs = [
    { id: "1", title: "Banks", handleClick: () => navigate('/banks') },
    { id: "2", title: "Withdraw" },
  ];
  if (pathname.includes("recipientDetails")) {
    return [
      ...baseCrumbs,
      { id: "3", title: walletCode, handleClick: () => navigate('/banks/withdraw') },
      { id: "4", title: "Select Payee" }
    ];
  }

  else if (pathname.includes("summary")) {
    return [
      ...baseCrumbs,
      { id: "3", title: walletCode, handleClick: () => navigate('/banks/withdraw') },
      { id: "4", title: "Summary" }
    ];
  }

  else if (pathname.includes("sucess")) {
    return [
      ...baseCrumbs,
      { id: "3", title: walletCode, handleClick: () => navigate('/banks/withdraw') },
      { id: "4", title: "Success" }
    ];
  } else if (walletCode) {
    return [
      ...baseCrumbs,
      { id: "3", title: walletCode, handleClick: () => navigate('/banks/withdraw') },
    ];
  }

  return baseCrumbs;
};
export const renderField = (label, value, formatter, className) => {
    if (!value) return null;
    return (
        <div>
            <label className="mb-0 text-paraColor text-sm font-medium">{label}</label>
            <p className={`mb-0 text-subTextColor text-sm font-semibold ${className}`}>
                {formatter ? formatter(value) : value || "--"}
            </p>
        </div>
    );
};