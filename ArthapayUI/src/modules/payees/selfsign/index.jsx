import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import SignatureReview from "./signatureReview";
import OtherWallets from "./otherWallet";
import { selfSignAssets } from "./utils/assets";
import Provider from "./provider";
import Loader from "../../../core/shared/loader";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
const EthSign = lazy(() => import("./wagmi/sign"));
const TronSign = lazy(() => import("./tronWallets/sign"));
const Ledger = lazy(() => import("./ledger"));
const Trezor = lazy(() => import("./trezor"));
const BlueWallet = lazy(() => import("./blueWallet"));
const { wagmi, tron, trezor, ledger, allAssets } = selfSignAssets;
const DefaultLoader = () => {
  return <div className="text-center block mt-4">Loading...</div>;
};
const SignComponents = ({
  message,
  asset,
  addressFormat = "default",
  onSignatureComplete,
  onSignatureFailure,
  loader,
  componentClass = "",
  buttonsClass = "",
  saving,
  imageClass = "",
  formData
}) => {
  const [signingThrough, setSigningThrough] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const onSuccess = useCallback(
    async (response) => {
      try {
        const _obj = {
          walletAddress: response.address,
          hash: response.sign,
          message,
        };
        onSignatureComplete(
          _obj,
          () => {
            setIsSigning(false);
            setSigningThrough("");
            setIsSuccess(true);
          },
          () => {
            setIsSigning(false);
            setSigningThrough("");
          }
        );
      } catch (errorMsg) {
        onSignatureFailure(errorMsg.message || errorMsg.toString());
        setSigningThrough("");
        setIsSigning(false);
      }
    },
    [message, asset]
  );
  const onError = useCallback(
    (response) => {
      onSignatureFailure(response);
      setSigningThrough("");
      setIsSigning(false);
    },
    [message, asset]
  );

  if (
    !asset ||
    asset === "null" ||
    asset === "undefined" ||
    !message ||
    message === "null" ||
    message === "undefined"
  ) {
    return null;
  }
  return (
    <Provider asset={asset}>
      {saving && <ContentLoader />}
      {!saving && (
        <div className={componentClass}>
          {signingThrough && (
            <SignatureReview
              message={message}
              signingThrough={signingThrough}
              setSigningThrough={setSigningThrough}
              onError={onError}
              onSuccess={onSuccess}
              asset={asset}
              addressFormat={addressFormat}
              setError={onError}
              isSigning={isSigning}
              setIsSigning={setIsSigning}
              imageClass={imageClass}
            />
          )}
          {!signingThrough && !isSuccess && (
            <>
              {wagmi.includes(asset) && (
                <Suspense fallback={loader || <DefaultLoader />}>
                  <EthSign
                    message={message}
                    asset={asset}
                    onSuccess={onSuccess}
                    onError={onError}
                    setSigningThrough={setSigningThrough}
                    setError={onError}
                    addressFormat={addressFormat}
                    btnClassName={buttonsClass}
                    imageClass={imageClass}
                    formData ={formData}
                  />
                </Suspense>
              )}
              {tron.includes(asset) && (
                <Suspense fallback={loader || <DefaultLoader />}>
                  <TronSign
                    message={message}
                    asset={asset}
                    onSuccess={onSuccess}
                    onError={onError}
                    setSigningThrough={setSigningThrough}
                    setError={onError}
                    addressFormat={addressFormat}
                    btnClassName={buttonsClass}
                    imageClass={imageClass}
                    formData ={formData}
                  />
                </Suspense>
              )}
              {/* currently hided this in future it may required */}
               {ledger.includes(asset) && (
                <Suspense fallback={loader || <DefaultLoader />}>
                  <Ledger
                    message={message}
                    asset={asset}
                    onSuccess={onSuccess}
                    onError={onError}
                    setSigningThrough={setSigningThrough}
                    setError={onError}
                    addressFormat={addressFormat}
                    btnClassName={buttonsClass}
                    imageClass={imageClass}
                  />
                </Suspense>
              )}
              {trezor.includes(asset) && (
                <Suspense fallback={loader || <DefaultLoader />}>
                  <Trezor
                    message={message}
                    asset={asset}
                    onSuccess={onSuccess}
                    onError={onError}
                    setSigningThrough={setSigningThrough}
                    setError={onError}
                    addressFormat={addressFormat}
                    btnClassName={buttonsClass}
                    imageClass={imageClass}
                  />
                </Suspense>
              )}
             {/* {asset !== "btc" && (
                <Suspense fallback={loader || <DefaultLoader />}>
                  <BlueWallet
                    setError={onError}
                    btnClassName={buttonsClass}
                    setSigningThrough={setSigningThrough}
                    imageClass={imageClass}
                  />
                </Suspense>
              )} 
               <OtherWallets
                signingThrough={signingThrough}
                message={message}
                asset={asset}
                onSuccess={onSuccess}
                onError={onError}
                setSigningThrough={setSigningThrough}
                setError={onError}
                addressFormat={addressFormat}
                isSigning={isSigning}
                setIsSigning={setIsSigning}
                btnClassName={buttonsClass}
                imageClass={imageClass}
              /> */}
            </>
          )}
          {!signingThrough && isSuccess && (
            <div className="success-sign">
              <span>Your signature has been saved! You can continue.</span>
            </div>
          )}
        </div>
      )}
    </Provider>
  );
};

export default SignComponents;
