import CopyComponent from "../shared/copyComponent";

export const TransactionsCardNumberHandler = ({ cellprops }) => {
  const value = cellprops?.dataItem?.adrress || '';
    const isSpecialType = ['First Recharge', 'Top up Card', 'Consume', 'Refund', 'Fee'].includes(cellprops?.dataItem?.type);

  const formattedCardNumber = isSpecialType ? value : `${value?.slice(0, 8)}...${value?.slice(-8)}`;
  return (
    <td>
      <div className="flex gap-2 items-center">
        {formattedCardNumber || ''}
        <CopyComponent
          text={value}
          noText=""
          shouldTruncate={false}
          type=""
          className="icon copy-icon cursor-pointer text-primaryColor"
          textClass="text-primaryColor"
        />

      </div>
    </td>
  );
}