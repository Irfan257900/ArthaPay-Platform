import React, { memo } from "react";
import numberFormatter from "../../utils/numberFormatter";
import { numberFormat } from "highcharts";
import AreaChart from "../../core/shared/areaChart";
import { useSelector } from "react-redux";


const chartProps = {
  type: "spline", // changed from "column" to "line"
  backgroundColor: "transparent",
  height: 116,
  marginBottom: 50,
  marginTop: 30,
  style: { fontFamily: "IBM Plex Sans" },
};
 
 
 
const RecentActivity = () => {
   const { loading } = useSelector((state) => state.payeeStore.kpis);
  const { graphData } = useSelector((state) => state.payeeStore.recentActivityGraph);

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
        const { number: value} = numberFormatter(this.y);
        return `<div class="!text-white font-semibold text-xs">${this.series.name}: ${numberFormat(
          value,
          0,
          ".",
          ","
        )}</div>`;
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
    allowDecimals: false,
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
     accessibility: {
      enabled: false
    }
  };
  return (
    <div className="kpicardbg">
      {!loading && graphData && graphData?.length > 0 && (
        <div className="">
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
        </div>)}
    </div>
  );
};
 
export default memo(RecentActivity);
