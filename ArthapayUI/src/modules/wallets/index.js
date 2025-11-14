import { useCallback, useMemo, useState } from 'react';
import Vaults from "./vaults";
import { Row, Modal } from "antd";
import { Outlet, useNavigate, useParams, } from "react-router";
import PageHeader from "../../core/shared/page.header";
import VaultsKpis from './kpi';

import useEnsureKpis from './useEnsuerkips';
import { capitalizeFirstLetter } from './service';
const Vaultsdetails = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { actionType, code } = useParams();
  const breadCrumbList = useMemo(() => {
    const list = [
      { id: "1", title: "Wallets", handleClick: () => navigateToDashboard() },
      { id: "2", title: "Crypto" },
    ];
    if (actionType && actionType !== "null" && actionType.trim() !== "") {
      list.push({ id: "3", title: capitalizeFirstLetter(actionType) });
    }
    if (code && code !== "null" && code.trim() !== "") {
      list.push({ id: "4", title: code.toUpperCase() });
    }

    return list;
  }, [actionType, code]);
  const navigateToDashboard = () => {
    navigate(`/wallets`)
  }


  const handleModalActions = useCallback((flag) => {
    setIsModalOpen(flag);
  }, [])

  const closeModelHandler = useCallback(() => {
    handleModalActions(false)
  }, [])

  const selectCoinCloseModelHandler = useCallback(() => {
    handleModalActions(true)
  }, [])
  useEnsureKpis();

  return (<>
    <div>
      <PageHeader breadcrumbList={breadCrumbList} helpLink='MYCARDS' />
      <div>
        <VaultsKpis />
      </div>
      <Row className="row-stretch">
        <div className="layout-bg left-panel pannel-bg left-items-stretch sm-none">
          <Vaults canAdd={true} screen={'crypto'} canSelectCoin={true} clearOnPanelClose={true} />
        </div>
        <div className="layout-bg left-panel pannel-bg left-items-stretch md-none">
          <div className="buy-token md-none mt-0">
            <div className="buy-coinselect" onClick={selectCoinCloseModelHandler}>
              <span className="buy-from">Select Wallet</span>
              <span className="icon sm down-angle" />
            </div>
          </div>
        </div>
        <Outlet />
      </Row>
    </div>
    <Modal
      className="custom-modal mobile-drop mobile-modal"
      onCancel={closeModelHandler}
      closable={true}
      open={isModalOpen}
      footer={false}
    >
      <div className="custom-flex p-4 pb-0">
        <h1 level={5} className="text-2xl text-titleColor font-semibold">
          All  Wallets
        </h1>
        <span onClick={closeModelHandler} className='icon lg close c-pointer'></span>
      </div>
      <div id="scrollableDiv" className='mobile-left-panel'>
        <div className="custom-flex p-4 pb-0"></div>
        <Vaults canAdd={true} screen={'crypto'} canSelectCoin={true} clearOnPanelClose={true} handleListModalClose={closeModelHandler} />
      </div>
    </Modal>
  </>

  );
};


export default Vaultsdetails
