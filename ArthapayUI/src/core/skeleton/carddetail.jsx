import { Skeleton } from "antd";
import React from "react";

const CardDetails =()=> {
  return (
      <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
          <div className="mt-2">
              <div className="mt-5 mb-4 w-96 mx-auto ">
                  <Skeleton
                      active
                      paragraph={{ rows: 1 }}
                      title={false}
                      className="custom-skeleton w-full mb-4"
                  />
              </div>
              <div className="p-3 text-center">
                <div className="flex items-center gap-4 justify-center">
                  <Skeleton.Input active style={{ height: 30 }} className=" w-96" />
                  <Skeleton.Input active style={{ height: 30 }} className=" w-96" />
              </div>
              </div>
          </div>
      </div>
  );
}

export default CardDetails;
