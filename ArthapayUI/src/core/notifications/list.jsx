import { useEffect, useState,memo, useCallback } from "react";
import { List as AntdList } from "antd";
import AppText from "../shared/appText";
import AppEmpty from "../shared/appEmpty";
import { useDispatch, useSelector } from "react-redux";
import HeaderNotificationsLoader from "../skeleton/header.notification.loader";
import { useNavigate } from "react-router";
import { setNotificationCount } from "../../reducers/dashboard.reducer";
import { getNotificationIcon } from "../../utils/app.config";
import AppAlert from "../shared/appAlert";
import { fetchNotifications, readNotification } from "../../modules/notifications/http.services";
import moment from "moment";

const List = () => {
  const userProfile = useSelector((store) => store.userConfig.details);
  const dispatch=useDispatch()
  const navigate=useNavigate();
  const [state, setState] = useState({
    loading: false,
    data: null,
    error: "",
  });
  useEffect(() => {
    fetchNotifications(setState, "cards");
  }, [userProfile?.id, setState]);


  const handleAction = () => {
    let currentDate = new Date().toISOString();
    let obj = {
      isRead: true,
      readDate: currentDate,
    };
    readNotification(
      () => dispatch(setNotificationCount(0)),
      obj,
      "cards"
    );
  };
  const handleRedirectToNotifications=useCallback(()=>{
    navigate(`/notifications`)
    handleAction();
  },[handleAction]);
  
  const renderNotificationItem = useCallback((item) => (
    <AntdList.Item className="!p-2 border border-borderLightGreen rounded-sm mb-2 border-block-end">
      <AntdList.Item.Meta
        avatar={<span className={`icon scale-75 shrink-0 ${getNotificationIcon(item?.action)}`} />}
        title={
          <div className="flex justify-between items-center gap-4">
            <AppText className="text-lightWhite text-[10px] font-medium">
              {item.action}
            </AppText>
            <AppText className="!text-descriptionGreyTwo text-[10px] font-normal">
              {item.date
                ? moment
                  .utc(item.date)
                  .local()
                  .format("DD MMM YY hh:mmA")
                : ""}
            </AppText>
          </div>
        }
        description={
          <AppText
            className={`text-descriptionGreyTwo text-[10px] font-normal`}
          >
            <span className="!text-descriptionGreyTwo">{item?.message}</span>
          </AppText>
        }
      />
    </AntdList.Item>
  ), [state.data]);

  return (
    <div className="w-72">
      <div className="flex justify-between mb-2.5">
        <h5 className=" text-sm m-0 text-lightWhite font-medium">
          Notifications
        </h5>
        {!state.loading && state.data?.length > 0 && (
          <button className="p-0 border-none outline-none hover:bg-none bg-none uppercase text-xs font-normal text-primaryColor" onClick={handleAction}>
            Mark All As Read
          </button>
        )}
      </div>
      {state.loading && <HeaderNotificationsLoader itemCount={3} />}
      {!state.loading && state.error && (<div className="px-4">
        <div className="alert-flex withdraw-alert fiat-alert">
          <AppAlert type="error" description={state.error} showIcon />
        </div>
        </div>
      )}

      {!state.loading && state.data?.length > 0 && (
        <AntdList
          itemLayout="vertical"
          size="large"
          className="notifications-list h-[215px] overflow-y-auto"
          dataSource={state.data || []}
          renderItem={renderNotificationItem}
        />
      )}
      {!state.loading && state.data?.length === 0 && (
       <div className="h-[215px]"> <AppEmpty/></div>
      )}
      {!state.loading && state.data?.length > 0 && (
        <div className="text-center">
          <button className="p-0 border-none outline-none hover:bg-none bg-none uppercase text-xs font-normal text-primaryColor text-center" onClick={handleRedirectToNotifications}>
            View All
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(List);
