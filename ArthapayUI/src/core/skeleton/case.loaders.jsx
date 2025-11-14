import { Skeleton } from "antd";
import React from "react";

export const CaseLoaders = ()=>{
  return (
    <div>
      <div className="w-full rounded-md bg-inputDarkBorder p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton active paragraph={{ rows: 2 }} title={false} className=""/>
        </div>
      </div>
      <div className="w-full rounded-md bg-inputDarkBorder p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className=""/>
          <Skeleton avatar active paragraph={{ rows: 2 }} title={false} className=""/>
        </div>
      </div>
      <div className="w-full rounded-md bg-inputDarkBorder p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton active paragraph={{ rows: 2 }} title={false} className=""/>
        </div>
      </div>
    </div>
  );
}
export const CaseViewModalLoader = () => {
  return (
    <>
      {/* Accordian View Modal skeleton Loaders */}
      <div className="flex justify-center items-center">
        <div className="w-1/2 mx-auto h-full bg-inputDarkBorder p-5 mb-5">
          <div className="flex justify-between">
            <Skeleton
              active
              paragraph={{ rows: 1 }}
              title={false}
              className="!w-1/5"
            />
            <Skeleton
              active
              paragraph={{ rows: 1 }}
              title={false}
              className="!w-10"
            />
          </div>
          <div className="mt-4 flex justify-center">
            <Skeleton
              active
              paragraph={{ rows: 1 }}
              title={false}
              className="!w-full custom-skeleton"
            />
          </div>
          <div className="flex justify-end mt-3 space-x-2">
            <Skeleton
              active
              paragraph={{ rows: 1 }}
              title={false}
              className="!w-24 filters-loader"
            />
            <Skeleton
              active
              paragraph={{ rows: 1 }}
              title={false}
              className="!w-24 filters-loader"
            />
          </div>
        </div>
      </div>
    </>
  );
};
export const CaseAcordinLoader = () => {
  return (
    <>
      {/* Accordian skeleton Loaders */}
      <div className="flex justify-between items-center rounded-md p-5 mb-5 bg-loginGreyBorder">
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="!w-1/5"
        />
        <Skeleton
          active
          paragraph={{ rows: 1 }}
          title={false}
          className="!w-1/5"
        />
      </div>
      <div className="accordian-expends bg-inputDarkBorder p-5 mb-5">
        <div className="flex justify-center text-center">
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-1/5"
          />
        </div>
        <div className="mt-6 flex space-x-4">
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-12 custom-skel"
          />
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-full custom-skel"
          />
        </div>
        <div className="mt-6 flex space-x-4">
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-full custom-skel"
          />
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-12 custom-skel"
          />
        </div>
        <div className="mt-6 flex space-x-4">
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-12 custom-skel"
          />
          <Skeleton
            active
            paragraph={{ rows: 3 }}
            title={false}
            className="!w-full"
          />
        </div>
        <div className="mt-6">
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-full custom-skel"
          />
        </div>
        <div className="flex justify-end mt-3">
          <Skeleton
            active
            paragraph={{ rows: 1 }}
            title={false}
            className="!w-36 filters-loader"
          />
        </div>
      </div>
    </>
  );
};
