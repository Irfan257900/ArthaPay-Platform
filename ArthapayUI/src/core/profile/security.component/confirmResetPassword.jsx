import { Alert } from "antd";
import CustomButton from "../../button/button";
import { useCallback } from "react";
const ConfirmResetPassword = ({isCloseDrawer,showEmailMessage,loading,resetError,setResetError}) => {

    const closeErrorHandler=useCallback(()=>{
        setResetError(null)
    },[])
const closeDrawerHandler=useCallback(()=>{
    isCloseDrawer(false)
},[])
const emailMessageHandler=useCallback(()=>{
    showEmailMessage()
},[])
    return (
        <div>
            {resetError && (<div className="alert-flex !w-auto mb-24 !mx-3">
				<Alert
					className="mb-3 security-error"
					closable
					type="error"
					description={resetError}
					onClose={closeErrorHandler}
					showIcon
				/>
			</div>)}
            <p className='text-md text-lightWhite font-semibold pt-3 pb-4'>Are you sure you want reset the password ?</p>
            <div className='text-right'>
                <CustomButton key="back" onClick={closeDrawerHandler} type="" className={""}>
                    No
                </CustomButton>
                <CustomButton key="back" onClick={emailMessageHandler} type="primary" className={"mb-5 md:mb-0 md:ml-3.5"} loading={loading}>
                    yes
                </CustomButton>
            </div>
        </div>
    )
}
export default ConfirmResetPassword;