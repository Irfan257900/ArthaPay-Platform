import { Skeleton } from 'antd'
import React from 'react'

const TransactionLoader = () => {
  return (
    <div className="border border-kbodyrowbr gap-4 p-5 rounded-sm">
    <Skeleton
       active
       paragraph={{ rows: 8 }}
       title={false}
       className="custom-skel w-full mb-0"
     />
     
    
    </div>
  )
}

export default TransactionLoader