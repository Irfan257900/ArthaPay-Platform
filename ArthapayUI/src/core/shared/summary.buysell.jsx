import React, { useCallback, useState } from "react";
import AppTitle from "./appTitle";
import AppParagraph from "./appParagraph";
import AppNumber from "./inputs/appNumber";
import PropTypes from "prop-types";
import { Tooltip } from "antd";
import FeeBreakDown from "./feeBreakdown";
import AppModal from "./appModal";
import CustomButton from "../button/button";
import NumericText from "./numericText";
import AppDefaults from "../../utils/app.config";
const SummaryDetails = (props) => {
  const { details } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const openFeeInfo = useCallback(() => {
    setIsModalVisible(true);
  }, []);
  const closeFeeInfo = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  return (
    <div className={`${props?.className || ""}`}>
      <div className="exchange-rate">
        <AppParagraph className="buy-switchtext text-center">
          <span className="buy-feehead text-labelGrey text-sm font-medium">
            Exchange Rate :{" "}
          </span>
          <span className="text-labelGrey font-semibold text-sm">
            1 {props?.action !== "Buy" ? details?.fromAsset : details?.toAsset}
            &nbsp; ≈ &nbsp;
            <NumericText
              value={details?.oneCoinValue}
              decimalScale={AppDefaults.fiatDecimals}
              className={"inline-block text-labelGrey"}
              suffixText={" "}
            />
            {props?.action !== "Buy" ? details?.toAsset : details?.fromAsset}
          </span>
        </AppParagraph>
      </div>
      <div className="md:flex justify-center items-center my-6 relative gap-5">
        <div className="bg-menuhover px-4 pt-2.5 rounded-5 border border-StrokeColor w-full !min-h-[90px] md:mb-0 mb-5 ">
          <label htmlFor className="text-sm font-medium text-labelGrey">
            Amount
          </label>
          <AppTitle className="text-lightWhite flex items-baseline">
            <NumericText
              className="text-lightWhite text-base font-medium"
              value={
                props?.action !== "Buy" ? details?.fromValue : details?.toValue
              }
              decimalScale={AppDefaults.cryptoDecimals}
            />{" "}
            <span className="text-lightWhite text-sm font-medium">
              &nbsp;
              {props?.action !== "Buy" ? details?.fromAsset : details?.toAsset}
            </span>
          </AppTitle>
        </div>
        <div className="flip-icon absolute left-[44%] md:left-[46%]">
          {props?.action === "Buy" && props?.flag === "true" && (
            <span className="icon xlg substract"></span>
          )}
          {props?.action === "Buy" && props?.flag === "false" && (
            <span className="icon xlg flip"></span>
          )}
          {props?.action === "Sell" && props?.flag === "false" && (
            <span className="icon xlg substract"></span>
          )}
          {props?.action === "Sell" && props?.flag === "true" && (
            <span className="icon xlg flip"> </span>
          )}
        </div>
        <div className="bg-menuhover px-4 pt-2.5 rounded-5 border border-StrokeColor w-full !min-h-[90px]">
          <div className="flex items-center space-x-2">
            <label htmlFor className="text-sm font-medium text-labelGrey">
              Fee
            </label>
            {props.showFeeInfo && (
              <Tooltip title={"Fee info"}>
                <button
                  onClick={openFeeInfo}
                  className="action-button c-pointer"
                >
                  <span className="icon md info"></span>
                </button>
              </Tooltip>
            )}
          </div>
          <AppTitle level={2} className="text-lightWhite text-lg flex">
             <NumericText
              className="text-lightWhite text-base font-medium"
              value={details?.fee == null
                ? "0"
                : details?.fee?.toLocaleString(undefined, {
                    maximumFractionDigits: 20,
                  })}
              decimalScale={AppDefaults.fiatDecimals}
              suffixText={props?.action !== "Buy" ? details?.toAsset : details?.fromAsset}
            />
          </AppTitle>
        </div>
      </div>
      {
        <div
          className="flex justify-between border border-StrokeColor px-4 py-3 rounded-md mb-4"
          style={{}}
        >
          <div className="summary-total text-base text-lightWhite font-medium">
            {props.action === "Buy" ? "You pay" : "You receive"}
          </div>
          <div className="sumamry-totaltext">
            <NumericText
              className="inline-block text-base text-lightWhite font-medium"
              value={details?.totalAmount || 0}
              decimalScale={AppDefaults.fiatDecimals}
            />{" "}
            {props?.action !== "Buy" ? details?.toAsset : details?.fromAsset}
          </div>
        </div>
      }
      <AppModal
        centered
        title={
          <AppTitle className="!text-md !text-titleColor font-medium">
            Fee info
          </AppTitle>
        }
        style={{ height: "calc(100vh - 100px)" }}
        open={isModalVisible}
        onCancel={closeFeeInfo}
        className="custom-modal cust-popup"
        closeIcon={<AppModal.CloseIcon onClose={closeFeeInfo} />}
        closable={true}
        destroyOnClose={true}
        footer={
          <CustomButton
            type="secondary"
            block
            className=""
            style={{ margin: "auto" }}
            onClick={closeFeeInfo}
          >
            <span className="text-base font-medium">Close</span>
          </CustomButton>
        }
      >
        <FeeBreakDown feeInfo={details?.feeInfo} />
      </AppModal>
    </div>
  );
};
SummaryDetails.propTypes = {
  details: PropTypes.shape({
    fromAsset: PropTypes.string.isRequired,
    toAsset: PropTypes.string.isRequired,
    fromValue: PropTypes.number.isRequired,
    toValue: PropTypes.number.isRequired,
    fee: PropTypes.number,
    totalAmount: PropTypes.number.isRequired,
    oneCoinValue: PropTypes.number,
    feeInfo: PropTypes.object,
  }).isRequired,
  action: PropTypes.string,
  flag: PropTypes.string,
  className: PropTypes.string,
  showFeeInfo: PropTypes.bool,
};
export default SummaryDetails;
