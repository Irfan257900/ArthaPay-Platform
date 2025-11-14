import React from 'react'
import successImg from '../../assets/images/gifSuccess.gif';
import CustomButton from '../../core/button/button';


function InviteSuccess({onOk}) {
    return (
        <div className="lg:px-2 py-0 md:px-6 sm:px-2 text-secondaryColor mt-6 border-t border-rightincardBr">
            <div className="bg-sectionBG rounded-5 h-full">
                <div className='basicinfo-form rounded-5 pb-9'>
                    <div className='text-center relative'>
                        <div className='bg-SuccessBg bg-no-repeat bg-cover h-[262px]'>
                            <div className='w-[260px] mx-auto relative'>
                                <img src={successImg} className='mx-auto absolute h-24 w-24' alt="" />
                            </div>
                        </div>
                        <h2 className='text-2xl font-semibold text-titleColor text-center'> Invite <br />
                        Sent Successfully </h2>
                        <div className='text-center mb-9 mt-5'>
                            <CustomButton type='primary' className={'w-[300px]'} onClick={onOk}>
                                Ok
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default InviteSuccess