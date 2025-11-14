import { Tabs } from "antd";
import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SingleBarLoader from "../skeleton/bar.loader";
const { TabPane } = Tabs;
const TabTitle = ({ title, icon }) => {
  return (
    <span className="flex gap-2.5 items-center">
      {icon && <span className={`icon ${icon}`}></span>}
      <span className="text-sm font-medium text-tabcolor mb-0">
        {title}
      </span>
    </span>
  );
};
const ScreenTabs = ({
  tabPosition = "top",
  className = "",
  activeKey,
  onChange,
  defaultActiveKey,
  shouldUsePropsList = false,
  list = [],
  shouldSelectFirstAsDefault=true,
  tabKey = "tabs",
  tabFields = { title: "name", key: "name",icon:"icon" },
  CustomTitle=null,
  loading=false,
}) => {
  const currentScreen=useSelector(state=>state.userConfig.currentScreen)
  const permissions = useSelector((state) => state.userConfig.permissions);
  const screenTabs = useMemo(() => {
    return permissions?.permissions?.[tabKey]?.filter(tab=>tab.isEnabled) || [];
  }, [permissions]);
  const tabs = useMemo(() => {
    return shouldUsePropsList ? [...list] : [...screenTabs];
  }, [shouldUsePropsList, list, screenTabs]);
  useEffect(()=>{
    shouldSelectFirstAsDefault && !activeKey && tabs?.length>0 && currentScreen?.screenName===permissions?.screenName &&  onChange(tabs?.[0]?.name)
  },[shouldSelectFirstAsDefault,tabs?.length,activeKey,currentScreen?.featureName,permissions?.featureName])
  if ((!permissions && !shouldUsePropsList) || loading) {
    return <SingleBarLoader />;
  }
  if(!tabs?.length){
    return <></>
  }
  return (
    <Tabs
      tabPosition={tabPosition}
      className={className}
      activeKey={activeKey}
      onTabClick={onChange}
      defaultActiveKey={defaultActiveKey}
      destroyInactiveTabPane={true}
    >
      {tabs.map((tab) => {
        return (
          <TabPane
            tab={CustomTitle ? <CustomTitle icon={tab[tabFields["icon"]]} title={tab[tabFields["title"]]}/> : <TabTitle icon={tab[tabFields["icon"]]} title={tab[tabFields["title"]]}/>}
            key={tab[tabFields["key"]]}
          ></TabPane>
        );
      })}
    </Tabs>
  );
};

export default ScreenTabs;
