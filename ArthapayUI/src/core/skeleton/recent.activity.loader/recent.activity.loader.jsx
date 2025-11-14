import React from 'react'
import { Skeleton,} from 'antd';
const RecentAcLoader =()=> {
    return (
        <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div>
            <Skeleton 
                active 
                paragraph={{ rows: 1 }} 
                title={false} 
                className="skeleton-custom w-56"
              />
            <div className="mt-3 border border-dbkpiStroke rounded-5 bg-sectionBG  p-3 h-80">
              <Skeleton 
                active 
                paragraph={{ rows: 9 }} 
                title={false} 
                className="skeleton-custom"
              />
            </div>
            </div>
            <div>
            <Skeleton 
                active 
                paragraph={{ rows: 1 }} 
                title={false} 
                className="skeleton-custom w-56"
              />
            <div className="mt-3 border border-dbkpiStroke rounded-5 bg-sectionBG p-3 h-80">
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

export default RecentAcLoader
