import { memo, useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Collapse } from "antd";
import feesAccordionConfig from "./fees.accordion.config";
import CommonFeesTable from './fees.common.view'
const FeeAccordions = ({ mode,membership,PanelComponent=CommonFeesTable }) => {
  const enabledModules = useSelector(
    (state) => state.userConfig.enabledModules
  );
  const [activePanels, setActivePanels] = useState([]);
  const handlePanelChange = useCallback((panels) => {
      const panelsToSet = panels ? [...panels] : [panels];
      setActivePanels(panelsToSet);
    }, []);
    const feePanels = useMemo(() => {
        return  enabledModules
       .filter((module) => feesAccordionConfig[module])
       .map((module) => {
         const {key,label,Loader}=feesAccordionConfig[module]
         return {
           key,
           label,
           children: <PanelComponent data={membership} mode={mode} module={key} Loader={Loader}/>,
         }
       });
       }, [membership,enabledModules,mode]);
  return (
    <Collapse
      activeKey={activePanels}
      onChange={handlePanelChange}
      items={feePanels}
      destroyInactivePanel={true}
      className="custom-collapse dashboard-collapse custome-collapse-bg"
    />
  );
};

export default memo(FeeAccordions);
