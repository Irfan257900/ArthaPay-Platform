import { Skeleton } from 'antd'
import React from 'react'

function TransactionsSummaryLoader() {
    return (
        <div>
             <div className="p-4">
                    {/* <div className='flex justify-end space-x-2'>
                    <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-24 filters-loader"/>
                    <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-24 filters-loader"/>
                    </div> */}
                    <div className="mt-4 md:px-6">
                         <div className='space-y-7'>
                            <Skeleton active paragraph={{ rows: 5 }} title={false} className="!w-full filters-loader "/>
                        </div> 
                        <div className='mt-6 grid grid-cols-3 gap-4'>
                         <Skeleton active paragraph={{ rows: 2 }} title={false} className="!w-24"/>
                         <Skeleton active paragraph={{ rows: 2 }} title={false} className="!w-24"/>
                         <Skeleton active paragraph={{ rows: 2 }} title={false} className="!w-24"/>
                        </div>    
                    </div>
                    
                  </div> 
        </div>
    )
}

export default TransactionsSummaryLoader
