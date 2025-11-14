import React from 'react'
import { Skeleton } from 'antd';
function KpiRightBorder() {
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 gap-5 mb-6">
            <div className="p-4 border-r border-dbkpiStroke">
              <Skeleton 
                active 
                paragraph={{ rows: 3 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>  
            <div className="p-4 border-r border-dbkpiStroke ">
              <Skeleton 
                active 
                paragraph={{ rows: 3 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>
            <div className="p-4 border-r border-dbkpiStroke">
              <Skeleton 
                active 
                paragraph={{ rows: 3 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>
            <div className="p-4">
              <Skeleton 
                active 
                paragraph={{ rows: 3 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>
          </div>
        </div>
    )
}

export default KpiRightBorder
