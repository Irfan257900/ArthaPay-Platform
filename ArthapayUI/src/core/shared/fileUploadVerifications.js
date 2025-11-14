 
  
  // Helper function to update file list
  export const updateFileList = (fileList, type,recorderValue) => {
    return fileList.map((file) => ({
      ...file,
      id: file.status === "done" ? file.id || "00000000-0000-0000-0000-000000000000" : file.id,
      recordStatus: file.status === "done" ? "Added" : file.recordStatus || "Pending",
      url: file.status === "done" && file?.response[0],
      docType: type,
      recorder: recorderValue || null
    }));
  };

    
  // Helper function to check file extension
  export const checkValidExtension = (extension, allowedExtensions) => {
    return allowedExtensions.includes(extension);
  };


// Helper function to check file size
export const checkFileSize = (size, maxSize) => {
  return size <= maxSize;
};

// Helper function to check file name validity
export const checkFileName = (fileName) => {
  const fileNameParts = fileName?.split(".");
  return fileNameParts?.length <= 2;
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "pdf"];

export const fileValidations = {
  fileExtension: "Only PNG, JPG, JPEG, and PDF file extensions are allowed.",
  fileSize: "File size cannot exceed 2MB.",
  fileName: "File doesn't allow double extension"
}