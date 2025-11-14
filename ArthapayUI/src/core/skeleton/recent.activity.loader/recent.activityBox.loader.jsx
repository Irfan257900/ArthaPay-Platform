import React from 'react'
import { Skeleton,} from 'antd';
const RecentActivityBoxLoader =()=> {
    return (
        <div>
            <div className='grid grid-cols-1'>
            <div>
            <Skeleton 
                active 
                paragraph={{ rows: 1 }} 
                title={false} 
                className="skeleton-custom w-36"
              />
            <div className="mt-2 border-t border-r-0 border-l-0 border-b-0 border-t-borderLightGreen bg-sectionBG rounded-5 p-3 h-80">
              <Skeleton 
                active 
                paragraph={{ rows: 9 }} 
                title={false} 
                className="skeleton-custom"
              />
            </div>
            </div>
            </div>
        </div>
    )
}

export default RecentActivityBoxLoader
