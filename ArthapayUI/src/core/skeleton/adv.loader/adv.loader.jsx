import React from "react";
import { Skeleton } from 'antd';
const AdvertisementLoader=()=> {
  return (
    <div>
      {/* <h1>
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="w-1/5 mb-3"
        />
      </h1> */}
     <div className="grid grid-cols-12 gap-4">
     <div className="md:col-span-6 col-span-12 p-4 border border-dbkpiStroke rounded-5 flex space-x-4">   
        <Skeleton
          active
          paragraph={{ rows: 4 }}
          title={false}
          className="w-full"
        />
        <Skeleton.Avatar active className="!w-24 !h-20 child-wfull" />
      </div>
      <div className="md:col-span-6 col-span-12 p-4 border border-dbkpiStroke rounded-5 flex space-x-4">   
        <Skeleton
          active
          paragraph={{ rows: 4 }}
          title={false}
          className="w-full"
        />
        <Skeleton.Avatar active className="!w-24 !h-20 child-wfull" />
      </div>
     </div>
    </div>
  );
}

export default AdvertisementLoader;
