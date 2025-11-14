import React, { memo } from "react";
import numberFormatter from "../../utils/numberFormatter";
import { numberFormat } from "highcharts";
import AreaChart from "../../core/shared/areaChart";
import { useSelector } from "react-redux";
import AppEmpty from "../../core/shared/appEmpty";
const chartProps = {
  type: "spline", // changed from "column" to "line"
  backgroundColor: "transparent",
  height: 130,
  marginBottom: 50,
  marginTop: 30,
  style: { fontFamily: "IBM Plex Sans" },
};
 
 
 
const RecentActivity = () => {
const { loading } = useSelector(state => state.banks.kpis)
  const { graphData } = useSelector(state => state.banks?.recentActivityGraph)
  const xCategories =
    graphData?.[0]?.data?.map((point) => point.name) || [];
  const otherOptions = {
    chart: {
      type: "spline",
      backgroundColor: "transparent",
    },
    title: { text: "" },
    tooltip: {
      backgroundColor:'bg-[#ccc]',
      enabled: true,
      useHTML: true,
      borderRadius: 4,
 
     
      formatter: function () {
        const { number: value, suffix = "" } = numberFormatter(this.y);
        return `<div class="!text-white font-semibold text-xs">${this.series.name}: $${numberFormat(
          value,
          2,
          ".",
          ","
        )}${suffix}</div>`;
      },
    },
    xAxis: {
      visible: true,
      categories: xCategories,
      lineColor: '#ccc',
      tickColor: '#ccc',
      labels: {
        style: { color: "#999" },
      },
    },
    yAxis: {
      visible: true,
      title: { text: "" },
      gridLineWidth: 0,
      lineColor: '#ccc',
      tickColor: '#ccc',
      labels: {
        style: { color: "#999" },
      },
    },
    plotOptions: {
      series: {
        fillOpacity: 0,
        marker: { enabled: false },
        lineWidth: 2,
      },
    },
    credits: { enabled: false },
    legend: { enabled: false },
  };
  return (
    <div className="kpicardbg flex justify-center items-center">
      {!loading && graphData && graphData?.length > 0 && (
      <div className="custom-create-graph">
        <div>
          <AreaChart
            shouldFetch={false}
              seriesData={{ transactionsModels: graphData }}
            chartProperties={chartProps}
            seriesKey="transactionsModels"
            otherOptions={otherOptions}
            hasFetchParams={false}
            axiskey={"yAxis"}
          />
        </div>
      </div>
      )}
      {!loading && (!graphData || graphData.length === 0) && (
        <div className="">
          <AppEmpty description="No activity yet!."  />
        </div>
      )}
    </div>
  );

};
 
export default memo(RecentActivity);
