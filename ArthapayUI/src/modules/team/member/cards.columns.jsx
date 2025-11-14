import { Link } from "react-router";
import { AssignedCardsTextStatus, textStatusColors } from "../../../utils/statusColors";
import moment from "moment";
export const CardName = (props) => {
  const { id, firstName } = props?.dataItem || {};
  return (
    <td>
      <div>
        <Link
          className="cursor-pointer !text-primaryColor"
          to={`/settings/team/member/${id}/${firstName}`}
        >
          {firstName}
        </Link>
      </div>
    </td>
  );
};
export const Status = (props) => {
  const { state } = props.dataItem || {};
  return (
    <td className={AssignedCardsTextStatus[state.toLowerCase()] || "text-textGreen"}>
      {state}
    </td>
  );
};
export const SelectionBox = ({ cellProps, state, handleCardSelection }) => {
  const data = cellProps.dataItem;
  return (
    <td key={data.id} className="text-center">
      {" "}
      <label className="text-center custom-checkbox">
        <input
          id={data.id}
          name="check"
          type="checkbox"
          checked={state.selection?.id === data?.id}
          onChange={() => handleCardSelection(data)}
        />
        <span></span>{" "}
      </label>
    </td>
  );
};
export const DateHandler = (props) => (
  <td>
    <div>
      {
        props?.cellProps?.createdDate
          ? moment.utc(props?.cellProps?.createdDate).local().format("DD/MM/YYYY hh:mm:ss A")
          : props?.cellProps?.createdDate
      }
    </div>
  </td>
)
export const ActionByStatusColor = (props) => {
  const { action } = props.cellProps;
  return (
    <td className={textStatusColors[action?.toLowerCase()] || "text-textGreen"}>
      {action}
    </td>
  );
}
export const TransDateHandler = (props) => {
  return (
    <td>
      <div>
        {
          props?.cellProps?.dataItem?.date
            ? moment.utc(props?.cellProps?.dataItem?.date).local().format("DD/MM/YYYY hh:mm:ss A")
            : props?.cellProps?.dataItem?.date
        }
      </div>
    </td>
  )
}
export const TransStateColor = ({ cellProps }) => {
  const { state } = cellProps.dataItem;
  return (
    <td className={textStatusColors[state?.toLowerCase()] || "text-textGreen"}>
      {state}
    </td>
  );
};
export const CardImage = (memberId, refId, props) => {
  const { id, name, image, cardNumber } = props || {};
  const formattedCardNumber = cardNumber ? `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 8)} XXXX XXXX` : '';
  return (
    <td>
      <div className="flex gap-3.5">
        <Link to={`/settings/team/member/${memberId}/${encodeURIComponent(refId)}/cards/${id}/${name}?mainTab=Cards`}>
          <img
            src={image}
            alt=""
            className="w-14 h-9 object-cover rounded-5"
          />
        </Link>
        <div>
          <Link
            to={`/settings/team/member/${memberId}/${encodeURIComponent(refId)}/cards/${id}/${name}?mainTab=Cards`}
            className="text-sm font-medium !text-primaryColor"
          >
            {name}
            <h4 className="text-lighttext text-xs font-medium">{formattedCardNumber}</h4>
          </Link>
        </div>
      </div>
    </td>
  );
}
export const renderTransactionId = (propsData, handleView) => (
  <td>
    <div>
      <button
        className="table-text c-pointertransaction-id-text text-link c-pointer"
        onClick={() => handleView(propsData?.dataItem)}>
        {propsData?.dataItem['transactionId']}
      </button>
    </div>
  </td>
);