import React from "react";
import NumericText from "./NumericText"; // Assuming NumericText is a component you have

const amountCell = (propsData) => {
    const value = propsData.dataItem?.amount;
    const action = propsData.dataItem?.action?.toLowerCase();
    const amounts = value ? value.split("/") : [];

    // Early return if no amount is available
    if (amounts.length === 0) {
        return <td></td>;
    }

    // Determine decimal scales based on the action
    let firstDecimalScale;
    let secondDecimalScale;

    if (action === "buy crypto") {
        firstDecimalScale = 2; // Fiat
        secondDecimalScale = 4; // Crypto
    } else if (action === "sell crypto") {
        firstDecimalScale = 4; // Crypto
        secondDecimalScale = 2; // Fiat
    } else {
        // Default scales for other transactions, assuming crypto/fiat
        firstDecimalScale = 4;
        secondDecimalScale = 2;
    }

    return (
        <td>
            <>
                <NumericText
                    value={amounts[0]}
                    type="text"
                    decimalScale={firstDecimalScale}
                    fixedDecimalScale={true}
                    thousandSeparator={true}
                    allowNegative={true}
                    className="amount-text text-xs font-semibold text-subTextColor"
                />
                {amounts[1] && (
                    <>
                        <span>/</span>
                        <NumericText
                            value={amounts[1]}
                            type="text"
                            decimalScale={secondDecimalScale}
                            fixedDecimalScale={true}
                            thousandSeparator={true}
                            allowNegative={true}
                            className="amount-text text-xs font-semibold text-subTextColor"
                        />
                    </>
                )}
            </>
        </td>
    );
};

export default amountCell;