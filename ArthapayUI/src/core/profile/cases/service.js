import { appClientMethods as  coreClientMethods } from "../../http.clients";

export const Messages  = {
    ENTER_MESSAGE: "Please enter a message.",
    FILE_SIZE_EXCEED: "File size cannot exceed 2MB.",
    DOUBLE_EXTENSION_NOT_ALLOWED: "Files with double extensions are not allowed.",
    UPLOAD_SUCCESS: "Upload successful!",
    UPLOAD_RESPONSE_INVALID: "Upload response is invalid.",
    UPLOAD_FAILED: "Upload failed.",
    MESSAGE_SENT_SUCCESS: "Message sent successfully!",
    ALLOWED_MIME_TYPES: {
        PNG: "image/png",
        JPEG: "image/jpeg",
      },
  };
export const getCasesKpisData= async (setState,id) => {
    setState(prev => ({ ...prev, loading: true }))
    try {
        const data = await coreClientMethods.get(`Cases/kpi`)
        setState(prev => ({ ...prev, data }))
    } catch (error) {
        setState(prev => ({ ...prev, error: error.message }))
    } finally {
        setState(prev => ({ ...prev, loading: false }))
    }
}