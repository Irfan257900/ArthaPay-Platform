import React from "react";
import {  Popover, Space } from "antd";
import NotificationList from "./list";
import { useSelector } from "react-redux";

const Notifications = () => {

  const notificationCount = useSelector(
    (store) => store.dashboardReducer.notificationCount
  );
  return (
    <Popover
      content={<NotificationList />}
      trigger={["click"]}
      destroyTooltipOnHide={true}
      placement="bottomLeft"
      overlayClassName="bg-sectionBG border p-0 border-borderLightGreen rounded-sm header-notifications !top-[58px] !right-[30px]"
      className="bg-transparent"
    >
      <button>
        <Space>
          <div className="relative">
            <span className="icon notification-large cursor-pointer"></span>{" "}
            {notificationCount>0 && (
              <span className="bg-textRed p-0.5 text-textWhite pb-1 text-[10px] font-medium min-h-4 min-w-4 text-center align-middle inline-block rounded-full absolute top-[-6px] right-[-5px] w-3 h-3">
                {notificationCount}
              </span>
            )}
          </div>
        </Space>
      </button>
    </Popover>
  );
};

export default Notifications;
