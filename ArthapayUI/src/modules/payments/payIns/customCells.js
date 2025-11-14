import AppText from "../../../core/shared/appText"
import { Link } from "react-router"
import Moment from "react-moment"
import { convertUTCToLocalTime } from "../../../utils/service"
import {NumericFormat} from 'react-number-format'
// import CopyComponent from
export const statusTextColors = {
    'NotPaid': 'text-blue',
    'Not Paid': 'text-blue',
    'Paid': 'text-green',
    'Failed': 'text-requiredRed',
    'Cancelled': 'text-requiredRed'
}

export const DateComponent = (cellProps) => {
    const link = cellProps.dataItem
    return (<td>
        <Link className="text-lightWhite text-base font-medium text-link c-pointer" to={`payin/${link?.id}/${link?.merchantName}/view/${link?.type}`}>
            {link?.date && <Moment format="DD/MM/YYYY hh:mm:ss A">
                {convertUTCToLocalTime(link?.date)}
            </Moment>}
        </Link>
    </td>)
}

export const Amount = (cellprops) => {
    const amount = cellprops.dataItem.amount
    return (
        <td>
            <AppText className="text-lightWhite text-base font-medium text-white">
                <NumericFormat value={amount} displayType="text" thousandSeparator={true} decimalScale={4} fixedDecimalScale={4} />
            </AppText>
        </td>
    )
}

export const Coin = (cellprops) => {
    const coin = cellprops.dataItem.currency
    return (<td>
        <AppText className="text-lightWhite text-base font-medium text-white">
            <span className={`crypto coin sm ${coin?.toLowerCase()}`}></span> {coin}
        </AppText>
    </td>)
}

export const Status = (cellprops) => {
    const status = cellprops.dataItem.status || ''
    return (
        <td>
            <span className={`text-lightWhite text-base font-medium text-green ${statusTextColors[status] || ''}`}>
                {status}
            </span>
        </td>
    )
}

export const SelectionBox = ({ cellProps, state, handleLinkSelection }) => {
    const link = cellProps.dataItem;
    return <td key={link.id} className="text-center">
        {" "}
        <label className="text-center custom-checkbox">
            <input
                id={link.id}
                name="check"
                type="checkbox"
                checked={state.selectedPayin?.id === link?.id}
                onChange={() => handleLinkSelection(link)}
            />
            <span></span>{" "}
        </label>
    </td>
}