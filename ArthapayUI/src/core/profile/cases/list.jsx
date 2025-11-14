import { connect } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import Grid from "../../grid.component";
import { Alert } from "antd";
import { useNavigate } from "react-router";
import { textStatusColors } from "../../../utils/statusColors";
import PageHeader from "../../shared/page.header";
import { useTranslation } from "react-i18next";
import AppKpis from "../../shared/AppKpis";
import KpiLoader from "../../skeleton/kpi.loader/kpi";
import { getCasesKpisData } from "./service";
const baseURL = window.runtimeConfig.VITE_CORE_API_END_POINT + '/api/v1';
const icons=['total-employees','approved','awaiting-payment','active-employees','inactive-employees']
const List = (props) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const { t } = useTranslation();
  const [state, setState] = useState({ loading: true, data: null, error: "" });

    useEffect(() => {
      getCasesKpisData(setState);
    }, []);
   const breadCrumbList = useMemo(() => {
      const defaultList = [
        { id: "1", title: `Support` },
      ];  
      return defaultList;
    }, [t]);
  const viewCase = (item) => {
    navigate(`${item.id}/${item.number}`);
  };
  const renderCaseNumber = (cellprops) => (
    <td>
      <div
        className="gridLink cursor-pointer text-primaryColor"
        onClick={() => viewCase(cellprops?.dataItem)}
      >
        {cellprops?.dataItem?.number}
      </div>
    </td>
  );
  const customStatusCell = (propsData) => {
    const status = propsData.dataItem?.state || "Approved";
    return (
      <td>
        <span className={textStatusColors[status]}>{status}</span>
      </td>
    );
  };
  const casesColoumns = [
    {
      field: "number",
      title: "Case Number",
      filter: false,
      customCell: renderCaseNumber,
    },
    { field: "title", title: "Case Title", filter: false },
    {
      field: "createdDate",
      title: "Date",
      filter: false,
      dataType: "date",
      filterType: "date",
    },
    {
      field: "state",
      title: "State",
      filter: false,
      customCell: customStatusCell,
    },
  ];
  const clearErrorMsg = useCallback(()=>{
    setErrorMessage(null);
},[]);

  return (
    <div className="">
      <PageHeader breadcrumbList={breadCrumbList} />
      {errorMessage && (
        <div className="alert-flex mb-24">
          <Alert
            type="error"
            description={errorMessage}
            onClose={clearErrorMsg}
            showIcon
          />
          <span
            className="icon sm alert-close c-pointer"
            onClick={clearErrorMsg }
          ></span>
        </div>
      )}
      <div className=" mb-5">
          {state.loading && <KpiLoader/>}
          {!state.loading && state.data && <AppKpis data={state.data} loader={state.loading} icons={icons} />}
          </div>
     <div className="kpicardbg">
       <Grid
        columns={casesColoumns}
        className="custom-grid"
        url={`${baseURL}/cases`}
        pSize={10}
      />
     </div>
    </div>
  );
};
const connectStateToProps = ({ userConfig }) => {
  return {
    user: userConfig.details,
  };
};
export default connect(connectStateToProps)(List);
