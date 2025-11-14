import {QRCodeSVG}  from 'qrcode.react';
const QRCodeComponent = ({ value="abc", bgColor, fgColor, size = 250 }) => {
    return <QRCodeSVG value={value} size={size} bgColor={bgColor} fgColor = {fgColor} />
}
export default QRCodeComponent