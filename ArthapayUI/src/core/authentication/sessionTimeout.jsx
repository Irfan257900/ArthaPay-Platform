import React from 'react';
import { useDispatch } from 'react-redux';
import { clearUserInfo } from '../../reducers/userconfig.reducer';
import { userLogout } from '../../reducers/auth.reducer';
import { useAuth0 } from '@auth0/auth0-react';
import pending from '../../assets/images/warning.svg';
import AppModal from '../shared/appModal';
import CustomButton from '../button/button';

const SessionTimeoutModal = ({ onContinue, showConfirmation, onClose, countdown }) => {
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();

  const handleContinue = async () => {
    try {
      await getAccessTokenSilently();
      onContinue();
    } catch (error) {
      handleRelogin();
    }
  };

  const handleRelogin = () => {
    dispatch(clearUserInfo());
    dispatch(userLogout());
    localStorage.removeItem('redirectTo');
    onClose();
  };

  return (
    <AppModal
      isOpen={showConfirmation}
      title={null}
      footer={null}
      onClose={handleContinue}
      closeIcon={<AppModal.CloseIcon onClose={handleContinue} />}
    >
      <div className="lg:px-2 py-6 md:px-6 sm:px-2 text-secondaryColor mt-6  bg-sectionBG rounded-sm">
        <div className="h-full">
          <div className="basicinfo-form rounded-sm pb-4">
            <div className="text-center relative">
              <img src={pending} className="mx-auto" alt="Warning" />
              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-titleColor text-center capitalize">
                  Session Timeout
                </h2>
                <h2 className="text-3xl font-semibold text-lightWhite text-center capitalize">
                  Your session is about to expire
                </h2>
                <h2 className="text-xl text-red-500 text-center mt-2">
                  Logging out in {countdown} second{countdown !== 1 ? "s" : ""}
                </h2>
              </div>
              <div className="text-center mt-5">
                <CustomButton
                  onClick={handleContinue} 
                  type='primary'               
                  className=" !w-[300px] !inline-block justify-start gap-0.5 items-center logout-btn bg-primaryColor text-lightWhite hover:bg-primaryColor/90"
                >
                  Continue
                </CustomButton>
                <div  className='mt-3'>
                  <CustomButton
                  onClick={handleRelogin}
                  className="!w-[300px] !inline-block justify-start gap-0.5 items-center logout-btn"
                >
                  Re-login
                </CustomButton>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};

export default SessionTimeoutModal;
