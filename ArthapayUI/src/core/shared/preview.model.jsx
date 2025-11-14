import React, { useCallback } from 'react';
import { Modal } from 'antd';
import CustomButton from '../button/button';
import PdfPreview from './pdf.preview';
import ImagePreview from './image.preview';
const PreviewModal = ({ isVisible, fileUrl, onClose,imageExts=['.png','.jpg','.jpeg','.webp','.svg'],imgPreviewProps={} }) => {
    
    const handleDownload = useCallback(() => {
        if (fileUrl) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileUrl.split('/').pop(); // Extract filename
            link.click();
        } else {
            console.error("Download URL is not available.");
        }
    }, [fileUrl]);
    if(fileUrl && imageExts.some(ext=>fileUrl.endsWith(ext))){
        return (
            <ImagePreview
                src={fileUrl}
                isOpen={isVisible} 
                onDownload={handleDownload} 
                onClose={onClose}
                previewParams={imgPreviewProps}
            />
        );
    }
    const renderPreviewContent = () => {
        if (!fileUrl) {
            return <p>No preview available</p>;
        }
        if (fileUrl.endsWith(".pdf")) {
            return (
                <PdfPreview fileUrl={fileUrl}/>
            );
        }
    };
    return (
        <Modal
        rootClassName='!w-[80%]'
            className={`bg-cardbackground text-lightWhite !mt-40 md:!mt-0 !top-0 ${fileUrl?.endsWith('.pdf') ? '!w-[100%]' : 'md:w-[500px]'}`}
            open={isVisible}
            title="Preview"
            closeIcon={
                <button onClick={onClose}>
                    <span className="icon lg close cursor-pointer" title="close"></span>
                </button>
            }
            footer={[
                <div key="Preview" className=" flex justify-end gap-2 mobile-btns-clum  ">
                    <CustomButton key="cancel" className='max-sm:w-full"' onClick={onClose}>
                        Close
                    </CustomButton>
                    <CustomButton key="download" type="primary" onClick={handleDownload} className="max-sm:w-full">
                        Download
                    </CustomButton>
                </div>,
            ]}
            onCancel={onClose}
        >
            <div className="mt-5">{renderPreviewContent()}</div>
        </Modal>
    );
};
export default PreviewModal;