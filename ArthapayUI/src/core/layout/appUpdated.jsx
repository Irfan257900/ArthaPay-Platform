import {memo} from "react";
import { useSelector } from "react-redux";
import AppAlert from "../shared/appAlert";

const AppUpdated = () => {
  const isUpdateAvailable=useSelector(store=>store.serviceWorker.isUpdateAvailable)
  return (
    <>
      {isUpdateAvailable && (
        <div className="alert-flex withdraw-alert fiat-alert">
        <AppAlert
         showIcon
         message="App Update"
         description="New app updates available. Please close all browser tabs & re-open app for seemless experience"
         type="warning"
        />
      </div>
      )}
    </>
  );
};
export default memo(AppUpdated);
