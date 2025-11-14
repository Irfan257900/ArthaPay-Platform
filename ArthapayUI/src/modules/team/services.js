import { appClientMethods as  coreClientMethods } from "../../core/http.clients";
import { decryptAES } from "../../core/shared/encrypt.decrypt";

export const VALIDATION_MESSAGES={
    "PHONE_CODE":"Please select phone code"
}
export const currentApiVersion='api/v1'


   export const TransactionsEmailHandler = ({ propsData }) => {
     const email = propsData?.dataItem?.email;
     return (
       <td className="text-left text-base font-normal text-lightWhite">
         <span className="text-lightWhite">{decryptAES(email) || "--"}</span>
       </td>
     );
}
export async function getCountryTownLu(setData, setError) {
  setError(null)
  try {
    const response = await coreClientMethods.get(`kyc/lookup`);
    setData(response);
  } catch (error) {
    setError(error.message)
  }
}
 