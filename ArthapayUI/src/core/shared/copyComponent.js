import React, { useMemo } from 'react';
import AppText from './appText';
const defaults = {
    tooltips: ['Copy', 'Copied'],
    format: 'text/plain',
    suffixChars: 8,
    prefixChars:8,
    type: 'text',
    shouldTruncate: true,
    className: "text-base font-normal text-primaryColor m-0",
    noText:'',
    textClass:'!text-nameCircle'
}
const CopyComponent = ({ componentClass = defaults.className, text, shouldDisplayText=true, noText=defaults.noText, format = defaults.format, tooltips = defaults.tooltips, type = defaults.type, shouldTruncate = defaults.shouldTruncate, suffixChars = defaults.suffixChars,prefixChars=defaults.prefixChars, link,textClass="text-base font-normal text-subTextColor m-0 mr-2" }) => {
    const textToDisplay = useMemo(() => {
        return shouldTruncate ? `${text?.substring(0, prefixChars)}...${text?.substring(text.length - suffixChars)}` : text
    }, [text, shouldTruncate, prefixChars,suffixChars])
    if (!text) {
        return <span className='text-lightWhite'>{noText}</span>
    }
    return (
        <AppText copyable={{ tooltips, format, text }} className={componentClass}>
            {type === 'link' && shouldDisplayText && (
                <a className="text-link cursor-pointer" href={`${link}`} target="_blank"
                    rel="noopener noreferrer">
                    {textToDisplay}
                </a>
            )}
            {type==='text' && shouldDisplayText && (
                <span className={textClass}>{textToDisplay}</span>
            )}
        </AppText>

    )
}

export default CopyComponent