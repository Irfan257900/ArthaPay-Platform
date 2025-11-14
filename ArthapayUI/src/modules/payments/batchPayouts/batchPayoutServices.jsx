import { useCallback } from "react";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import AppText from "../../../core/shared/appText";
import { NumericFormat } from "react-number-format";

export const ItemRow = ({ data, selectPayout, selectedPayout,handleListModalClose }) => {
    const badgeColors = {
      Submitted: "!text-submiteted !border !border-submiteted",
      Approved: "!text-paidApproved !border !border-paidApproved",
      Processing: "!text-notPaid !border !border-notPaid",
      Cancelled: "!text-canceled !border !border-canceled",
      Processed: "!text-notPaid !border !border-notPaid",
    };

    const payoutToSelect= useCallback((item)=>{
      selectPayout(item)
    },[])

    return (
      <ListDetailLayout.ListItem
        data={data}
        itemFields={{
          id: "id",
          title: "batchName",
          logo: "logo",
          status: "status",
        }}
        selectedRow={selectedPayout}
        onItemSelect={payoutToSelect}
        hasStatusBadge={true}
        badgeColor={badgeColors}
        handleListModalClose={handleListModalClose}
        ItemDescription={
          <div className="coin-fillname">
            {`${data?.token} (${data?.network})`}
            <AppText className="fw-600 text-upper text-secondary d-block"></AppText>
          </div>
        }
      >
        <span className="coin-val coinval-width ml-4 flex">
          <NumericFormat value={data?.totalAmount} displayType="text" decimalScale={4} thousandSeparator={true}/> {data?.token}
        </span>
      </ListDetailLayout.ListItem>
    );
  };

export const statusToaster = "Batch Pay-Out status has successfully changed."
  