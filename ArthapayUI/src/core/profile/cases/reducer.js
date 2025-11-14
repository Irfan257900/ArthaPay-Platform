export const initialState = {
    error: null,
    loader: '',
    caseData: '',
    activeKey: [],
    messages: [],
    loadingKeys: {},
    documents: null,
    docunetDetailId: null,
    documentDetails: [],
    documentErrors: {},
    fileLists: { SignImage: [] },
    showPreviewModel: false,
    uploadError: null,
    inputText: '',
    documentUploading: false,
    previewImg: null,
    btnLoader: false,
    selectedFilesList: [],
    showPreviewLoader: false,
    previewError: null,
    fileType: null,
    selectedFileName: ''
}
export const caseReducer = (state, action) => {
    switch (action.type) {
        case 'SET_ERROR':
            return { ...state, error: action.payload }
        case 'SET_LOADER':
            return { ...state, loader: action.payload };
        case 'SET_ACTIVE_KEY':
            return { ...state, activeKey: action.payload }
        case 'SET_DOCUMENTS':
            return { ...state, documents: action.payload }
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload }
        case 'SET_CASE_DETAILS':
            return { ...state, caseData: action.payload };
        case 'SET_CASE_DOC_DETAILS':
            return { ...state, documentDetails: action.payload };
        case 'SET_DOCUNET_DETAIL_ID':
            return { ...state, docunetDetailId: action.payload };
        case 'SET_INPUT_TEXT':
            return { ...state, inputText: action.payload };
        case 'SET_FILE_LISTS':
            return { ...state, fileLists: action.payload };
        case 'SET_SELECTED_FILES_LIST':
            return { ...state, selectedFilesList: action.payload };
        case 'SET_UPLOAD_ERROR':
            return { ...state, uploadError: action.payload };
        case 'SET_DOCUMENT_UPLOADING':
            return { ...state, documentUploading: action.payload };
        case 'SET_SHOW_PREVIEW_MODEL':
            return { ...state, showPreviewModel: action.payload };
        case 'SET_BTN_LOADER':
            return { ...state, btnLoader: action.payload };
        case 'SET_LOADING_KEY':
            return {
                ...state,
                loadingKeys: { ...state.loadingKeys, [action.payload.key]: action.payload.isLoading }
            };
        case 'SET_DOCUMENT_ERROR':
            return {
                ...state,
                documentErrors: {
                    ...state.documentErrors,
                    [action.payload.key]: action.payload.error
                }
            };
            case 'SET_PREVIEW_DATA':
                return {
                    ...state,
                    previewImg: action.payload.previewImg,
                    fileType: action.payload.fileType,
                    selectedFileName:action.payload.selectedFileName
                };
    
        case 'SET_PREVIEW_STATUS':
            return {
                ...state,
                showPreviewLoader: action.payload.loader,
                previewError: action.payload.error
            };

        default:
            return state;
    }
}