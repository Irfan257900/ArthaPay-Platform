import { replaceCommas } from "../../../../core/shared/validations";

export const allowedDecimals = {
    quantity:0,
    unitPrice:4,
    discountPercentage:2,
    discountAmount:4,
    taxPercentage:2,
    taxAmount:4,
    amount:4,
    dueAmount:4,
    totalDiscount:4,
    amountwithoutTax:4
}
const formatNumber = (num,field,shouldRoundDown=false) => {
    if(shouldRoundDown){
        return parseFloat(num.toFixed(allowedDecimals[field]))
    }
    const toDecimals=10**allowedDecimals[field];
    return Math.floor(num * toDecimals) / toDecimals;
};
export const calculateAmounts = (quantity, unitPrice, discount, tax) => {
    let amount = formatNumber(quantity * unitPrice,"amount");
    let discountAmount=0,taxAmount=0;
    if (discount > 0) {
        discountAmount=formatNumber(amount * (discount / 100),"discountAmount");
        amount -= formatNumber(amount * (discount / 100),'amount');
    }
    if (tax > 0) {
        taxAmount = formatNumber(amount * (tax / 100),'taxAmount')
        amount += formatNumber(amount * (tax / 100),'amount');
    }
    return {
        discountAmount:discountAmount,
        //  formatNumber(discountAmount,'discountAmount'),
        taxAmount:taxAmount,
        // formatNumber(taxAmount,'taxAmount'),
        amount: amount
        // formatNumber(amount,'amount')
    };
};
export const normalizeFormattedNumber=(value)=>{
    return Number(replaceCommas(value) || 0)
}
export const getTotals = (items) => {
    return items.reduce((prev, curr) => {
        let { amountwithoutTax, taxAmount, totalDiscount, totalAmount, dueAmount } = prev;
        let { discountPercentage, unitPrice, quantity, taxPercentage } = curr;
        discountPercentage = normalizeFormattedNumber(discountPercentage)
        unitPrice = normalizeFormattedNumber(unitPrice)
        quantity =normalizeFormattedNumber(quantity)
        taxPercentage = normalizeFormattedNumber(taxPercentage)
        const normalAmount = formatNumber(quantity * unitPrice,'amount')
        const discountAmount = formatNumber(normalAmount * (discountPercentage / 100),'discountAmount')
        const amountAfterDiscount = normalAmount - discountAmount
        const taxAm = formatNumber(amountAfterDiscount * (taxPercentage / 100),'taxAmount')
        const amountAfterTax = amountAfterDiscount + taxAm
        amountwithoutTax = formatNumber(amountwithoutTax + amountAfterDiscount,'amountwithoutTax');
        taxAmount = formatNumber(taxAmount + taxAm,'taxAmount');
        totalDiscount = formatNumber(totalDiscount + discountAmount,'totalDiscount');
        totalAmount = formatNumber((totalAmount + amountAfterTax),'amount',true);
        dueAmount = formatNumber(dueAmount + amountAfterTax,'dueAmount',true);
        return { amountwithoutTax, taxAmount, totalDiscount, totalAmount, dueAmount }
    }, { amountwithoutTax: 0, taxAmount: 0, totalDiscount: 0, totalAmount: 0, dueAmount: 0 })
}
export const formButtonTexts = {
    'PaymentLink': {
        'generate': 'Save',
        'update': 'Update',
    },
    'Invoice': {
        'generate': 'Save',
        'update': 'Update',
    }
}