import React from "react";
import { Skeleton } from "antd";
import ListLoader from "./list.loader";
import ContentLoader from "./content.loader";
const CommonPageLoader = () => {

  return (
    <div className="w-full">
      <Skeleton.Input active className="!w-full" />
      <div className="mt-6 grid grid-cols-12 gap-3">
        <div className="md:col-span-4 col-span-4 border-t border-r-0 border-l-0 border-b-0 border-t-borderLightGreen bg-sectionBG rounded-5">
        <ListLoader/>
        </div>
        <div className="md:col-span-8 col-span-8">
          <div className="bg-rightincard border border-rightincardBr rounded-5 ">
          <ContentLoader/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommonPageLoader;
