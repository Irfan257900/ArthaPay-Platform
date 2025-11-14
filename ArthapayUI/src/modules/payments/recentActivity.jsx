import React, { memo } from "react";
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
  const recentActivityGraph = useSelector(
    (state) => state.payoutReducer.recentActivityGraph
  );
  const rawData = recentActivityGraph?.graphData || [];

  // Map yAxis to y for Highcharts and check if all values are zero
  const { data, allZero } = React.useMemo(() => {
    let allZero = true;
    const mappedData = rawData.map(series => ({
      ...series,
      data: series.data.map(point => {
        if (point.yAxis !== 0) allZero = false;
        return { ...point, y: point.yAxis };
      })
    }));
    return { data: mappedData, allZero };
  }, [rawData]);

  const xCategories =
    data?.[0]?.data?.map((point) => point.name) || [];

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
      min: 0,                         
      max: allZero ? 1 : undefined,  
      tickInterval: allZero ? 1 : undefined 
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
    <div className="">
      <div className="">
        <div>
          {Array.isArray(data) && data.length > 0 ? (
            <AreaChart
              shouldFetch={false}
              seriesData={{ transactionsModels: data }}
              chartProperties={chartProps}
              seriesKey="transactionsModels"
              otherOptions={otherOptions}
              hasFetchParams={false} // This seems correct as data is from Redux
              axiskey={"y"}
            />
          ) : (
            <div className="text-center text-paraColor ">
              <AppEmpty />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(RecentActivity);