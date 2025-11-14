import HelpPage from "../layout/help";
import Breadcrumb from "../layout/breadcrumb";
import Switcher from "../theme.switcher";
import Notifications from "../notifications";
import { useSelector } from "react-redux";

const PageHeader = ({ showBreadcrumb = true, breadcrumbList = [], showRightActions = true }) => {
  const helpEnabledScreens = useSelector(state => state.userConfig.helpEnabledScreens) || [];
  const permissions = useSelector(state => state.userConfig.permissions);

  const permissionList = Array.isArray(permissions) ? permissions : [permissions];

  const allowedScreens = new Set(
    permissionList
      .filter(p => p?.isEnabled)
      .map(p => p?.screenName)
      .filter(name => name)
  );

  const filteredHelpScreens = helpEnabledScreens.filter(screen =>
    allowedScreens.has(screen.screenName) && screen.isEnabled
  );

  return (
    <div className="flex justify-between items-center mb-5 -ml-4 md:-ml-6 -mr-4 md:mt-0 px-4 xl:px-8 py-3 bg-cardbackground border-b border-StrokeColor sticky top-0  z-[999] ">
      <div>
        {showBreadcrumb && <Breadcrumb breadCrumbList={breadcrumbList} />}
      </div>
      {showRightActions && (
        <div className="flex items-center gap-2.5">
          <div className="hidden md:block">
            <Switcher />
          </div>
          <div className="hidden md:block relative">
            <Notifications />
          </div>
          {filteredHelpScreens?.[0]?.isHelpLink && <HelpPage helpLink={filteredHelpScreens?.[0]?.helpLink} />}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
