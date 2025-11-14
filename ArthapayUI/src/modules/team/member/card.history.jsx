import React from "react";
import List from "../../../core/grid.component";
import { ActionByStatusColor, DateHandler } from "./cards.columns";
import { currentApiVersion } from "../services";
const baseURL = `${window.runtimeConfig.VITE_CORE_API_END_POINT}`
function CardHistroy() {;
  const renderDateHandler = (cellProps) => {
    return (
      <DateHandler
        cellProps={cellProps?.dataItem}
      />
    )
  }
  const renderActionBy = (cellProps) => {
    return (
      <ActionByStatusColor
        cellProps={cellProps?.dataItem}
      />
    )
  }
  const gridColumns = [
    {
      field: "createdDate",
      title: "Date",
      filter: false,
      filterType: "date",
      width: 220,
      customCell: renderDateHandler
    },
    {
      field: 'createdBy',
      title: 'Action By',
      filter: false,
      filterType: "text",
      width: 180,
    },
    {
      field: 'action',
      title: 'Action',
      filter: false,
      filterType: "text",
      width: 180,
      customCell: renderActionBy
    },
  ]
  return (
    <div>
      <div className="">
        <h4 className="text-md text-lightWhite font-semibold mb-2">Card History </h4>
        <div>
          <List
            url={`${baseURL}/${currentApiVersion}/teams/member/cards/history/all`}
            pSize={10}
            columns={gridColumns}
          />
        </div>
      </div>
    </div>
  );
}
export default CardHistroy;