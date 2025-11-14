import React, { useCallback } from 'react'
import grediantBlue from "../../assets/images/grediantbluebg.svg";
import grediantYellow from "../../assets/images/grediantyellowbg.svg";
import rejectedAccount from "../../assets/images/rejection.svg";
import CustomButton from '../../core/button/button';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { setReapply } from '../../reducers/banks.reducer';
const RejectedAccount = ({data}) => {
  const userProfile=useSelector((store)=>store.userConfig.metadata)
  const navigate=useNavigate();
  const dispatch=useDispatch();
  const onRefresh=useCallback(()=>{
    dispatch(setReapply(true))
   navigate('/banks/account/create')
  },[])
    return (
         <div className='px-3.5 py-10 border border-StrokeColor mt-4'>
          <div className='flex justify-center items-center'>
            <div className='text-center'>
               <div className='relative'>
                  <div className='absolute top-[-50px] left-[24px]'><img src={grediantBlue} alt="" /></div>
                  <div className='absolute bottom-[-44px] right-[30px]'><img src={grediantYellow} alt="" /></div>
                  <div className='w-[142px] h-[142px] !bg-BlackBg mx-auto'><img src={rejectedAccount} alt="" className='mx-auto' /></div>
               </div>
               <div className='mt-4'>
                <h6 className='text-base text-paraColor'>We regret to inform you that your application has been Rejected. </h6>
                {data?.remarks && <p className='text-base text-paraColor font-semibold'>due to {data?.remarks}</p>}
                <p  className='text-base text-paraColor font-semibold'>Please contact <span className="text-primaryColor cursor-pointer">{userProfile.AdminEmail}</span> for more details.</p>
               </div>
               <div className='mt-4 custom-rejected-btn'>
                   <CustomButton type='primary' className="md:w-40 w-full !bg-transparent !text-primaryColor !border !border-primaryColor hover:!bg-transparent dark:hover:!bg-transparent" onClick={onRefresh}>Reapply</CustomButton>
               </div>
            </div>
          </div> 
        </div>
    )
}

export default RejectedAccount
