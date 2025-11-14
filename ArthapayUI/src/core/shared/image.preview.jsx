import { Image } from "antd";
import React, { useCallback } from "react";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import CustomButton from "../button/button";
const ImagePreview = ({
  src,
  isOpen,
  displayZoomIcons = true,
  displayDownload = true,
  actionParams,
  onClose,
  previewParams = {},
}) => {
  const handleImagePreviewAction = useCallback(
    (e, action) => {
      if (actionParams && Array.isArray(actionParams)) {
        action?.(e, ...actionParams);
      }
      action?.(e);
    },
    [actionParams]
  );
    const handleDownload = useCallback(() => {
      if (src) {
        window.open(src, "_self");
      } else {
        console.error("Download URL is not available.");
      }
    }, [src]);
    const toolbar=useCallback((_, info) => {
      return (
        <div className="flex justify-end gap-4 mt-10 bg-bodyBg rounded-5 p-4">
          {displayZoomIcons && (
            <>
              <CustomButton
                type="normal"
                onClick={handleImagePreviewAction}
                onClickParams={[info.actions.onZoomIn]}
              >
                <ZoomInOutlined
                  style={{ fontSize: "20px", cursor: "pointer" }}
                />
              </CustomButton>
              <CustomButton
                type="normal"
                onClick={handleImagePreviewAction}
                onClickParams={[info.actions.onZoomOut]}
              >
                <ZoomOutOutlined
                  style={{ fontSize: "20px", cursor: "pointer" }}
                />
              </CustomButton>
            </>
          )}
          {displayDownload && (
            <CustomButton
              type="normal"
              onClick={handleImagePreviewAction}
              onClickParams={[handleDownload]}
            >
              <DownloadOutlined
                style={{ fontSize: "20px", cursor: "pointer" }}
              />
            </CustomButton>
          )}
        </div>
      );
    },[displayDownload,displayZoomIcons,src,actionParams,handleImagePreviewAction,handleDownload])
  return (
    <>
      {isOpen && (
        <Image
          src={src}
          alt="preview"
          width={'100%'}
          preview={{
            zIndex: 9999,
            scaleStep: 0.2,
            ...previewParams,
            visible: true,
            destroyOnClose: true,
            toolbarRender: toolbar,
            closeIcon: (
              <CustomButton type="normal" onClick={onClose}>
                <span
                  className={`icon lg close cursor-pointer`}
                  title="close"
                ></span>
              </CustomButton>
            ),
          }}
          // className="hidden !m-0 !p-0 !h-0 !w-0"
          // rootClassName="!m-0 !p-0 !h-0 !w-0 inline"
        />
      )}
    </>
  );
};

export default ImagePreview;
