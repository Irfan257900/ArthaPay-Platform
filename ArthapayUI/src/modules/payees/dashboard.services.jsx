import { useTranslation } from "react-i18next";

const statusColor = {
    active: "text-textGreen",
    submitted: "text-darkyellowStatus",
    completed: "text-textGreen",
    paid: "text-textGreen",
    "not paid": "text-darkyellowStatus",
    failed: "text-textLightRed",
    cancelled: "text-textLightRed",
    inactive: "text-textLightRed",
    pending: "text-darkyellowStatus",
    approved:"text-textGreen"
}
export function CryptoColoumns() {
    const { t } = useTranslation(); 
    return [{
        field: 'favoriteName',
        title: t('payees.dashboard.Favorite Name'),
        filter: false,
        sortable: false,
        width: 40,
    },
    {
        field: "coin",
        title: t("payees.dashboard.Currency"),
        width: 40   ,
        filter: false,
        sortable: false,
        customCell: (cellprops) => {
            return (
                <td>
                    {cellprops?.dataItem?.coin}{' '}({cellprops?.dataItem?.network})
                </td>
            )
        }
    },
    {
        field: 'state',
        title: t('payees.dashboard.State'),
        width: 40,
        filter: false,
        sortable: false,
        customCell: (cellprops) => {
            const status = cellprops.dataItem.state || ''
            return (
                <td>
                    <span className={`text-left  text-sm font-medium ${statusColor[status?.toLowerCase()]}`}>
                        {status}
                    </span>
                </td>
            )
        }
    },

]}
export function FiatColoumns() {
    const { t } = useTranslation(); 
 return [
    {
        field: 'favoriteName',
        title: t('payees.dashboard.Favorite Name'),
        filter: false,
        sortable: false,
        width: 40,
    },
    {
        field: "coin",
        title: t("payees.dashboard.Currency"),
        width: 40,
        filter: false,
        sortable: false,
        customCell: (cellprops) => (
            <td className="text-left  text-sm font-normal text-lightWhite">
                <div className=" flex gap-2 items-center">
                    <img src={cellprops?.dataItem?.logo} className="h-6 w-6 rounded-full" />
                    <span>{cellprops?.dataItem?.coin}</span>
                </div>
            </td>
        )
    },
    {
        field: 'state',
        title: t('payees.dashboard.State'),
        width: 50,
        filter: false,
        sortable: false,
        customCell: (cellprops) => {
            const status = cellprops.dataItem.state || ''
            return (
                <td>
                    <span className={`text-left  text-sm font-medium ${statusColor[status?.toLowerCase()]}`}>
                        {status}
                    </span>
                </td>
            )
        }
    },

]}