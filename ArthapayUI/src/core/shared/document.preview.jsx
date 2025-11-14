import React from "react";
import { PdfThumbnail } from "./pdf.preview";

const KycDocument = ({ label, imageUrl, onPreview, onDownload }) => {
  if (!imageUrl) return null;

  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    const parsedUrl = new URL(url);
    const fullFileName = parsedUrl.pathname.split("/").pop();
    return fullFileName;
  };

  return (
    <div>
      {label && (
        <label className="text-sm font-normal text-paraColor">{label}</label>
      )}
      <div className="relative group overlay-bg border border-StrokeColor rounded-5">
        {imageUrl.endsWith(".pdf") && <PdfThumbnail/>}
        {!imageUrl.endsWith(".pdf") && (
          <img
            src={imageUrl}
            className="mb-1 mx-auto rounded-5 !object-contain"
            alt={label}
            style={{ width: '100%', height: "184px" }}
          />
        )}
        <button
          type="button"
          onClick={() => onPreview({ url: imageUrl })}
          className="hidden group-hover:absolute w-full group-hover:flex h-full top-0 right-0 border-none p-0 items-center justify-center gap-2 bg-overlayblack left-0 bottom-0 cursor-pointer !pointer-events-auto"
        >
          <span className="icon preview-eye"></span>
          <span className="text-base font-semibold text-lightWhite">
            Preview
          </span>
        </button>
      </div>
      <div className="text-left mt-2 break-words file-previe-name">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="icon file-attachement"></span>
            <span
              className="text-sm text-primaryColor text-ellipsis !w-[180px] md:!w-[150px] xl:!w-[210px] whitespace-nowrap overflow-hidden cursor-pointer fileuploadtext"
              onClick={() => onPreview({ url: imageUrl })}
            >
              {getFileNameFromUrl(imageUrl)}
            </span>
          </div>
          <span
            className="icon file-download cursor-pointer"
            onClick={() => onDownload({ url: imageUrl })}
          ></span>
        </div>
      </div>
    </div>
  );
};

export default KycDocument;
