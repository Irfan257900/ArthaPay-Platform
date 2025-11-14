import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import Kpis from "./kpis";
import List from "../../core/grid.component";
import { MemberState, RefId, RegDate, SelectionBox, Status } from "./customColumns";
import { gridReducer, gridState } from "./reducers";
import { VALIDATION_ERROR_MESSAGES } from "../../utils/validations";
import EnableOrDisable from "./enableOrDisable";
import AppAlert from "../../core/shared/appAlert";
import AppSearch from "../../core/shared/appSearch";
import PageHeader from "../../core/shared/page.header";
import ScreenActions from "../../core/shared/screenActions";
import CommonDrawer from "../../core/shared/drawer";
import Invite from "./invite";
import AppDefaults from "../../utils/app.config";
import { currentApiVersion, TransactionsEmailHandler } from "./services";
import { getPageInititalDetails } from "./httpServices";
import AppSelect from "../../core/shared/appSelect";

const RegisteredApiUrl = `${window.runtimeConfig.VITE_CORE_API_END_POINT}`;

const Team = () => {
  const gridRef = useRef();
  const [state, setState] = useReducer(gridReducer, gridState);
  const breadCrumbList = useMemo(() => {
    return [{ id: "1", title: "Team" }];
  }, []);
  useEffect(() => {
      getPageInititalDetails(setState);
    }, []);
  const setErrorMessage = (message = "", errorType = "error", errorOf = "") => {
    setState({
      type: "setError",
      payload: { message, type: errorType, errorOf },
    });
  };
  const handleTeamChange = useCallback((value) => {
    setState({ type: "setSelectedTeam", payload: value });
  }, [])

  const handleInvite = () => {
    setState({ type: "setInvite", payload: true });
  };
  const handleEnableOrDisable = () => {
    setState({ type: "setModal", payload: "disable" });
  };
  const handleDownload = () => {
    setState({ type: "setShouldDownload", payload: true });
  };
  const handleModalClose = useCallback(() => {
    setState({
      type: "setStates",
      payload: {
        modal: "",
        loading: "",
        error: gridState.error,
        selection: null,
      },
    });
  }, [])
  const handleAction = useCallback(
    ({ name: key }) => {
      const shouldSelect = ["Enable/Disable"].includes(key);
      const selectedRecord = state.selection;

      if (shouldSelect && !selectedRecord) {
        setErrorMessage(
          VALIDATION_ERROR_MESSAGES.PLEASE_SELECT_ONE_RECORD,
          "warning"
        );
      } else if (shouldSelect && selectedRecord?.id === AppDefaults.GUID_ID) {
        setErrorMessage(
          VALIDATION_ERROR_MESSAGES.TEAM_DISABLE_NOT_REGISTERED,
          "warning"
        );
      } else {
        const actions = {
          Invite: handleInvite,
          "Enable/Disable": handleEnableOrDisable,
          "Excel Export": handleDownload,
        };
        actions[key]?.(selectedRecord);
      }
    },
    [state.selection]
  );
  const onEnableOrDisable = useCallback(() => {
    gridRef?.current?.refreshGrid?.();
    handleModalClose();
  }, []);
  const onSearchInput = useCallback((e) => {
    setState({ type: "setSearchInput", payload: e.target.value });
  }, [])
  const onSearch = useCallback((value) => {
    const valueToSearch = value?.trim() || null;
    setState({ type: "setFilters", payload: { searchParam: valueToSearch } });
    setState({ type: "setSearchInput", payload: value });
  }, [])
  const handleMemberSelection = useCallback((data) => {
    setErrorMessage();
    let selection = null;
    if (state.selection?.id !== data.id) {
      selection = data;
    }
    setState({ type: "setSelection", payload: selection });
  }, [state.selection])
  const renderSelectionBox = (cellProps) => {
    return (
      <SelectionBox
        cellProps={cellProps}
        state={state}
        handleMemberSelection={handleMemberSelection}
      />
    );
  };

  
  const transactionsEmailHandler =(propsData) => {
    return(<TransactionsEmailHandler propsData={propsData}/>)
  }


  const RegisteredColumns = [
    {
      field: "",
      title: "",
      width: 50,
      filter: false,
      sortable: false,
      customCell: renderSelectionBox,
    },
    {
      field: "refId",
      title: "ID",
      filter: false,
      filterType: "text",
      width: 200,
      customCell: RefId,
    },
    {
      field: "email",
      title: "Email",
      filter: false,
      filterType: "text",
      width: 180,
      customCell:transactionsEmailHandler,
      isEncrypted: true

    },
    {
      field: "registeredDate",
      title: "Registered Date",
      filter: false,
      filterType: "date",
      width: 150,
      customCell: RegDate,
    },
    {
      field: "customerState",
      title: "State",
      filter: false,
      filterType: "text",
      width: 100,
      customCell: MemberState,
    },
    {
      field: "status",
      title: "Status",
      filter: false,
      filterType: "text",
      width: 100,
      customCell: Status,
    },
  ];
  const gridQuery = useMemo(() => {
        const { searchParam=null } = state.filters;
        return `status=${state.selectedTeam}&search=${searchParam}`;
    }, [state.filters,state?.selectedTeam]);
  const handleSaveDrawerClose = useCallback(() => {
    setState({ type: "setInvite", payload: false });
    setState({ type: "setRefresh", payload: true });
    gridRef?.current?.refreshGrid?.();
  }, [])
  const closeError = useCallback(() => {
    setErrorMessage()
  }, [])
  const onExportSuccess = useCallback(() => {
    setState({ type: "setShouldDownload", payload: false })
  }, [])
  const handleDrawerClose = useCallback(() => {
    setState({ type: "setInvite", payload: false });
  }, [])
  return (
    <div>
      <PageHeader breadcrumbList={breadCrumbList} />
      <Kpis isRefresh={state?.isRefresh} state={state} setState={setState} />
      <div className="team-tabs mt-4 kpicardbg db-table hover-bg">
        <div className="flex gap-3 items-start justify-between ">
          <div className="grid md:grid-cols-3 gap-4 flex-1 mb-4 pb-0">
            <AppSelect
              className=""
              maxLength={15}
              placeholder="Type"
              value={state?.selectedTeam}
              loading={state.loading === "data"}
              onSelect={handleTeamChange}
              options={state.lookups.transactionTypes || []}
              fieldNames={{ label: 'name', value: 'code' }}
            />
            <AppSearch
              className="coin-search-input border transaction-search"
              value={state.searchInput}
              allowClear
              suffix={
                <button
                  className="border-none outline-none bg-transparent focus:bg-transparent focus:border-none"
                  onClick={() => onSearch(state.searchInput)}
                >
                  <span className="icon md search c-pointer" />
                </button>
              }
              onChange={onSearchInput}
              onSearch={onSearch}
              placeholder="Search (name, email address)"
            />
          </div>
          <div className="flex items-center justify-end gap-4 p-4 pb-0">
            <ScreenActions onClick={handleAction} />
          </div>
        </div>
        {state.error.message && (
          <div className="alert-flex withdraw-alert fiat-alert">
            <AppAlert
              type={state.error.type}
              description={state.error.message}
              showIcon
              closable
              afterClose={closeError}
            />
          </div>
        )}
        <div className="">
          <List
            ref={gridRef}
            url={`${RegisteredApiUrl}/${currentApiVersion}/teams/members`}
            pSize={10}
            columns={RegisteredColumns}
            showExcelExport={state.shouldDownload}
            excelFileName="Registered_Members"
            onExportSuccess={onExportSuccess}
            hasQuery={true}
            query={gridQuery}
            sensitiveFields={['email']}
          />
        </div>
      </div>
      <CommonDrawer
        title="Invite Member"
        isOpen={state?.invite}
        onClose={handleDrawerClose}
      >
        <Invite handleSaveDrawerClose={handleSaveDrawerClose} handleDrawerClose={handleDrawerClose} reducerState={state} setReducerState={setState}/>
      </CommonDrawer>
      <EnableOrDisable
        isOpen={state.modal === "disable"}
        selection={state.selection}
        handleModalClose={handleModalClose}
        onSuccess={onEnableOrDisable}
        reducerState={state}
        setReducerState={setState}
      />
    </div>
  );
};

export default Team;