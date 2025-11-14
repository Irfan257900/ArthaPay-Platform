
const ERROR_MESSAGES = {
    400: "Invalid request.",
    401: "You must be authenticated to access this resource.",
    403: "You are not authorized to access this resource.",
    404: "The requested resource was not found.",
    405: "Method not allowed.",
    406: "The requested format is not available.",
    407: "Proxy authentication is required to complete this request.",
    408: "The request took too long to process. Please try again later.",
    410: "The requested resource is no longer available.",
    411: "Content length is required but was not provided.",
    413: "The request is too large to be processed.",
    414: "The request URI is too long to be processed.",
    415: "The media type of the request is not supported.",
    417: "The server could not meet the requirements of the request.",
    426: "A protocol upgrade is required to proceed with the request.",
    DEFAULT: "Something went wrong, Please try again after sometime!"
}
const getErrorsMessage = (errors) => {
    if (errors && typeof errors === 'object') {
        return Object.entries(errors)?.map(([field, fieldErrors]) => typeof fieldErrors[0] === "string" ? fieldErrors[0] : `${field} is invalid`)?.join(",")
    }
    return ""
}

export const deriveErrorMessage = (errorToDerive) => {
    try {
        if (typeof errorToDerive === 'string') {
            return errorToDerive
        }
        if (typeof errorToDerive !== 'object' || errorToDerive === null) {
            return ERROR_MESSAGES.DEFAULT
        }
        const { status, data } = errorToDerive;
        if (status === 400 || data?.status === 400) {
            return `${ERROR_MESSAGES[400]} ${getErrorsMessage(data.errors)}`
        }
        if (status === 409 || data?.status === 409 || status === 422 || data?.status === 422) {
            return data.title
        }
        if (status >= 500 || data?.status >= 500) {
            return `Error ${data?.traceId}: Unable to process your request at the moment. Please try again after some time!`
        }
        return ERROR_MESSAGES[status || data?.status] || ERROR_MESSAGES.DEFAULT
    } catch (error) {
        return error?.message || ERROR_MESSAGES.DEFAULT
    }
}