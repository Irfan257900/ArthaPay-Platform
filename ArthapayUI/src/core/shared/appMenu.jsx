import {Fragment} from "react";
import { Menu } from "antd";

const AppMenu = ({
  list,
  labelName = "label",
  mode = "inline",
  theme = "dark",
  selectedItem = "",
  selectedSubMenu = "",
  menuClass = "",
  subMenuClass = "",
  hasIconClass = false,
  iconClassField = "className",
  submenuTitleClass = "",
  menuItemClass = "w-full h-full text-left pl-[10px]",
  onItemClick,
  onSubMenuHover,
  onSubMenuLeave,
  triggerSubMenuAction = "click",
  triggerOnFullItem = false,
  triggerMenuOnlyOnTitle = false,
}) => {
  const handleAction = (action, data, triggeredBy) => {
    triggerSubMenuAction === "click" &&
      action === "click" &&
      onItemClick?.(data, true, triggeredBy);
    triggerSubMenuAction === "hover" &&
      action === "leave" &&
      onSubMenuLeave?.(data, true, triggeredBy);
    triggerSubMenuAction === "hover" &&
      action === "enter" &&
      onSubMenuHover?.(data, true, triggeredBy);
  };
  return (
    <Menu
      theme={theme}
      mode={mode}
      selectedKeys={selectedItem ? [selectedItem] : []}
      openKeys={selectedSubMenu ? [selectedSubMenu] : []}
      className={menuClass}
    >
      {list?.map((item) => {
        return (
          <Fragment key={item.id}>
            {item?.hasSubMenu && (
              <Menu.SubMenu
                className={subMenuClass}
                key={item.id}
                icon={
                  <button
                    className=""
                    onClick={() => {
                      !triggerMenuOnlyOnTitle &&
                        handleAction("click", item, "icon");
                    }}
                  >
                    {hasIconClass ? (
                      <span className={item[iconClassField]}></span>
                    ) : (
                      item?.icon || null
                    )}
                  </button>
                }
                onMouseEnter={() =>
                  triggerOnFullItem && handleAction("enter", item, "fullItem")
                }
                onMouseLeave={() =>
                  triggerOnFullItem && handleAction("leave", item, "fullItem")
                }
                onTitleClick={() => {
                  triggerOnFullItem && handleAction("click", item, "fullItem");
                }}
                title={
                  <button
                    className="w-full h-full text-left pl-[10px]"
                    onClick={() => {
                      handleAction("click", item, "title");
                    }}
                  >
                    <span className={submenuTitleClass}>{item[labelName]}</span>
                  </button>
                }
                expandIcon={
                  <button
                    className="pl-4 pr-1.5"
                    onMouseEnter={() =>
                      handleAction("enter", item, "expandIcon")
                    }
                    onMouseLeave={() =>
                      handleAction("leave", item, "expandIcon")
                    }
                    onClick={() => {
                      handleAction("click", item, "expandIcon");
                    }}
                  >
                    <span className={`icon menu-expandicon`}></span>
                  </button>
                }
              >
                {item.children?.map((subItem) => {
                  return (
                    <Menu.Item
                      onClick={() => onItemClick(subItem, false,"subItem")}
                      key={subItem.id}
                    >
                      <div className={menuItemClass}>
                        {subItem?.icon && <span className=""></span>}
                        <span>{subItem[labelName]}</span>
                      </div>
                    </Menu.Item>
                  );
                })}
              </Menu.SubMenu>
            )}
            {!item?.hasSubMenu && (
              <Menu.Item
                icon={
                  <button
                    className=""
                    onClick={() => {
                      !triggerMenuOnlyOnTitle &&
                        handleAction("click", item, "icon");
                    }}
                  >
                    {hasIconClass ? (
                      <span className={item[iconClassField]}></span>
                    ) : (
                      item?.icon || null
                    )}
                  </button>
                }
                onClick={() => {
                  triggerOnFullItem && onItemClick(item, false)
                }}
                key={item.id}
              >
                <button onClick={()=>{
                  onItemClick(item, false)
                }} className={menuItemClass}>
                  <span className="text-menuText text-sm font-medium">{item[labelName]}</span>
                </button>
              </Menu.Item>
            )}
          </Fragment>
        );
      })}
    </Menu>
  );
};

export default AppMenu;
