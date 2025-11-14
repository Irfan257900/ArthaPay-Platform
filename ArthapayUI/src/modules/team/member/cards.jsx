import React, { useCallback, useMemo, useReducer, useRef } from "react";
import List from "../../../core/grid.component";
import CardsKpis from "./cards.kpis";
import AppSearch from "../../../core/shared/appSearch";
import { memberCardsReducer, memberCardsState } from "../reducers";
import { useParams } from "react-router";
import { CardImage, Status } from "./cards.columns";
import { currentApiVersion } from "../services";
const baseURL = `${window.runtimeConfig.VITE_CORE_API_END_POINT}`
const Cards = () => {
  const [state, setState] = useReducer(memberCardsReducer, memberCardsState);
  const gridRef = useRef();
  const { refId ,memberId} = useParams();
  const gridColumns = [
    {
      field: "name",
      title: "Name",
      filter: false,
      filterType: "text",
      width: 200,
      customCell: (props) => CardImage(memberId,refId, props?.dataItem),
    },
    {
      field: "type",
      title: "Card Type",
      filter: false,
      filterType: "text",
      width: 220,
    },
    {
      field: "balance",
      title: "Available",
      filter: false,
      filterType: "numeric",
      width: 170,
    },
    {
      field: "state",
      title: "Status",
      filter: false,
      filterType: "text",
      width: 170,
      customCell: Status,
    },
  ];
  const gridQuery = useMemo(() => {
      const { searchParam=null } = state.filters;
      return `search=${searchParam}`;
    }, [state.filters]);
  const onSearchInput = useCallback((e) => {
    setState({ type: "setSearchInput", payload: e.target.value });
  }, [])
  const onSearch = useCallback((value) => {
      const valueToSearch = value?.trim() || null;
      setState({ type: "setFilters", payload: { searchParam: valueToSearch } });
      setState({ type: "setSearchInput", payload: value });
    }, []);
  return (
    <div>
      <CardsKpis />
      <div className="kpicardbg mt-5">
      <div className="md:flex justify-between items-center mb-4">
        <div className="mb-2.5 md:mb-0">
          <AppSearch
            className="coin-search-input"
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
            placeholder="Search Card"
          />
        </div>
        <div className="flex gap-2 items-center justify-end md:justify-between">
        </div>
      </div>
        <List
        url={`${baseURL}/${currentApiVersion}/teams/members/${memberId}/cards`}
        pSize={10}
        columns={gridColumns}
        ref={gridRef}
        hasQuery={true}
        query={gridQuery}
      />
      </div>
    </div>
  );
};
export default Cards;
