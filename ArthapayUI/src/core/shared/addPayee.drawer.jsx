import CommonDrawer from "./drawer";
import CustomButton from "../button/button";
import { useNavigate } from "react-router";
import FiatForm from "../../modules/payees/fiat/form";
import CryptoForm from "../../modules/payees/crypto/form";
import { useCallback } from "react";
const isOnTheGoEnabled=window.runtimeConfig.VITE_APP_PAYEE_ON_THE_GO_MODE
const AddPayeeDrawer = ({ isOpen, onClose, payeeType,onSuccess,onCancel,selectedCoin,selectedNetwork,isBaas=false, }) => {
  const navigate = useNavigate();
  const navigateTo = useCallback(() => {
    if(payeeType==='fiat'){
      const baseUrl='/payees/fiat/00000000-0000-0000-0000-000000000000/new/add'
     navigate(selectedCoin ? `${baseUrl}?currency=${selectedCoin}&isBaas=${isBaas}` : `${baseUrl}?isBaas=${isBaas}`);
    }else{
      navigate((selectedCoin && selectedNetwork) ? `/payees/crypto/00000000-0000-0000-0000-000000000000/new/add?coin=${selectedCoin}&network=${selectedNetwork}`: `/payees/crypto/00000000-0000-0000-0000-000000000000/new/add`)
    }
  }, [payeeType,selectedCoin,selectedNetwork]);
  return (
    <CommonDrawer
      title={isOnTheGoEnabled==='true' ? 'Add Payee' : `Quick Information`}
      isOpen={isOpen}
      onClose={onClose}
    >
      {isOnTheGoEnabled==='false' && 
      <>
      <ul className="list-disc pl-5">
      <li className="text-paraColor font-medium mb-3">
      Only approved payees will be available for transactions.
      </li>
      <li className="text-paraColor font-medium  mb-3">
      Approval may take some time. You will be notified once it's done.
      </li>
      <li className="text-paraColor font-medium mb-3">
      Ensure the payee details are accurate to avoid delays.
      </li>
      <li className="text-paraColor font-medium mb-3">
      Once approved, payees will be visible in your list automatically.
      </li>
      <li className="text-paraColor font-medium mb-3">
      You can track the status in the payees section.
      </li>
      </ul>
      
      <div className="flex justify-end items-center md:space-x-4 md:mt-5 flex-col-reverse md:flex-row">
        <CustomButton htmlType="reset" onClick={onClose}>
          cancel
        </CustomButton>
        <CustomButton type="primary" onClick={navigateTo}>
          <span>ADD PAYEE</span>
        </CustomButton>
      </div>
      </>
      }

      {isOnTheGoEnabled==='true' && 
      <>
      {payeeType==='fiat' && <FiatForm isDrawer={true} onSuccess={onSuccess} onCancel={onCancel} selectedCurrency={selectedCoin} isBaas={isBaas} IsOnTheGo={true} mode={'add'} />}
      {payeeType==='crypto' && <CryptoForm isDrawer={true} onSuccess={onSuccess} onCancel={onCancel} selectedCoin={selectedCoin} selectedNetwork={selectedNetwork} IsOnTheGo={true} mode={'add'} />}
      </>
      }
      
      
    </CommonDrawer>
  );
};

export default AddPayeeDrawer;
