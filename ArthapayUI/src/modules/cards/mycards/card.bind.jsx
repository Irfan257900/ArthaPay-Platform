import React, { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import {
  fetchCardToBind,
  resetState,
  setErrorMessages,
} from "../../../reducers/cards.reducer";
import ContentLoader from "../../../core/skeleton/common.page.loader/content.loader";
import AppAlert from "../../../core/shared/appAlert";
import AppEmpty from "../../../core/shared/appEmpty";
import Bind from "../quickLink.component/bind";
import QuickLinkSteps from "../quickLink.component/processsteps";
import { isEmptyObject } from "../../../utils/app.config";
import BindViewHeader from "./bind.view.header";
const CardBind = ({ onBindSuccess,cardDetails }) => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [showSteps, setShowSteps] = useState(false);
  const { loading, data, error } = useSelector(
    (state) => state.cardsStore.cardToBind
  );
  useEffect(() => {
    dispatch(fetchCardToBind({ id: productId }));
    return () => dispatch(resetState(["cardToBind"]));
  }, []);
  const clearError = useCallback(() => {
    error && dispatch(setErrorMessages([{ key: "cardToBind", message: "" }]));
    errorMessage && setErrorMessage("");
  }, [error,errorMessage]);
  const backToMyCards = useCallback(() => {
    setShowSteps(false);
  }, []);
  const onSuccess = useCallback(() => {
    onBindSuccess?.();
  }, []);
  if (loading) {
    return <ContentLoader />;
  }
  if (!loading && error) {
    return (
      <div className="alert-flex withdraw-alert fiat-alert mt-4">
        <AppAlert
          type="error"
          description={error}
          showIcon
          closable
          afterClose={clearError}
        />
      </div>
    );
  }
  if (!loading && !data) {
    return (
      <div className="nodata-content loader-position">
        <AppEmpty />
      </div>
    );
  }
  return (
    <>
    <BindViewHeader hasData={!isEmptyObject(cardDetails)} data={cardDetails} showBack={!showSteps}/>
     {errorMessage && <div className="alert-flex withdraw-alert fiat-alert">
        <AppAlert
          type="error"
          description={errorMessage}
          showIcon
          closable
          afterClose={clearError}
        />
      </div>}
      {!showSteps && (
        <Bind
          setIsProcessEnable={setShowSteps}
          selectedCardName={data?.[0]?.name}
          selectedCardId={data?.physicalCardProgramId}
          selectedCard={data}
          setError={setErrorMessage}
        />
      )}
      {showSteps && (
        <QuickLinkSteps
          cardId={data?.id}
          isError={setErrorMessage}
          onSuccess={onSuccess}
          backtoScreen={backToMyCards}
          selectedCardData={data?.[0]}
          showBackButton={true}
        />
      )}
    </>
  );
};

export default memo(CardBind);
