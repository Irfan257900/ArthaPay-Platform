import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ActionController from "../onboarding/action.controller";
import { Tooltip } from "antd";
import ActionPermissionloader from "../skeleton/action.permission.loader";

const iconNames = {
  "Enable/Disable": "disable",
  enable: "disable",
  "enable/disable": "disable",
};
const titles = {
  "kyc-kyb": "KYC/KYB",
  disable: "Enable/Disable",
};
const ScreenActions = ({
  onClick,
  shouldUsePropsList = false,
  list = [],
  includeAdd = false,
  onlyAdd = false,
  controlledAction = true,
  isTab=false,
  activeTab="",
  tabsKey="tabs",
  actionsKey = "actions",
  loading=false,
  disabled = {},
  actionsLength=3,
  customButtons={},
  buttonClassNames={}
}) => {
  const currentScreen = useSelector((state) => state.userConfig.currentScreen);
  const permissions = useSelector((state) => state.userConfig.permissions?.permissions);
  const screenActions = useMemo(()=>{
    if(isTab){
      const currentTab=permissions?.[tabsKey]?.find(tab=>tab.name===activeTab);
      return currentTab?.[actionsKey]?.filter(action=>action.isEnabled) || []
    }
    return permissions?.[actionsKey]?.filter(action=>action.isEnabled) || []
  },[permissions,activeTab])
  const enabledActions = useMemo(() => {
    return screenActions.filter((action) => {
      if (onlyAdd && action.isEnabled) {
        return ["Add", "add"].includes(action.name);
      }
      return (
        action.isEnabled &&
        !["View", "view", ...(includeAdd ? [] : ["Add", "add"])].includes(
          action.name
        )
      );
    });
  }, [screenActions, onlyAdd, includeAdd]);

  const actions = useMemo(() => {
    return shouldUsePropsList ? [...list] : [...enabledActions];
  }, [shouldUsePropsList, list, enabledActions]);

  if ((!permissions && !shouldUsePropsList) || loading) {
    return <ActionPermissionloader actionsLength={actionsLength} />;
  }
  if(!actions?.length){
    return <></>
  }
  return (
    <div>
      <ul className="flex gap-2.5 items-center">
        {actions.map((action, index) => {
          const isLastAction = (actions.length>=2 && index === actions.length - 1);
          const normalizedName = action.name?.toLowerCase();
          return <li key={action.name}>
              <Tooltip
                placement={isLastAction ? "left" : "top"}
                title={titles[normalizedName] || action.name} className="inline-block"
              >
                {" "}
                {controlledAction ? (
                  <ActionController
                    handlerType="button"
                    onAction={() => onClick(action)}
                    actionFrom={currentScreen?.featureName}
                    buttonType="plain"
                    buttonClass={buttonClassNames[action?.name] || "p-0 rounded-full hover:bg-transparent focus:outline-0 outline-offset-0 border-none"}
                    redirectTo={currentScreen?.path}
                    disabled={disabled[index] || false}
                  >
                    {customButtons[action?.name]  || <span
                      className={`icon md ${disabled[index] ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
                        iconNames[normalizedName] || normalizedName
                      }`}
                    ></span>}
                  </ActionController>
                ) : (
                  <button
                    onClick={() => onClick(action)}
                    disabled={disabled[index] || false}
                  >
                    {customButtons[action?.name] ||<span
                      className={`icon md ${disabled[index] ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
                        iconNames[normalizedName] || normalizedName
                      }`}
                    ></span>}
                  </button>
                )}
              </Tooltip>
            </li>
        })}
      </ul>
    </div>
  );
};

export default ScreenActions;
