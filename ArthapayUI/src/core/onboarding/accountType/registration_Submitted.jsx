import { useDispatch } from "react-redux";
import { userLogout } from "../../../reducers/auth.reducer";
import { clearUserInfo } from "../../../reducers/userconfig.reducer";
import { useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import CustomButton from "../../button/button";
import registerImage from '../../../assets/images/register.svg'

const RegistrationSubmitted = () => {
    const dispatch = useDispatch();
    const { logout } = useAuth0();
    const beforeLogout = useCallback(() => {
        dispatch(clearUserInfo());
        dispatch(userLogout());
    }, []);
    const logoutUser = useCallback((e) => {
        e.preventDefault();
        beforeLogout?.();
        logout({
            logoutParams: {
                federated: true,
                returnTo: `${window.runtimeConfig.VITE_REDIRECT_URI}#logout`,
            },
        });
    }, []);
    return (
        <div className="flex justify-center">
            <div className="py-6 w-full max-w-[700px] text-center">
                <div>
                   <img src={registerImage} className="mx-auto w-32 mb-4" />
                </div>
                <h2 className="text-[34px] font-semibold text-lightWhite mb-4">
                    Registration has been submitted successfully!
                </h2>
                <p className="text-subTextColor text-base leading-[1.6] mb-6">
                    Your registration details have been submitted successfully. You can now proceed with the next steps to complete your onboarding.
                </p>
                <div className="flex justify-center">
                    <CustomButton
                    type="primary"
                        onClick={logoutUser}
                        className=""
                    >
                        Continue Process
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSubmitted;
