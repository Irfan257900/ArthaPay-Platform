import React, { useMemo } from 'react';
import AppEmpty from './appEmpty';

const FeeBreakdown = ({ feeInfo }) => {
    const data = useMemo(() => {
        return (feeInfo && typeof feeInfo === 'object') ? Object.entries(feeInfo) : null
    }, [feeInfo])
    return (
        <>
            {!data && <AppEmpty />}
            {data?.map(([title, value]) => {
                return <div key={title} className="summary-list-item">
                    <div className="summary-label">{title}</div>
                    <div className="summary-text">{value}</div>
                </div>
            })}
        </>
    )
}

export default FeeBreakdown
