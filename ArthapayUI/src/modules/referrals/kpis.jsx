import React, { useCallback, useReducer } from 'react'
import CopyComponent from '../../core/shared/copyComponent';
import { referralReducer, referralState } from './reducer';
import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import ShareComponentHandler from './shareComponent';

function KpisData(props) {
  const [localState, localDispatch] = useReducer(referralReducer, referralState);
  const { t } = useTranslation();

  const toggleDropdown = useCallback((isOpen) => {
    localDispatch({ type: 'setIsOpen', payload: isOpen });
  }, []);

const shareDrawerHandler = useCallback(() => {
  return (
    <ShareComponentHandler
       referralId={props?.data?.[0]?.value}
       toggleDropdown={toggleDropdown}
    />
  );
}, [props?.data]);

  return (
    <div className='grid md:grid-rows-2 md:grid-cols-3 grid-cols-1 gap-4 mb-4'>
      <div className='md:row-span-2 md:col-span-2 referral-bg-img !bg-referralbg border border-StrokeColor rounded-5'>
        <div className=' p-4'>
          <h2 className='text-2xl text-lightWhite font-semibold mb-3'>{`${t('referrals.invite_text.invite_friends')}`}</h2>
          <ul className='mb-7'>
            <li className='flex items-center gap-2 mb-2'>
              <span className='referral-list text-sm font-normal border border-StrokeColor bg-tableheaderBlack w-6 h-6 flex items-center justify-center shadow-2xl rounded-full shadow-teal-500'>1</span>
              <p className='text-sm font-normal text-descriptionGreyTwo'>{`${t('referrals.invite_text.share_your_referral')}`}</p>
            </li>
            <li className='flex items-center gap-2 mb-2'>
              <span className='referral-list text-sm font-normal border border-StrokeColor bg-tableheaderBlack w-6 h-6 flex items-center justify-center shadow-2xl rounded-full shadow-teal-500'>2</span>
              <p className='text-sm font-normal text-descriptionGreyTwo'>{`${t('referrals.invite_text.get_rewarded')}`}</p>
            </li>
            <li className='flex items-start gap-2 mb-3'>
              <span className='referral-list text-sm font-normal border border-StrokeColor bg-tableheaderBlack w-6 h-6 flex items-center justify-center shadow-2xl rounded-full shadow-teal-500'>3</span>
              <p className='text-sm font-normal text-descriptionGreyTwo wordbreak w-96'>{`${t('referrals.invite_text.grow_your_bonus')}`}<span className='text-lightWhite font-semibold'>{`${t('referrals.invite_text.instructions')}`}</span></p>
            </li>
          </ul>

          <div className='flex items-center gap-2'>
            <div className='w-[210px] bg-sectionBG border border-StrokeColor rounded-5'>
              <h4 className='p-2 text-lightWhite text-sm'>{props?.data?.[0]?.value}</h4>
            </div>
            <div className='bg-primaryColor w-9 h-9 rounded-5 flex items-center justify-center icon-ref-copy'>
              <CopyComponent
                text={props?.data?.[0]?.value || ""}
                options={{ format: "text/plain" }}
                shouldTruncate={false}
                shouldDisplayText={false}
              >
              </CopyComponent>
            </div>
            <div className='bg-sectionBG border border-StrokeColor w-9 h-9 rounded-5 flex items-center justify-center'>
              <div className="flex items-center space-x-2 justify-center">
                <Dropdown
                  dropdownRender={shareDrawerHandler}
                  trigger={["click"]}
                  className=""
                  open={localState?.isOpen}
                  destroyPopupOnHide={true}
                  onOpenChange={toggleDropdown}
                >
                  <button className='relative'>
                    <span className='icon ref-share cursor-pointer'></span>
                  </button>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='kpicardbg'>
        <div className="flex items-center gap-3.5">
          <span className='icon total-referrals'></span>
          <div>
            <h4 className="text-sm font-medium text-kpidarkColor">
              {props?.data?.[1]?.name}
            </h4>
            {props?.data?.[1]?.name === "Total Referrals" && <div>
              <h4 className="text-md text-kpidarkColor font-semibold">
                {props?.data?.[1].value}
              </h4>
            </div>}
          </div>
        </div>
      </div>
      <div className='kpicardbg'>
        <div className="flex items-center gap-3.5">
          <span className="icon referral-percent"></span>
          <div>
            <h4 className="text-sm font-medium text-kpidarkColor">
              {props?.data?.[2]?.name}
            </h4>
            {props?.data?.[2]?.name === "Referral Percentage" && <div className='flex items-center'>
              <h4 className="text-md text-kpidarkColor font-semibold">
                {props?.data?.[2]?.value || "0.00 "} %
              </h4>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}
export default KpisData;