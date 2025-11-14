import React from 'react'
import { Skeleton } from 'antd';
function KpiCardsLoader() {
    return (
        <div>
          <div className="grid grid-cols-12 gap-5 mb-6">
            <div className="md:col-span-2 col-span-12 p-4 border border-StrokeColor rounded-5">
              <Skeleton 
                active 
                paragraph={{ rows: 4 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>  
            <div className="md:col-span-2 col-span-12 p-4 border border-StrokeColor rounded-5">
              <Skeleton 
                active 
                paragraph={{ rows: 4 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>
            <div className="md:col-span-8 col-span-12 p-4 border border-StrokeColor rounded-5">
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

export default KpiCardsLoader
