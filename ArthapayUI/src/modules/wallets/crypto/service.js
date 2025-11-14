import moment from "moment"
import { textStatusColors } from "../../../utils/statusColors"
import CopyComponent from "../../../core/shared/copyComponent"

export const TransactionStateHandler=({cellprops})=>{
    const status = cellprops.dataItem.state || ''
    return(
        <td>
            <span className={`text-left  text-sm font-medium ${textStatusColors[status?.toLowerCase()]}`}>
                {status}
            </span>
        </td>
    )
}

export const StateHandler = ({ status }) => {
    return (
        <span className={`text-left text-sm font-medium ${textStatusColors[status?.toLowerCase()]}`}>
            {status}
        </span>
    );
};




export const TransactionIdHandler = ({txIdProps}) => {
        const value = txIdProps?.dataItem?.txId;
        if (!value) return null;
        const shortTxId = `${value.slice(0, 4)}...${value.slice(-4)}`;
        return (
            <td className="text-left px-3 py-2 border border-borderLightGreen text-sm font-normal text-lightWhite">
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
            </td>

        );
    };

export const TransactionDateHandler=({dateProps})=>{
    const date = dateProps?.dataItem?.date
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

// as of now we are not using this function in future it may be used
// export const TransactionTxIdHandler=({propsData,handleView})=>{
//     return(
//         <td>
//         <div>
//             <button
//                 className="table-text cursor-pointer transaction-id-text text-link text-left"
//                 onClick={() => handleView(propsData?.dataItem)}>
//                 {propsData?.dataItem['txId']}
//             </button>
//         </div>
//     </td>
//     )
// }

