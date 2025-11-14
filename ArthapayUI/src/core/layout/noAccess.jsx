import React from "react";
import noAccessImage from "../../assets/images/OBJECT.svg";
const NoAccess = () => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center border border-StrokeColor h-screen">
      <div className="p-4">
        <div className="mb-7">
          <img src={noAccessImage} alt="No Access" className="mx-auto" />
        </div>
        <p className="text-lightWhite font-medium text-xl text-center">
          You don’t have permission to view this page
        </p>
      </div>
    </div>
  );
};

export default NoAccess;
