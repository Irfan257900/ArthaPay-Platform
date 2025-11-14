import moment from "moment";
import { NumericFormat } from "react-number-format";
import AppDefaults from "../../utils/app.config";
import { textStatusColors } from "../../utils/statusColors";
import CopyComponent from "../../core/shared/copyComponent";
import { Link } from "react-router";
export const PaymentLinksColoumns = [
    {
        field: "createdDate",
        title: "Date",
        filter: false,
        filterType: "date",
        sortable: false,
        width: 100,
        customCell: (cellprops) => {
            const formattedDate = moment(cellprops?.dataItem?.createdDate).format('DD-MM-YYYY');
            return (<td>
                <div>
                    <Link to={`/transactions/payments/${formattedDate}`}
                        className="text-left  text-sm font-normal text-link c-pointer"
                    >
                        {
                            cellprops.dataItem.createdDate
                                ? moment.utc(cellprops?.dataItem?.createdDate).local().format("DD/MM/YYYY hh:mm:ss A")
                                : cellprops.dataItem.createdDate
                        }
                    </Link>
                </div>
            </td>)
        },
    },
    {
        field: 'invoiceNo',
        title: 'Invoice No',
        filter: false,
        sortable: false,
        width: 100,
    },
    {
        field: 'merchantName',
        title: 'Vault',
        filter: false,
        filterType: "text",
        sortable: false,
        width: 60,
        customCell: (cellprops) => (
            <td className="text-left   text-sm font-normal text-lightWhite">
                {cellprops?.dataItem?.merchantName}
            </td>
        )
    },
    {
        field: 'currency',
        title: 'Coin',
        filter: false,
        filterType: 'text',
        sortable: false,
        width: 60,
        customCell: (cellprops) => (
            <td className="text-left  text-sm font-normal text-lightWhite">
                <div className=" flex gap-2 items-center">
                    <img src={cellprops?.dataItem?.logo} alt="img" className="h-6 w-6 rounded-full" />
                    <span>{cellprops?.dataItem?.currency}</span>
                </div>
            </td>
        )
    },

    {
        field: 'network',
        title: 'Network',
        filter: false,
        filterType: "text",
        sortable: false,
        width: 60,
        customCell: (cellprops) => (
            <td className="text-left  text-sm font-normal text-lightWhite">
                {cellprops?.dataItem?.network}
            </td>
        )
    },
    {
        field: 'walletAddress',
        title: 'Wallet Address',
        filter: false,
        filterType: "text",
        sortable: false,
        width: 140,
        customCell: (cellprops) => {
            const address = cellprops.dataItem.walletAddress
            return <td className="text-left  text-sm font-normal text-lightWhite">
                <span>{address && <CopyComponent prefixChars={8} suffixChars={8} text={address} />}</span>
            </td>
        }
    },
    {
        field: 'amount',
        title: 'Amount',
        filter: false,
        filterType: 'numeric',
        sortable: false,
        width: 60,
        customCell: (cellprops) => (<td className="text-left  text-sm font-normal text-lightWhite">
            <NumericFormat value={cellprops?.dataItem?.amount || 0} displayType="text" thousandSeparator={true} decimalScale={AppDefaults.cryptoDecimals} fixedDecimalScale={AppDefaults.cryptoDecimals} />
        </td>
        )
    },
    {
        field: 'paymentType',
        title: 'Payment Type',
        filter: false,
        filterType: "text",
        sortable: false,
        width: 100,
        customCell: (cellprops) => (
            <td className="text-left   text-sm font-normal text-lightWhite">
                {cellprops?.dataItem?.paymentType}
            </td>
        )
    },
    {
        field: 'status',
        title: 'Status',
        filter: false,
        filterType: "text",
        sortable: false,
        width: 50,
        customCell: (cellprops) => {
            const status = cellprops.dataItem.status || ''
            return (
                <td>
                    <span className={`text-left  text-sm font-medium ${textStatusColors[status?.toLowerCase()]}`}>
                        {status}
                    </span>
                </td>
            )
        }
    }
];



export const transactionColoumns = [
    {
        field: 'transactionType',
        title: 'Action',
        filter: false,
        sortable: false,
        width: 60,
        customCell: (customCell) => (
            <td className="text-left text-sm font-normal text-lightWhite">
                {/* <div className="  flex items-center  "> */}
                <span className={`${customCell?.dataItem?.transactionType === 'Withdraw' ? 'icon withdraw mr-1' : 'icon deposit mr-1'}`}></span>
                {/* </div> */}

            </td>

        )
    },
    {
        field: "transactionDate",
        title: "Date",
        width: 100,
        filter: false,
        sortable: false,
        customCell: (props) => (
            <td className="text-left   text-sm font-normal text-lightWhite">
                <div>
                    {
                        props.dataItem.transactionDate
                            ? moment.utc(props.dataItem.transactionDate).local().format("DD/MM/YYYY hh:mm:ss A")
                            : props.dataItem.transactionDate
                    }
                </div>
            </td>

        ),
    },
    {
        field: 'currency',
        title: 'Coin',
        filter: false,
        filterType: 'text',
        sortable: false,
        width: 110,
        customCell: (cellprops) => (
            <td className="text-left  text-sm font-normal text-lightWhite">
                <div className=" flex gap-2 items-center">
                    <img src={cellprops?.dataItem?.logo} className="h-6 w-6 rounded-full" />
                    <div>
                        <span>{cellprops?.dataItem?.wallet}</span>
                        <p>{cellprops?.dataItem?.network}</p>
                    </div>
                </div>
            </td>
        )
    },

    {
        field: 'value',
        title: 'Amount',
        width: 80,
        filter: false,
        sortable: false,
        customCell: (cellprops) => (<td className="text-left  text-sm font-normal text-lightWhite">
            <NumericFormat value={cellprops?.dataItem?.amount || 0} displayType="text" thousandSeparator={true} decimalScale={AppDefaults.cryptoDecimals} fixedDecimalScale={AppDefaults.cryptoDecimals} />
        </td>)
    },
    {
        field: 'status',
        title: 'Status',
        filter: false,
        sortable: false,
        customCell: (cellprops) => (
            <td className="text-left  text-sm font-normal text-lightWhite">
                <span className={textStatusColors[cellprops?.dataItem?.status?.toLowerCase()]}>{cellprops?.dataItem?.status}</span>
            </td>
        )
    },

]