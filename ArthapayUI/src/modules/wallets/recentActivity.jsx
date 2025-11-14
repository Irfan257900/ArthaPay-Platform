import React from "react";
import numberFormatter from "../../utils/numberFormatter";
import { numberFormat } from "highcharts";
import AreaChart from "../../core/shared/areaChart";
import { useSelector } from "react-redux";
import AppEmpty from "../../core/shared/appEmpty";

const chartProps = {
  type: "spline",
  backgroundColor: "transparent",
  height: 116,
  marginBottom: 50,
  marginTop: 30,
  style: { fontFamily: "IBM Plex Sans" },
};

const RecentActivity = () => {
  const { data = [], loading } = useSelector((state) => state?.withdrawReducer?.graphDetails || {});

  const hasValidData =
    Array.isArray(data) &&
    data.length > 0 &&
    Array.isArray(data[0]?.data) &&
    data[0].data.length > 0;

  const xCategories = hasValidData ? data[0].data.map((point) => point.name) : [];

  const otherOptions = {
    chart: {
      type: "spline",
      backgroundColor: "transparent",
    },
    title: { text: "" },
    tooltip: {
      backgroundColor: "bg-[#ccc]",
      enabled: true,
      useHTML: true,
      borderRadius: 4,
      formatter: function () {
        const { number: value, suffix = "" } = numberFormatter(this.y);
        return `<div class="!text-white font-semibold text-xs">${this.key} ${this.series.name}: $${numberFormat(
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
      lineColor: "#ccc",
      tickColor: "#ccc",
      labels: {
        style: { color: "#999" },
      },
    },
    yAxis: {
      visible: true,
      title: { text: "" },
      gridLineWidth: 0,
      lineColor: "#ccc",
      tickColor: "#ccc",
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
    accessibility: {
      enabled: false
    }
  };

  return (
    <div className="kpicardbg">
      {loading ? (
        <div className="text-center text-sm text-gray-400 py-6"></div>
      ) : hasValidData ? (
        <AreaChart
          shouldFetch={false}
          seriesData={{ transactionsModels: data }}
          chartProperties={chartProps}
          seriesKey="transactionsModels"
          otherOptions={otherOptions}
          hasFetchParams={false}
          axiskey={"yAxis"}
        />
      ) : (
        <div className="text-center text-sm text-gray-400 ">
          <AppEmpty />
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
