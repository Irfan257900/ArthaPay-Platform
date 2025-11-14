import { NumericFormat } from "react-number-format";
import AppText from "../../shared/appText";
import moment from "moment";
import { textStatusColors } from "../../../utils/statusColors";

export const renderDateCell = (cellprops) => (
    <td>
        <div>
            {cellprops.dataItem.createdDate
                ? moment.utc(cellprops.dataItem.createdDate).local().format("DD/MM/YYYY")
                : cellprops.dataItem.createdDate}
        </div>
    </td>
);
export const renderModifiedDateCell = (cellprops) => (
    <td>
        <div>
            {cellprops.dataItem.modifiedDate
                ? moment.utc(cellprops.dataItem.modifiedDate).local().format("DD/MM/YYYY")
                : cellprops.dataItem.modifiedDate}
        </div>
    </td>
);
export const renderStatusCell = (cellprops) => (
    <td>
        <span className={`${textStatusColors[cellprops.dataItem.status]} capitalize`}>
            {cellprops.dataItem.status}
        </span>
    </td>
);

export const MembershipNameCell = ({ dataItem }) => {
    return (<td>
        <div className="flex items-center gap-1 justify-between">
        <span>{dataItem?.name}</span>
        {dataItem?.isDefault && <span className='bg-defaultBadge border border-StrokeColor text-textWhite text-xs font-medium rounded-5 px-4 py-1.5'>Default</span>}
        </div>
    </td>)}
export const MembershipPriceCell = ({ dataItem }) => (
    <td>
        <AppText className="text-lightWhite text-base font-medium text-white">
            <NumericFormat
                value={dataItem?.price}
                displayType="text"
                thousandSeparator={true}
                decimalScale={2}
            />
        </AppText>
    </td>
);

export const ReferralBonusCell = ({ dataItem }) => (
    <td>
        <AppText className="text-lightWhite text-base font-medium text-white">
            <NumericFormat
                value={dataItem?.referralBonus}
                displayType="text"
                thousandSeparator={true}
                decimalScale={2}
            />
        </AppText>
    </td>
);