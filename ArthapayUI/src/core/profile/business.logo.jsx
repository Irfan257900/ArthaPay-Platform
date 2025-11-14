import React, { useCallback, useEffect, useReducer } from "react";
import AppUpload from "../shared/appUpload";
import { businessLogoReducer, businessLogoState } from "./reducers";
import { useDispatch, useSelector } from "react-redux";
import { setBrandLogo } from "../../reducers/userconfig.reducer";
import { uploadBusinessLogo } from "./http.services";
import uploadImg from "../../assets/images/upload.png"
import { successToaster } from "../shared/toasters";
const acceptedFiles = {
  images: {
    "image/png": true,
    "image/PNG": true,
    "image/svg+xml": true,
    "image/SVG+xml": true,
    errorMessage: "File is not allowed. Please upload only png or svg files!",
  },
};
const TOASTER_MESSAGE="Business logo uploaded sucessfully"
const BusinessLogo = () => {
  const [state, setState] = useReducer(businessLogoReducer, businessLogoState);
  const businessLogo=useSelector(store=>store.userConfig.businessLogo)
  const userProfile=useSelector(store=>store.userConfig.details)
  const dispatch=useDispatch()
  useEffect(()=>{
    if(businessLogo && !state.file){
      setState({ type: "SET_FILE", payload: {name:businessLogo?.substring(businessLogo.lastIndexOf("/") + 1),url:businessLogo}  });
    }
  },[])
  const onChange = useCallback(async (file) => {
    setState({ type: "SET_FILE", payload: file });
    await uploadBusinessLogo(()=>{
      setState({ type: "SET_FILE", payload: file });
      dispatch(setBrandLogo(file?.url || null))
      successToaster({content:TOASTER_MESSAGE})
    },(message)=>{
      setState({ type: "SET_FILE", payload: null });
      onUploadError(message)
    },{userProfile,logo:file?.url})
  }, [userProfile]);
  const onUploadError = useCallback((message) => {
    setState({ type: "SET_ERROR", payload: message });
  }, []);
  const onPreview = useCallback(() => {
    setState({ type: "SET_SHOW_PREVIEW", payload: true });
  }, []);
  const setUploading=useCallback((payload)=>{
    setState({ type: "SET_LOADING", payload: payload? 'uploading':'' });
  },[])
  return (
    <div className="">
      <h1 className="text-titleColor font-semibold text-2xl mb-3">Business Logo</h1>
      <AppUpload
        fileList={state.file ? [state.file] : []}
        className=""
        canCrop={true}
        onUploadError={onUploadError}
        onChange={onChange}
        fileTypes={acceptedFiles}
        onPreview={onPreview}
        showUploadList={false}
        uploading={state.loading==='uploading'}
        setUploading={setUploading}
      >
         <div className="upload-img group !bg-menuhover hover:!bg-tabletdBghover focus:!bg-tabletdBghover active:!bg-tabletdBghover rounded-5 border border-dashed !border-StrokeColor text-center text-lightWhite overflow-hidden p-4 cursor-pointer group w-[270px] mx-auto ">
          {!state.file && <>
            <img src={uploadImg} alt="upload" className='mx-auto dark:invert-0 invert' draggable={false} />
            <strong>Choose File(2MB)</strong>
            <br/>
            <p className="text-descriptionGreyTwo text-[12px]">(PNG/SVG)</p>
          </>}
          {state.file && <div className="relative">
            <img src={state.file?.url} alt="" className="w-[125px] max-h-[60px] mx-auto !object-contain" />
             <div className="img-upload absolute inset-0 bg-transparent flex justify-center items-center group-hover:bg-[rgba(4,11,23,0.5)]"><span className="icon camera" /></div>
          </div>}
          </div>
      </AppUpload>
      {state.error && <div className="mt-2 text-textRed">{state.error}</div>}
    </div>
  );
};

export default BusinessLogo;
