import { Tabs } from "antd";
import React from "react";
const { TabPane } = Tabs;
const AppTabs = ({
  tabPosition = "top",
  className = "",
  activeKey,
  onChange,
  defaultActiveKey,
  list = [],
  itemFields = { title: "title", key: "key" },
}) => {
  return (
    <Tabs
      tabPosition={tabPosition}
      className={className}
      activeKey={activeKey}
      onTabClick={onChange}
      defaultActiveKey={defaultActiveKey}
      destroyInactiveTabPane={true}
    >
      {list.map((tab) => {
        return (
          <TabPane
            tab={tab[itemFields["title"]]}
            key={tab[itemFields["key"]]}
          ></TabPane>
        );
      })}
    </Tabs>
  );
};

export default AppTabs;
