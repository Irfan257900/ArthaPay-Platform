import React, { useCallback, useEffect, useState } from "react";
import { Layout } from "antd";
import AppContent from "./content";
import AppHeader from "./header";
import NotificationsHubConnector from "./notifications.hub.connector";
import SessionHandler from "../authentication/session.handler";
import Relogin from "../authentication/relogin";
import { useDispatch } from "react-redux";
import { setDeviceToken, setProfile } from "../../reducers/auth.reducer";
import {
  fetchUserDetails,
  getIpRegistryData,
} from "../../reducers/userconfig.reducer";
import Onboarding from "../onboarding";
import * as serviceWorkerRegistration from "../../serviceWorkerRegistration";
import { store } from "../../store";
import { updateWorker } from "../../reducers/serviceWorker";

const { Sider } = Layout;
const onUpdate = () => {
  store.dispatch(updateWorker());
};

const LayoutContent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [broken, setBroken] = useState(false);
  const dispatch = useDispatch();

  const setUserInfo = useCallback(
    (token, userInfo) => {
      dispatch(setDeviceToken(token));
      dispatch(setProfile(userInfo));
      dispatch(fetchUserDetails(userInfo.sub.split("|")[1]));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(getIpRegistryData());
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onItemSelect = useCallback(() => {
    broken && setCollapsed(true);
  }, [broken]);

  const onBreakpoint = useCallback((broken) => {
    setBroken(broken);
  }, []);

  const onCollapse = useCallback((collapsed) => {
    setCollapsed(collapsed);
  }, []);

  return (
    <SessionHandler setUserInfo={setUserInfo}>
      <Relogin>
        <Layout className="flex bg-bodyBg">
          <Onboarding>
            <Sider
              breakpoint="lg"
              collapsedWidth="0"
              className="sidebar"
              collapsed={collapsed}
              onBreakpoint={onBreakpoint}
              onCollapse={onCollapse}
              as="nav" // Semantic: use <nav> here
            >
              <div className="layout sticky-header overflow-auto">
                <header> {/* Semantic: wrap header component */}
                  <AppHeader onItemSelect={onItemSelect} />
                </header>
              </div>
            </Sider>
            <Layout>{/* Semantic: wrap main content */}
                <AppContent />
              <footer>
                {/* If you have a footer component, render here */}
              </footer>
            </Layout>
          </Onboarding>
        <NotificationsHubConnector />
        </Layout>
      </Relogin>
    </SessionHandler>
  );
};

serviceWorkerRegistration.register({ onUpdate });
export default React.memo(LayoutContent);