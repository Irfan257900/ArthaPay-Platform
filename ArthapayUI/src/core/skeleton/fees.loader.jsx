import React from 'react'
import { Skeleton } from "antd";
function FeesLoader() {
    return (
        <div>
                 <div className="w-full rounded-md bg-tableheaderBlack border border-StrokeColor p-5 mb-5">
                    <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 gap-4 md:px-10 px-5">
                      <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="w-36 lg:w-36 md:w-20"/>
                      <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="w-36 lg:w-36 md:w-20"/>
                      <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className="w-36 lg:w-36 md:w-20"/>
                      <Skeleton active paragraph={{ rows: 1 }} title={false} className="w-36 lg:w-36 md:w-20 filters-loader"/>
                    </div>
                  </div> 
                  <div className="w-full rounded-md bg-tableheaderBlack border border-StrokeColor mb-5 p-4">
                    <div className=''>
                    <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-36 filters-loader"/>
                    </div>
                      <div className='border border-dbkpiStroke md:p-4 py-3 mt-6'>
                         <div className="flex justify-end">
                         <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-36"/>
                         </div>
                         <div className="p-4 grid grid-cols-12 !mb-0 overflow-auto">
                            <div className='md:col-span-3 col-span-12 p-3 border border-dbkpiStroke flex justify-center items-center'>
                              <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-36 filters-loader"/>
                            </div>
                            <div className='md:col-span-9 col-span-12 border border-dbkpiStroke p-4'>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-ful ">
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                               <div className='flex justify-between space-x-3'>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                               <div className='flex justify-between space-x-3'>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               </div>
                             </div>
                            </div>
                         </div>
                         <div className="p-4 grid grid-cols-12 w-full overflow-auto">
                            <div className='md:col-span-3 col-span-12 p-4 border border-dbkpiStroke flex justify-center items-center'>
                              <Skeleton active paragraph={{ rows: 1 }} title={false} className="!w-36 filters-loader"/>
                            </div>
                            <div className='md:col-span-9 col-span-12 border border-dbkpiStroke p-4'>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                               <div className='flex justify-between space-x-3'>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                               <div className='flex justify-between space-x-3'>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                               <div className='flex justify-between space-x-3'>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                                <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader w-36 lg:w-36 md:w-20"/>
                               <div className='flex justify-between space-x-3'>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               <Skeleton active paragraph={{ rows: 1 }} title={false} className="filters-loader !w-28"/>
                               </div>
                             </div>
                            </div>
                         </div>
                      </div>
                  </div> 
        </div>
    )
}

export default FeesLoader
