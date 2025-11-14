import { Tooltip } from 'antd'
import React from 'react'
import { InfoCircleOutlined } from '@ant-design/icons';
const FormInput = ({ label, addtionalClass, isRequired=true, hasTooltip=false, hasTooltipAction=false, onTooltipAction,tooltipTitle, labelSuffix,children }) => {
    return (
        <div className={`relative ${addtionalClass || ''}`}>    
        <div className="custom-input-lablel">          
                
                    <span className="">
                        {label}&nbsp;{labelSuffix}{isRequired && <span className="text-textLightRed">&nbsp;*</span>}
                        {hasTooltip && <Tooltip title={tooltipTitle} className={'c-pointer p-0 mr-0'}>
                        &nbsp;&nbsp;{hasTooltipAction ?
                                <button className='btn-plane w-fit p-0' onClick={onTooltipAction}><InfoCircleOutlined /></button>
                                : <InfoCircleOutlined />}
                        </Tooltip>}

                    </span>              
           
        </div>
        <div className="text-left">
            {children}
        </div>
        </div>
    )
}

export default FormInput