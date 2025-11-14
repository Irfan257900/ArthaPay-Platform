import React from "react";
import PropTypes from "prop-types";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import AppText from "../shared/appText";
import AppParagraph from "./appParagraph";


const AppKPI=({ label, value,copyable,isCopy }) =>{
    return (
        <div className="summary-list-item" >
            <AppText className="summary-label">{label}</AppText>
            {isCopy &&
                <CopyToClipboard text={value} options={{ format: 'text/plain' }}><AppText copyable={{ tooltips: ['Copy','Copied'] }} className="summary-text m-0">{value}</AppText></CopyToClipboard>
           
            }
              {!isCopy && 
            <AppParagraph copyable={copyable? {icon: <span className="icon sm copy" />}:''} className="summary-text m-0">{value}</AppParagraph>
           }
        </div>
    )
}
AppKPI.propTypes = {
    label:  PropTypes.string | PropTypes.any,
    value: PropTypes.string | PropTypes.any,
    copyable: PropTypes.bool | PropTypes.any,
    isCopy: PropTypes.bool | PropTypes.any,
};
export default AppKPI;