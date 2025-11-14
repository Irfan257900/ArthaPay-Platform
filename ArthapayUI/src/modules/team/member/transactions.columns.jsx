import moment from "moment";
import { textStatusColors } from "../../../utils/statusColors";
import CopyComponent from "../../../core/shared/copyComponent";

export const TransactionId = ({ data, handleClick }) => {
  return (
    <td>
      <div>
        <button
          className="table-text cursor-pointer transaction-id-text text-link text-left"
          onClick={() => handleClick(data)}
        >
          <CopyComponent
          text={data?.["transactionId"] || ""}
          options={{ format: "text/plain" }}
          shouldTruncate={false}
          componentClass="block referral-copy-icon"
          textClass="table-text cursor-pointer transaction-id-text text-link text-left"
        />
        </button>
      </div>
    </td>
  );
};

export const TransactionDate = (cellProps) => {
  const { date } = cellProps.dataItem || {};
  return (
    <td>
      <div>
        {date
          ? moment.utc(date).local().format("DD/MM/YYYY hh:mm:ss A")
          : date}
      </div>
    </td>
  );
};

export const TransactionStatus = (cellProps) => {
    const {state}=cellProps.dataItem || {}
  return (
    <td>
      <span
        className={textStatusColors[state || "Approved"]}
      >
        {state}
      </span>
    </td>
  );
};
