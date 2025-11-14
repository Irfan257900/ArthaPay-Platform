import React, { useState, useEffect, useCallback } from "react";
import pending from "../../assets/images/warning.svg";
import { useDispatch } from "react-redux";
import { clearUserInfo } from "../../reducers/userconfig.reducer";
import { userLogout } from "../../reducers/auth.reducer";
import LogoutButton from "./logout.button";
import { apiClient } from "../http.clients";
const SecurityLogin = ({ children }) => {
  const [isRelogin, setIsRelogin] = useState(false);
  const dispatch=useDispatch()
  const handleBeforeLogout = useCallback(() => {
    dispatch(clearUserInfo());
    dispatch(userLogout());
    localStorage.removeItem('redirectTo')
  },[localStorage])
  
  useEffect(() => {
    const interceptor = apiClient.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const stCode = error.response?.status;
        if (stCode === 401) {
          setIsRelogin(true);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      apiClient.axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  if (isRelogin) {
    return (
      <div className="lg:px-2 py-6 md:px-6 sm:px-2 text-secondaryColor mt-6 border-t border-rightincardBr bg-sectionBG rounded-sm ">
        <div className="h-full">
          <div className="basicinfo-form rounded-sm pb-4">
            <div className="text-center relative">
              <img src={pending} className="mx-auto" alt="Warning" />
              <div className="mt-4">
                <h2 className="text-2xl font-semibold text-titleColor text-center capitalize">
                  {" "}
                  Due to security reasons
                </h2>
                <h2 className="text-3xl font-semibold text-lightWhite text-center capitalize">
                  please logout and relogin
                </h2>
              </div>
              <div className="text-center mb-9 mt-5">
                <LogoutButton
                  className="!w-[300px] !inline-block justify-start gap-0.5 items-center logout-btn"
                  beforeLogout={handleBeforeLogout}
                >
                  Click Here to Re-login
                </LogoutButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecurityLogin;
