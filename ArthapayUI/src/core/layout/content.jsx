import { memo } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router";
import AppUpdated from "./appUpdated";
import { useSelector } from "react-redux";
import PlainLoader from "../shared/loaders/plain.loader";

const { Content } = Layout;
const AppContent = () => {
  const fetchingAppMenu=useSelector(store=>store.userConfig.fetchingAppMenu)
  return (
    <div className="p-4 xl:px-6 md:px-4 md:py-0 max-lg:mt-10">
      <AppUpdated />
      <Content>
        {!fetchingAppMenu  ? <Outlet /> : <PlainLoader/>}
      </Content>
    </div>
  );
};
export default memo(AppContent);
