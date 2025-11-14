import { Skeleton } from "antd";
import React from "react";

const AccountTypeLoader = () => {
  return (
    <div className="border border-kbodyrowbr rounded-sm">
      <div className="grid md:grid-cols-2 gap-4 p-5 ">
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
         <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 ">
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
         <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
         <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
          <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
          <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-full mb-0"
        />
      </div>
      <div className="px-5 flex justify-center md:justify-end">
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel mb-4 !h-[30px]"
        />
      </div>
      <div className="flex justify-center sm:justify-end gap-2 sm:pr-5">
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="custom-skel w-[250px] mb-4"
        />
      </div>
    </div>
  );
};

export default AccountTypeLoader;
