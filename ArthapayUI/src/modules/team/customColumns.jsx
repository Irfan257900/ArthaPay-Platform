import moment from "moment";
import { Link } from "react-router";
import { textStatusColors } from "../../utils/statusColors";
import CopyComponent from "../../core/shared/copyComponent";
import AppDefaults from "../../utils/app.config";
import IconPlaceholder from "../../core/shared/icon.placeholder";
export const RefId = (props) => {
  const { id, refId, image, fullName } = props?.dataItem;
  return (
    <td>
      {id !== AppDefaults.GUID_ID && (
        <div className="flex gap-3.5 items-center">
          <Link to={`/settings/team/member/${id}/${encodeURIComponent(fullName)}`}>
            {image && (
              <img
                src={image}
                alt={fullName}
                className="w-9 h-9 rounded-full object-cover"
              />
            )}
            {!image && (
              <IconPlaceholder width="w-9" height="h-9" background="bg-nameCircle">
                {fullName?.[0]?.toUpperCase()}
              </IconPlaceholder>
            )}
          </Link>
          <div>
            <Link
              to={`/settings/team/member/${id}/${encodeURIComponent(fullName)}`}
              className="table-text c-pointertransaction-id-text text-link cursor-pointer capitalize"
            >
              {fullName}
              <CopyComponent
                text={refId || ""}
                options={{ format: "text/plain" }}
                shouldTruncate={false}
                componentClass="block referral-copy-icon"
                textClass="text-paraColor text-sm font-medium"
              />
            </Link>
          </div>
        </div>
      )}
      {id === AppDefaults.GUID_ID && (
        <div className="flex gap-3.5 items-center">
          <IconPlaceholder width="w-9" height="h-9" background="bg-nameCircle">
            {fullName?.[0]?.toUpperCase()}
          </IconPlaceholder>
          <div>
            <span
              to={`/settings/team/member/${id}/${encodeURIComponent(fullName)}`}
              className="capitalize"
            >
              {fullName}
            </span>
          </div>
        </div>
      )}
    </td>
  );
};

export const RegDate = (props) => {
  const { registeredDate } = props.dataItem;
  return (
    <td>
      <div>
        {registeredDate
          ? moment.utc(registeredDate).local().format("DD/MM/YYYY hh:mm:ss A")
          : registeredDate}
      </div>
    </td>
  );
};
export const Status = (props) => {
  const { status } = props.dataItem;
  return (
    <td className={(status && typeof status==='string') ? textStatusColors[status.toLowerCase()] : "text-textLightRed"}>
      {status}
    </td>
  );
};

export const SelectionBox = ({ cellProps, state, handleMemberSelection }) => {
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
          onChange={() => handleMemberSelection(data)}
        />
        <span></span>{" "}
      </label>
    </td>
  );
};

export const MemberState = (props) => {
  const { customerState } = props.dataItem;
  return (
    <td
      className={
        textStatusColors[customerState?.toLowerCase()] || "text-textGreen"
      }
    >
      {customerState}
    </td>
  );
};
