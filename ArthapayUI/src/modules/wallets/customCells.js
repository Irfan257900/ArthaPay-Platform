import { useTranslation } from 'react-i18next';
import moment from 'moment/moment';
import { textStatusColors } from '../../utils/statusColors';
export const WalletscryptoTranscations = [
    {
        field: 'txId',
        title: 'Transaction ID',
        filter: false,
        filterType: 'text',
        sortable: false,
        width: 180,
    },
       {
            field: "date",
            title: "Date",
            width: 180,
            filter: false,
            sortable: false,
            customCell: (props) => (
                <td className="text-left px-3 py-2 border border-borderLightGreen text-sm font-normal text-lightWhite">
                    <div>
                        {
                            props.dataItem.date
                                ? moment.utc(props.dataItem.date).local().format("DD/MM/YY hh:mm A")
                                : props.dataItem.date
                        }
                    </div>
                </td>
            ),
        },
        {
            field: 'walletCode',
            title: 'Wallet',
            filter: false,
            filterType: 'text',
            sortable: false,

        },
        {
            field: 'amount',
            title: 'Value',
            filter: false,
            filterType: 'text',
            sortable: false,
        },
];

export function WalletsColumns() {
    const { t } = useTranslation(); 
    return [
      {
        field: 'transactionType',
        title: t('vaults.Type'),
        filter: false,
        sortable: false,
        width: 100,
        customCell: (customCell) => (
            <td className="text-left   text-sm font-normal text-lightWhite">
                <div className="flex items-center gap-2">
                <span className={`${customCell?.dataItem?.transactionType === 'Withdraw Crypto' ? 'icon withdraw' : 'icon deposit'}`}></span>
                <span>{customCell?.dataItem?.transactionType}</span>
                </div>
            </td>
        )
    },
       {
            field: "transactionDate",
            title: t('vaults.Date'),
            width: 100,
            filter: false,
            sortable: false,
            customCell: (props) => (
                <td className="text-left px-3 py-2 border border-borderLightGreen text-sm font-normal text-lightWhite">
                    <div>
                        {
                            props.dataItem.transactionDate
                                ? moment.utc(props.dataItem.transactionDate).local().format("DD/MM/YY hh:mm A")
                                : props.dataItem.transactionDate
                        }
                    </div>
                </td>
            ),
        },
        {
        field: 'amount',
        title: t('vaults.Amount'),
        filter: false,
        sortable: false,
        filterType: "text",
        width: 100,
    },
    {
        field: 'status',
        title: t('vaults.Status'),
        filter: false,
        filterType: "text",
        sortable: false,
        width: 100,
        customCell: (cellprops) => {
            const status = cellprops?.dataItem?.status || '';
            return (
                <td>
                    <span className={` ${textStatusColors[status?.toLowerCase()]}`}>
                        {status}
                    </span>
                </td>
            );
        }
    }
    ]};
