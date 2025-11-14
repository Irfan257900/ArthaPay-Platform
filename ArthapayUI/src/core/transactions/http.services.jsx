import { ApiControllers } from "../../api/config";
import { appClientMethods } from "../http.clients";
 
export const fetchTransactionDetails = async ({
  setLoader,
  setData,
  setError,
  txId,
}) => {
  setLoader(true);
  try {
    setData(await appClientMethods.get(`transactions/${txId}`));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoader(false);
  }
};
 
export const downloadTransaction = async ({
  setLoader,
  onSuccess,
  onError,
  txId,
  type,
}) => {
  setLoader(true);
  try {
    onSuccess(
      await appClientMethods.get(`transaction/download?id=${txId}`)
    );
  } catch (error) {
    onError(error.message);
  } finally {
    setLoader(false);
  }
};
 
export async function fetchLookups({ setLoader, setData, setError }) {
  setLoader(true);
  try {
    setData(await appClientMethods.get(`transactions/lookup`));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoader(false);
  }
}
 
export const paymentsTransactionDetails = async (txId) => {
  return appClientMethods.get(
    ApiControllers.exchangeTransaction + `transaction/${txId}`
  );
};
export const cardsTransactionDetails = async (txId) => {
  return appClientMethods.get(
    ApiControllers.cardsWallet + `/Cards/Transaction/${txId}`
  );
};
 
export const exchangeTransactionDetails = async (txId) => {
  return appClientMethods.get(
    ApiControllers.exchangeTransaction + `Transaction/${txId}`
  );
};
 
 
export const fetchVaultsLookUp=async({ setLoader, setData, setError })=>{
    setLoader(true);
  try {
    setData(await appClientMethods.get(`vaults/crypto`));
  } catch (error) {
    setError(error.message);
  } finally {
    setLoader(false);
  }
}