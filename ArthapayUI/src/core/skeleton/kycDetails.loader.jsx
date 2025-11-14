import React from 'react'
import { Skeleton } from "antd";
function KycDetailsloader() {
    return (
        <div>
            <div className="mt-6">
              <Skeleton.Input active className="!w-1/4 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <Skeleton.Input active className="!w-full" style={{  height: 45 }} />
                  <Skeleton.Input active className="!w-full" style={{  height: 45 }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <Skeleton.Input active className="!w-full" style={{  height: 45 }} />
                  <div>
                  <Skeleton.Input active className="!w-1/4 mb-1"/>
                  <div className="flex space-x-6 items-center">
                  <Skeleton active  avatar paragraph={{ rows: 1 }} title={false} className="!w-0 "/>
                  <Skeleton active  avatar paragraph={{ rows: 1 }} title={false} className="!w-0 "/>
                  </div>
                  </div>
              </div>
              <Skeleton.Input active className="!w-1/4 mb-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <Skeleton.Input active className="!w-full" style={{  height: 45 }} />
                  <Skeleton.Input active className="!w-full" style={{  height: 45 }} />
                  <Skeleton.Input active className="!w-full" style={{  height: 45 }} />
              </div>
              <div className="mb-2 flex justify-between">
              <Skeleton.Input active className="!w-1/4" />
              <Skeleton.Input active className="!w-1/3 !text-end" />
              </div>
              <Skeleton
                   active
                   paragraph={{ rows: 1 }}
                   title={false}
                   className="custom-skeleton w-full mb-4"
              />
         <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="custom-skel w-full mb-6"
          />

              </div> 
        </div>
    )
}

export default KycDetailsloader
