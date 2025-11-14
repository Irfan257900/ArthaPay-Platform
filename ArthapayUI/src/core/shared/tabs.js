import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs } from 'antd';
import StickyBox from 'react-sticky-box';
import { useParams } from 'react-router';
const actionNames = {
  deposit: 'Deposit',
  withdraw: 'Withdraw',
};

const AppTabs = ({ tabsData = [], labelKey = 'name', idKey = 'id', icon = 'icon', onTabChange }) => {
  const params = useParams();
  const [activeKey, setActiveKey] = useState(params?.actionType && actionNames[params.actionType]
    ? actionNames[params.actionType]
    : tabsData[0]?.[idKey]);

  useEffect(() => {
    if (tabsData.length > 0 && params?.actionType) {
      const newActiveKey = actionNames[params.actionType];
      if (newActiveKey !== activeKey) {
        setActiveKey(newActiveKey);
      }
    }
  }, [params?.actionType, tabsData]);

  const items = useMemo(()=>(
    tabsData.map((type) => ({
      label: (
        <>
          {type[icon]} {type[labelKey]}
        </>
      ),
      key: type[idKey],
    }))
  ),[tabsData,labelKey,idKey]);
  const handleTabChange = useCallback((key) => {
    const selectedTab = tabsData.find((tab) => tab[idKey] === key);
    setActiveKey(key);
    if (onTabChange) {
      onTabChange(selectedTab);
    }
}, [tabsData,activeKey]);
  const renderTabBar = useCallback((props, DefaultTabBar) => {
    return (
      <StickyBox>
          <DefaultTabBar {...props} />
      </StickyBox>
  );
}, []);
  return (
    <Tabs
      activeKey={activeKey}
      onChange={handleTabChange}
      renderTabBar={renderTabBar}
      items={items}
      className="custom-crypto-tabs"  
    />
  );
};

export default AppTabs;
