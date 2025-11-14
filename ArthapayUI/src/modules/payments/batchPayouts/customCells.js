import AppText from "../../../core/shared/appText"
import { Link } from "react-router"
export const statusTextColors = {
    'NotPaid': 'text-blue',
    'Not Paid': 'text-blue',
    'Paid': 'text-green',
    'Failed': 'text-requiredRed',
    "Cancelled" :'text-requiredRed',
    "Processed" : 'text-green',
    "Submitted" : 'text-blue',
    "Rejected" : "text-requiredRed",
}

export const BatchNameComponent = (cellProps) => {
    const link = cellProps.dataItem
    return (<td>
        <div>
          <Link
            to={`payout/${link?.id}/${link?.batchName}/view`}
            className="text-lightWhite text-base font-medium c-pointertransaction-id-text text-link c-pointer"
          >
            {link['batchName']}
          </Link>
        </div>
      </td>)
}


export const Coin = (cellprops) => {
    const coin = cellprops.dataItem.token
    return (<td>
        <AppText className="text-lightWhite text-base font-medium">
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
                checked={state[0]?.id === link?.id}
                onChange={() => handleLinkSelection(link)}
            />
            <span></span>{" "}
        </label>
    </td>
}