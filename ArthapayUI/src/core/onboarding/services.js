import { notification } from "antd";

export const kyckybTitles = {
    "Vaults":"To unlock the vaults feature,",
    "Exchange":"To unlock the exchange feature,",
    "Cards":"To unlock the cards feature,",
    "Payments":"To unlock the payments feature,",
    "default":"To unlock the application,",
    "Banks":"To unlock the banks feature,"
}



export function openNotification(message) {
    const args = {
        description:message,
        duration: 3,
    };
    notification.open(args);
}
export const tosterMessages ={
    success:"Company details saved successfully",
    update:"Company details updated successfully",
    delete:"Company details deleted successfully",
    UBOSuccessMsg:"UBO details saved successfully",
    UBOUpdateMsg:"UBO details updated successfully",
    UBODeleteMsg:"UBO details deleted successfully",
    UBOSSuccessMsg:"UBOs details saved successfully",
    DirectorsSuccessMSg:"Directores details saved successfully",
    DirectorSuccessMsg:"Director details saved successfully",
    DirectorUpdateMsg:"Director details updated successfully",
    DirectorDeleteMsg:"Director details deleted successfully"
}
export const errorMessages = {
    documentsError: "All document types cannot be the same.",
    UBORequiredMsg: "Please add atleast one ubo.",
    DirectorRequiredMsg: "Please add atleast one director.",
}
export const reKycIconTitle = "This action is required due to a KYC compliance check. Please re-submit your details.";