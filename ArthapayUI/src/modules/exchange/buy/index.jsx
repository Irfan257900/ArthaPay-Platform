import { useState, useCallback, useEffect } from "react";
import Buy from "./buy";
import { useDispatch } from "react-redux";
import {
  resetState,
} from "./store.reducer";
import Summary from "./summary";
import Success from "./success";
import { BuySellViewLoader } from "../../../core/skeleton/buysell";

const BuyComponent = ({ classNames = {}, stepConfigs = {} }) => {
  const [step, setStep] = useState(0);
  const [stepProps, setStepProps] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    setStep(1)
    return () =>{
      dispatch(resetState())
    };
  }, []);
  const onValidInputs = useCallback((props) => {
    setStep(2);
    stepConfigs.widget?.onSuccess?.(props)
    setStepProps({ ...(props || {}), isCryptoAction: props?.isCrypto });
  }, [stepConfigs.widget?.onSuccess]);

  const onSuccess = useCallback((props) => {
    setStep(3);
    stepConfigs.summary?.onSuccess?.(props)
    setStepProps({ ...(props || {}) });
  }, [stepConfigs.summary?.onSuccess]);
  const onClose = useCallback(() => {
    setStep(1);
  }, []);
  const onSuccessOk = useCallback((props) => {
    setStep(1);
    stepConfigs.success?.onOk?.(props)
  }, [stepConfigs.success?.onOk]);
  return (
    <div>
      {step===0 && <BuySellViewLoader widgetClass={classNames?.widget?.root} withHeader={false}/>}
      {step === 1 && (
        <div>
          <Buy
            classNames={classNames.widget}
            onSuccess={onValidInputs}
            onError={stepConfigs.widget?.onError}
            onCryptoChange={stepConfigs.widget?.onCryptoChange}
            setFirstAsDefault={true}
          />
        </div>
      )}
      {step === 2 && (
        <div>
          <Summary
            {...stepProps}
            onClose={onClose}
            classNames={classNames.summary}
            onSuccess={onSuccess}
            onError={stepConfigs.summary?.onError}
          />
        </div>
      )}
      {step === 3 && (
        <div>
          <Success
            classNames={classNames.success}
            onOk={onSuccessOk}
          />
        </div>
      )}
    </div>
  );
};

export default BuyComponent;
