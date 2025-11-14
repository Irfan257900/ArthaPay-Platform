import React, { useCallback, useState } from 'react'
import List from '../../../core/grid.component'
import { useParams } from 'react-router'
import { renderTransactionId, TransDateHandler, TransStateColor } from './cards.columns'
import CommonDrawer from '../../../core/shared/drawer'
import CardsDetails from '../../../core/transactions/transaction'
import { currentApiVersion } from '../services'
const baseURL =  `${window.runtimeConfig.VITE_CORE_API_END_POINT}`
const CardTransection = () => {
  const {cardId} = useParams();
  const [isViewDrawer, setISViewDrawer] = useState(false)
  const [handleViewData, setHandleViewData] = useState({})
  const renderDateHandler = (cellProps) => {
    return (
      <TransDateHandler
        cellProps={cellProps}
      />
    )
  }
  const renderStateHandler = (cellProps) => {
    return (
      <TransStateColor
        cellProps={cellProps}
      />
    )
  }
  const gridColumns = [
    {
      field: 'transactionId',
      title: 'Transaction ID',
      filter: false,
      filterType: "text",
      width: 140,
      customCell: (cellProps) => renderTransactionId(cellProps, handleView)
    },
    {
      field: "date",
      title: "Date",
      filter: false,
      filterType: "date",
      width: 160,
      customCell: renderDateHandler
    },
    {
      field: 'type',
      title: 'Type',
      filter: false,
      filterType: "text",
      width: 150,
    },
    {
      field: 'amount',
      title: 'Amount',
      filter: false,
      filterType: "text",
      width: 100,
      sortable: false,
    },
    {
      field: 'state',
      title: 'Status',
      width: 120,
      filter: false,
      sortable: false,
      customCell: renderStateHandler
    }
  ]
  const handleView = (data) => {
    setISViewDrawer(true)
    setHandleViewData(data)
  }
  const isCloseDrawer = useCallback(() =>{
    setISViewDrawer(false)
  }, []);
  return (
    <div>
      <div className="">
        <h4 className="text-md text-lightWhite font-semibold mb-2">Card Transactions</h4>
        <div>
          <List
            url={`${baseURL}/${currentApiVersion}/teams/member/cards/${cardId}/transactions`}
            pSize={10}
            columns={gridColumns}
          />
        </div>
        {<CommonDrawer title={`Transaction Details  `} isOpen={isViewDrawer} onClose={isCloseDrawer}     >
          {isViewDrawer && <CardsDetails data={handleViewData} onClose={isCloseDrawer} />}
        </CommonDrawer>}
      </div>
    </div>
  )
}
export default CardTransection
