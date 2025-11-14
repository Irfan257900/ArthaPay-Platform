import CopyComponent from "../../core/shared/copyComponent";

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
