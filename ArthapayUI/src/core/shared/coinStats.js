import React from "react";
import PropTypes from "prop-types";
export const formatToTwoDecimalsWithSeparators = (value) => {
    if (value == null) return '0.00';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};
const CoinStats = (props) => {
    const { coinCode, coinBalance, imagePath } = props.coinStatsObj;
    const formattedCoinBalance = formatToTwoDecimalsWithSeparators(coinBalance);
    return (
        <div className={`flex gap-2.5 items-center md:mb-0 mb-2.5  ${props.className}`}>
            <img preview={false} src={imagePath} className="w-10 h-10 rounded-full" />            
            <div className="">
                <h4 className="text-titleColor text-md font-semibold">{formattedCoinBalance} <span className="fs-24">{coinCode}</span></h4>
            </div>
        </div>
    )
}
CoinStats.propTypes = {
    coinStatsObj: PropTypes.object,
    className: PropTypes.string | PropTypes.any
};
export default CoinStats;