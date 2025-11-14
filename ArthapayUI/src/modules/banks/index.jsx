import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchKpis, resetState, fetchRecentActivityGraphData } from "../../reducers/banks.reducer";
import { Outlet } from "react-router";
import Overview from "./overview";
import PageHeader from "../../core/shared/page.header";
const Banks = () => {
  const dispatch = useDispatch();
  const breadcrumb = useSelector((state) => state.banks.breadCrumbLists);
  useEffect(() => {
    dispatch(fetchKpis({ showLoading: true }));
    dispatch(fetchRecentActivityGraphData())
    return () => {
      dispatch(resetState());
    };
  }, []);
  return (<>
    <PageHeader
      showBreadcrumb={true}
      breadcrumbList={breadcrumb}
    />
    <Overview />
    <Outlet />
  </>);

};

export default Banks;
