import React, { useState, useMemo, useEffect, useReducer, useCallback } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import ListDetailLayout from "../../../core/module.layouts/listdetail.layout";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import AppDefaults from "../../../utils/app.config";
import { fetchBatchPayouts } from "../api/services";
import { getBatchPayoutDetails } from "../reducers/batchPayoutsReducer";
import StateChange from "./stateChange";
import { actionStatusList, statusWarningTexts } from "./services";
import { replaceExtraSpaces, VALIDATION_ERROR_MESSAGES } from "../../../core/shared/validations";
import { formReducer, formState } from "./reducer";
import AppAlert from "../../../core/shared/appAlert";
import { ItemRow } from "./batchPayoutServices";
const pageSize = 10;

const BatchPayOuts = () => {
  const [loader, setLoader] = useState(false);
  const reducerDispatch = useDispatch();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [stateChangeModal, setStateChangeModal] = useState(false);
  const { id, mode, type } = useParams();
  const location = useLocation()
  const customerInfo = useSelector((info) => info.userConfig.details);
  const [state, setState] = useReducer(formReducer, formState)

  const breadCrumbList = useMemo(() => {
    const defaultList = [
      { id: "1", title: "Payments", handleClick: () => navigate('/payments') },
    ];
    if (!mode || (mode !== 'create' && !selectedPayout?.walletName)) {
      return defaultList;
    }
    const formattedMode = mode !== 'create'
      ? `${selectedPayout?.batchName?.[0]?.toUpperCase()}${selectedPayout?.batchName?.substring(1)}`
      : `${mode?.[0]?.toUpperCase()}${mode?.substring(1)}`;
    let list = [...defaultList];

    if (mode === "create") {
      list = [
        ...list,
        { id: "2", title: "Batch Pay-Outs", handleClick: () => navigate(`/payments/batchpayouts/payout/${selectedPayout?.id}/${selectedPayout?.batchName}/view`) },
        { id: "3", title: 'Add Batch Pay-Outs', url: "" }
      ];
    } else if (mode === "edit") {
      list = [
        ...list,
        { id: "2", title: "Batch Pay-Outs", handleClick: () => navigate(`/payments/batchpayouts/payout/${selectedPayout?.id}/${selectedPayout?.batchName}/view`) },
        { id: "3", title: 'Edit Batch Pay-Outs' }
      ];
    } else {
      list = [
        ...list,
        { id: "2", title: "Batch Pay-Outs" },
        { id: "3", title: formattedMode }
      ];
    }

    return list;
  }, [selectedPayout?.batchName, mode, type]);


  useEffect(() => {
    if (location?.pathname === '/payments/batchpayouts' || (data?.length <= 0 && id && mode))
      getData();
  }, [location, customerInfo,id,mode]);

  useEffect(() => {
    if (customerInfo?.id && selectedPayout?.id && id) {
      reducerDispatch(getBatchPayoutDetails({
        customerId: customerInfo?.id,
        batchId: selectedPayout?.id
      }));
    }
  }, [customerInfo?.id, selectedPayout?.id, id])

  const clearErrorMessage = () => {
    setState({ type: 'setErrorMsg', payload: null })
  }

  const getData = async (
    currentData = [],
    pageToFetch = 1,
    searchValue = searchInput || null
  ) => {
    const urlParams = {
      searchValue: searchValue,
      pageNo: pageToFetch,
      pageSize: pageSize,
      currentData
    }
    await fetchBatchPayouts(setLoader, setData, setErrorMessage, urlParams, selectPayout, setPage);
  };
  const selectPayout = useCallback((payoutToSelect) => {
    clearErrorMessage();
    const {
      id,
      batchName,
      mode = "view",
    } = payoutToSelect || {};
    setSelectedPayout(payoutToSelect);
    if (id === `${AppDefaults?.GUID_ID}`) {
      return
    } else if (!payoutToSelect) {
      return
    } else {
      navigate(`/payments/batchpayouts/payout/${id}/${batchName}/${mode}`);
    }
  }, []);

  const handleForm = useCallback(() => {
    navigate(`/payments/batchpayouts/payout/${AppDefaults.GUID_ID}/new/create`);
  }, []);


  const handleSearchPayout = useCallback((value) => {
    value = replaceExtraSpaces(value);
    setSearchInput(value);
    getData([], 1, value || null);
  }, []);


  const handleStateChange = () => {
    setStateChangeModal(true);
  };

  const handleAction = useCallback((key) => {
    const keyValue = key?.name
    clearErrorMessage();
    const selectedRecord = selectedPayout
    if (!selectedRecord) {
      setErrorMessage(VALIDATION_ERROR_MESSAGES.PLEASE_SELECT_ONE_RECORD)
      return Promise.resolve();
    }
    const status = selectedRecord?.status?.toLowerCase() || '';
    if (actionStatusList[keyValue]?.includes(status)) {
      setState({ type: 'setErrorMsg', payload: statusWarningTexts(keyValue)[status] })
      return Promise.resolve();
    }
    const actions = {
      'Edit': editPaymentLink,
      'State Change': handleStateChange,
    }
    actions[keyValue]?.(selectedRecord)
  }, [selectedPayout])

  const editPaymentLink = () => {
    navigate(`/payments/batchpayouts/payout/${selectedPayout?.id}/${selectedPayout.batchName}/edit`);
  };

  const onStatusChangeSuccess = useCallback(async (value) => {
    setStateChangeModal(false);
    reducerDispatch(getBatchPayoutDetails({
      customerId: customerInfo?.id,
      batchId: selectedPayout?.id
    }));
    await getData();
  }, [customerInfo, selectedPayout]);

  const refreshPayments = useCallback(async () => {
    await getData();
    reducerDispatch(getBatchPayoutDetails({
      customerId: customerInfo?.id,
      batchId: selectedPayout?.id
    }));
  }, [customerInfo, selectedPayout])



  const fetchNextPage = useCallback(async (pageToFetch) => {
    await getData(data, pageToFetch + 1)
  }, [data])
  const ItemComponent = useCallback(({ data,handleListModalClose }) => {
    return (
      <ItemRow data={data} handleListModalClose={handleListModalClose} selectPayout={selectPayout} selectedPayout={selectedPayout} />
    );
  },[selectPayout,selectedPayout]);

  const renderViewHeader = useCallback(() => {
    if (mode === 'view' && data.length > 0) {
      return (
        <div className="flex justify-between items-start">
          <ListDetailLayout.ViewHeader
            logoType="custom"
            logo={<span>{selectedPayout?.batchName?.[0]}</span>}
            title={selectedPayout?.batchName}
            metaData={`${selectedPayout?.totalAmount} ${selectedPayout?.token}`}
            showActions={true}
            onAction={handleAction}
          />
        </div>
      );
    }

    if (mode === 'create') {
      return (
        <div className="flex justify-between items-start mb-5">
          <ListDetailLayout.ViewHeader
            logoType="custom"
            hasLogo={false}
            title={'Add Batch Pay-Outs'}
            showActions={false}
          />
        </div>
      );
    }

    return <></>;
  }, [data, selectedPayout, mode]);


  return (
    <>
      <ListDetailLayout
        breadCrumbList={breadCrumbList}
        ListHeader={
          <ListDetailLayout.ListHeader title="Batch Pay-Outs" onAdd={handleForm} refreshBtn={true} onRefresh={refreshPayments} />
        }
        ListComponent={
          <ListDetailLayout.List
            list={data || []}
            ItemComponent={ItemComponent}
            onSearch={handleSearchPayout}
            onSearchInput={setSearchInput}
            showAlert={errorMessage !== ""}
            alterMessage={errorMessage}
            searchValue={searchInput}
            pageSize={pageSize}
            currentPage={page}
            fetchNext={fetchNextPage}
            setShowAlert={setErrorMessage}
            searchPlaceholer={'Bacth Pay-Outs'}
            loading={loader}
          />
        }
        ViewHeader={renderViewHeader()}
      >
        {state?.errorMsg && (<div className="px-4">
          <div className="alert-flex" style={{ width: "100%" }}>
            <AppAlert
              className="w-100 "
              type="warning"
              description={state?.errorMsg}
              showIcon
            />
            <button className="icon sm alert-close" onClick={() => clearErrorMessage()}></button>
          </div>
        </div>)
        }
        <Outlet context={{ getData: getData, selectedPayout: selectedPayout }} />
      </ListDetailLayout>
      {stateChangeModal && <StateChange selectedRecord={selectedPayout} isModalOpen={stateChangeModal} onCancel={onStatusChangeSuccess} onSuccess={onStatusChangeSuccess} />}
    </>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
    trackauditlogs: userConfig?.trackAuditLogData,
  };
};
export default connect(connectStateToProps)(BatchPayOuts);
