import { useCallback } from "react";
import noAccessImage from "../../assets/images/OBJECT.svg";
import LogoutButton from "../authentication/logout.button";
import { useDispatch } from "react-redux";
import { clearUserInfo } from "../../reducers/userconfig.reducer";
import { userLogout } from "../../reducers/auth.reducer";

const AccessDenied = () => {
  const dispatch = useDispatch();

  const handleBeforeLogout = useCallback(() => {
    dispatch(clearUserInfo());
    dispatch(userLogout());
    localStorage.removeItem("redirectTo");
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-6 justify-center items-center border border-StrokeColor h-screen px-4">
      <div className="p-4 max-w-xl w-full">
        <div className="mb-7">
          <img src={noAccessImage} alt="Access Denied" className="mx-auto" />
        </div>
        <h1 className="text-lightWhite font-semibold text-2xl text-center mb-2">
          Access Denied
        </h1>
        <p className="text-lightWhite/80 font-medium text-lg text-center">
          You do not have permission to access this application.
        </p>
        <div className="text-center mt-8">
          <LogoutButton
            className="!w-[260px] !inline-flex justify-center items-center"
            beforeLogout={handleBeforeLogout}
            // skipConfirm={true}
          >
            Logout
          </LogoutButton>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;