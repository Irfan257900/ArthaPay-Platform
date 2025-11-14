import { Skeleton } from 'antd'
import React from 'react'

function MarketKpiLoader({ itemCount = 3 }) {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div className="" key={index}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-44 mb-2"/>
            <div className="p-3.5 border border-dbkpiStroke rounded-5">
              <Skeleton 
                active 
                paragraph={{ rows: 4 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>
          </div>
        ))}
      </div>
        </div>
    )
}

export default MarketKpiLoader
