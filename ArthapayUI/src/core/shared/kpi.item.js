import React from "react";
import AppParagraph from "./appParagraph";
import AppText from "./appText";
import CopyComponent from "./copyComponent";
function KpiItem({ label, value, className, copyable, isCopy }) {
    return (
        <div className="summary-list-item" >
            <AppText className="summary-label">{label}</AppText>
            {isCopy && <CopyComponent text={value} />}
            {!isCopy &&
                <AppParagraph copyable={copyable === true ? { icon: <span className="icon sm copy" /> } : ''} className="summary-text !m-0 text-wordbreak">{value}</AppParagraph>
            }
        </div>
    )
}

export default KpiItem;