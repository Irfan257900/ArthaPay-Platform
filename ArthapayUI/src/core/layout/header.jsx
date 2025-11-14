import { useEffect, useState, useCallback } from "react";
import { Dropdown } from "antd";
import { Link, useLocation, useNavigate } from "react-router";
import DefaultUser from "../../assets/images/defaultuser.jpg";
import { useDispatch, useSelector } from "react-redux";
import {
  clearUserInfo,
  fetchScreenPermissions,
  setCurrentScreen,
} from "../../reducers/userconfig.reducer.js";
import { userLogout } from "../../reducers/auth.reducer";
import { findMatchingMenu } from "./services.jsx";
import AppMenu from "../shared/appMenu.jsx";
import LogoutButton from "../authentication/logout.button.jsx";
import Switcher from "../theme.switcher.jsx";
import AppLogo from "./appLogo.jsx";
import MenusLoader from "../skeleton/menus.loader.jsx";

const LogoutText = () => {
  return (
    <span className="flex items-center gap-2">
      <span className="icon logout-icon" /> <span className="text-lightWhite font-medium">Logout</span>
    </span>
  );
};


const AppHeader = ({ onItemSelect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userInfo = useSelector((store) => store.userConfig.details);
  const menuLinks = useSelector((store) => store.userConfig.menuLinks);
  const currentScreen = useSelector((store) => store.userConfig.currentScreen);
  const [activeNavItem, setActiveNavItem] = useState(null);
  const [activeSubNavMenu, setActiveSubNavMenu] = useState(null);
  const handleBeforeLogout = useCallback(() => {
    dispatch(clearUserInfo());
    dispatch(userLogout());
  }, []);


  const accountSection = useCallback(() => {
    return (
      <div className="profile-dropdown-menu p-4">
        <img
          src={userInfo?.image || DefaultUser}
          alt=""
          className="dropdown-img"
        />
        <p
          className="profile-value overflow-ellipsiis prf-name"
          style={{ flexGrow: 12 }}
        >
          {userInfo?.name}
        </p>
        {userInfo?.customerState === "Approved" && (
          <Link
            className="block !text-textvodika font-semibold cursor-pointer text-sm"
            to={'/profile'}
          >
            Manage Account
          </Link>
        )}

        <ul>
          <li className="cursor-pointer mt-4">
            <LogoutButton
              className="w-full flex justify-start gap-0.5 items-center"
              beforeLogout={handleBeforeLogout}
            >
              <LogoutText />
            </LogoutButton>
          </li>
        </ul>
      </div>
    );
  }, [handleBeforeLogout, userInfo]);

  useEffect(() => {
    localStorage.setItem("redirectTo", pathname);
    updateSelectedMenu();
  }, [pathname, menuLinks]);

  useEffect(() => {
    if (currentScreen?.id) {
      dispatch(fetchScreenPermissions(currentScreen))
      window.scrollTo(0, 0)
    }
  }, [currentScreen?.id])

  const updateSelectedMenu = () => {
    if (!menuLinks?.length) {
      clearSelection();
      return;
    }
    if (pathname === "/") {
      navigate(menuLinks[0]?.path);
      return;
    }
    const selectedMenu = findMatchingMenu(menuLinks, pathname);
    if (!selectedMenu) {
      clearSelection();
      return;
    }

    const { id, hasSubMenu, children, path } = selectedMenu;

    if (hasSubMenu && pathname !== path) {
      handleSubMenuSelection(selectedMenu, children, path);
    } else {
      handleMainMenuSelection(selectedMenu, id);
    }
  };

  const clearSelection = () => {
    setActiveNavItem(null);
    setActiveSubNavMenu(null);
    dispatch(setCurrentScreen(null));
  };

  const handleSubMenuSelection = (selectedMenu, children, path) => {
    setActiveSubNavMenu(selectedMenu);
    if (path === pathname) {
      dispatch(setCurrentScreen(selectedMenu));
      setActiveNavItem(null);
      return;
    }

    const selectedChild = children?.find((child) =>
      pathname.includes(child.path)
    );
    if (!selectedChild) {
      clearSelection();
      return;
    }
    setActiveNavItem(selectedChild);
    dispatch(setCurrentScreen(selectedChild));
  };

  const handleMainMenuSelection = (selectedMenu, id) => {
    setActiveNavItem(selectedMenu);
    setActiveSubNavMenu(null);
    dispatch(setCurrentScreen(selectedMenu));
  };
  const handleItemClick = useCallback((item, hasSubMenu, triggeredBy) => {
    if (!item.path) {
      return;
    }
    if (item.path && hasSubMenu && triggeredBy === "expandIcon") {
      setActiveSubNavMenu(activeSubNavMenu?.id === item?.id ? null : item);
      return;
    }
    if (triggeredBy !== "subItem") {
      setActiveSubNavMenu(null);
    }
    onItemSelect?.()
    window.scrollTo(0, 0)
    navigate(`${item.path}`);
    dispatch(setCurrentScreen(item));
  }, [pathname, menuLinks, activeNavItem, activeSubNavMenu]);
  const handleLogoClick = useCallback(() => {
    navigate('/')
    onItemSelect?.()
  }, [pathname])
  return (
    <>
    <div className=" ">
       <div className="lg:hidden w-full bg-bodyBg max-lg:fixed right-0 border-b border-sidebarBr py-2 px-3 flex items-center gap-3 justify-end ">
        <Switcher className="block md:hidden" />
        <Dropdown
          className="cursor-pointer w-11"
          overlayClassName="secureDropdown"
          dropdownRender={accountSection}
          placement="bottomRight"
          arrow
        >
          <div className="profile-dropdown lg:hidden">
            {userInfo?.image != null && (
              <img
                src={userInfo?.image ? userInfo?.image : DefaultUser}
                className="login-user-img ml-auto rounded-full"
                alt={"user profile"}
              />
            )}
            {userInfo?.image === null && (
              <img
                src={userInfo?.image ? userInfo?.image : DefaultUser}
                className="login-user-img rounded-full"
                alt={"user profile"}
              />
            )}
          </div>
        </Dropdown>
      </div> 
    </div>
     
      <div className="overflow-auto max-lg:bg-bodyBg z-[9999] relative px-0 mb-4 md:h-auto h-screen border-r border-sidebarBr md:border-0">
        <div className="custom-header" id="area">
          <button
            className="flex items-center justify-center mt-12 mx-auto lg:mt-5 lg:mb-6 cursor-pointer"
            onClick={handleLogoClick}
          >
            <AppLogo />
          </button>
          <div className="hidden lg:block ">
            <hr className="bg-StrokeColor text-StrokeColor border-StrokeColor" />
            <div className="text-center mt-[14px] space-y-1.5">
              <div className="border mx-auto border-StrokeColor h-14 w-14 overflow-hidden rounded-full">
                <img
                  src={userInfo?.image || DefaultUser}
                  alt=""
                  className="object-cover h-14 w-14"
                />
              </div>

              <p
                className="text-lightWhite font-medium mb-0 mt-1 text-base break-words whitespace-pre-line"
                style={{ flexGrow: 12 }}
              >
                {userInfo?.name}
              </p>
              <span className="text-sm font-normal text-subTextColor block border-2 border-StrokeColor py-0.5 px-2.5 w-20 mx-auto rounded-[10px]">{userInfo?.accountType}</span>
              {userInfo?.customerState === "Approved" && (
                <Link
                  className="block !text-textvodika font-semibold cursor-pointer text-sm"
                  to={'/profile'}
                >
                  Manage Account
                </Link>
              )}
            </div>
          </div>
          <hr className="bg-StrokeColor my-4 text-StrokeColor border-StrokeColor" />
          {userInfo?.customerState === "Approved" && menuLinks?.length > 0 && (
            <AppMenu
              theme="dark"
              list={menuLinks}
              labelName="screenName"
              onItemClick={handleItemClick}
              selectedItem={activeNavItem?.id || ""}
              selectedSubMenu={activeSubNavMenu?.id || ""}
              hasIconClass={true}
              menuClass="menu-item main-menu mobile-dt-header"
              openSubMenuOnlyOnIconClick={true}
            />
          )}
          {!menuLinks.length && (
            <div className="my-8">
              <MenusLoader />
            </div>
          )}
        </div>
        <ul className="px-3 md:px-0">
          <li className="cursor-pointer mt-4">
            <LogoutButton
              className="w-full flex justify-start gap-0.5 pl-6 items-center logout-btn"
              beforeLogout={handleBeforeLogout}
            >
              <LogoutText />
            </LogoutButton>
          </li>
        </ul>
      </div>
    </>
  );
};

export default AppHeader;
