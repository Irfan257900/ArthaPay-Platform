import { Skeleton } from 'antd'
import React from 'react'

function CoinListLoader() {
    return (
        <div>
            <div className='flex justify-between items-center mb-4 p-2 bg-tableheaderBlack'>
               <Skeleton.Input active style={{height:24}} className="!rounded-0" />
               <Skeleton.Avatar active className="" />
            </div>
           <div>
             <Skeleton.Input active style={{height:60}} className="!w-full mb-2" />
             <Skeleton.Input active style={{height:60}} className="!w-full mb-2" />
             <Skeleton.Input active style={{height:60}} className="!w-full mb-2" />
             <Skeleton.Input active style={{height:60}} className="!w-full mb-2" />
           </div> 
        </div>
    )
}

export default CoinListLoader
