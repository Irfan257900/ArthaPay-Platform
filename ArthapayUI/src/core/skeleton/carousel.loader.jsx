import React from 'react'
import { Skeleton } from 'antd';
function CarouselLoader() {
    return (
        <div className='mb-12'>
          <div className="md:p-5 p-3 border border-dbkpiStroke rounded-5">
            <div className="flex justify-between">
                 <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="!w-44"/>
                 <Skeleton active paragraph={{ rows: 2 }} title={false} className="!w-36"/>
            </div>
          </div>  
          <div className="flex justify-center mt-6">
            <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-10"/>
            <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-10"/>
            <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-10"/>
            </div>
        </div>
    )
}

export default CarouselLoader