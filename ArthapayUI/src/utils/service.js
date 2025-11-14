export function checkCustomerState(config) {
    if (config) {
        const hasProp = config.hasOwnProperty("customerState");
        if ((hasProp && config.customerState === "Approved") || !hasProp) {
            return true;
        }
    } else {
        return false;
    }
}

export const convertUTCToLocalTime = (dateString) => {
    let date = new Date(dateString);
    const milliseconds = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
    );
    return new Date(milliseconds)
};
