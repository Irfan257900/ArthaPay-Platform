import React, { useEffect, useMemo, useRef, useState } from "react";
import useApi from "../../hooks/useApi";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import PropTypes from "prop-types";
import TransactionsSummaryLoader from "../skeleton/transactions.loaders/transactions.summary.loader";
import AppEmpty from "./appEmpty";

const CHART_STATE_KEY = "areaChart";

function AreaChart({
  fetchOptions,
  fetchMethod,
  shouldFetch,
  chartProperties = {},
  events = {},
  seriesData = {},
  otherOptions = {},
  hasFetchParams,
  fetchParams,
  seriesKey = "series",
  shouldClear,
  description= "No Data"
}) {
  const { awaitingResponse, data, handleApi } = useApi();
  const [options, setOptions] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (shouldFetch && fetchParams) {
      handleApi(fetchMethod, fetchOptions, CHART_STATE_KEY, hasFetchParams, fetchParams, shouldClear);
    }
  }, [shouldFetch, fetchParams, shouldClear]);

  const drilldownEvents = (e) => {
    const { point, target } = e;
    const dataToDrill = shouldFetch ? data[CHART_STATE_KEY] : seriesData;

    if (dataToDrill) {
      Object.values(dataToDrill)
        .filter((_, key) => key.includes("drilldown"))
        .forEach((drilldownData) => {
          if (drilldownData[point.drilldown]?.name === point.series.name) {
            target.addSeriesAsDrilldown(point, drilldownData[point.drilldown]);
          }
        });

      target.applyDrilldown();
    }
  };

  const chartConfig = useMemo(() => {
    return {
      ...chartProperties,
      className: "bg-gray",
      events: { ...events, drilldown: drilldownEvents },
      type: "areaspline", // Smooth curved area chart
      renderTo: undefined,
      custom: {},
    };
  }, [chartProperties, events]);

  useEffect(() => {
    if (!shouldFetch) {
      const updatedData = seriesData?.[seriesKey]?.map((series) => ({
        ...series,
        data: series.data?.map((point) => ({ ...point, y: point.yAxis })),
        type: "areaspline",
        lineWidth: 2,
        fillColor: series.fillColor,
        color: series.color,
      }));

      setOptions({
        ...otherOptions,
        chart: chartConfig,
        series: updatedData || [],
      });
    }
  }, [shouldFetch]);

  const handleApiResponse = () => {
    const chartData = data?.[CHART_STATE_KEY];

    if (chartData) {
      const updatedData = chartData[seriesKey]?.map((series) => ({
        ...series,
        data: series.data?.map((point) => ({ ...point, y: point.yAxis })),
        type: "areaspline",
        marker: { enabled: false }, // Hide points
        lineWidth: 2,
        fillColor: series.fillColor,
        color: series.color,
      }));

      setOptions({
        ...otherOptions,
        chart: chartConfig,
        drilldown: { series: [] },
        series: updatedData || [],
      });
    }
  };

  useEffect(() => {
    if (shouldFetch && data) {
      handleApiResponse();
    }
  }, [shouldFetch, data]);

  const hasData = data?.[CHART_STATE_KEY]?.[seriesKey]?.length > 0 || seriesData?.[seriesKey]?.length > 0;
  const renderChartContent = () => {
    if (awaitingResponse[CHART_STATE_KEY]) {
      return <TransactionsSummaryLoader />;
    }
  
    if (hasData && options) {
      return <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />;
    }
    if(!hasData){
        return (
          <div className="flex items-center justify-center">
           <AppEmpty description={description}/>
          </div>
        );
    }
    return <></>
  };
  
  return <>{renderChartContent()}</>
}

AreaChart.propTypes = {
  fetchOptions: PropTypes.object,
  fetchMethod: PropTypes.func,
  shouldFetch: PropTypes.bool,
  chartProperties: PropTypes.object,
  events: PropTypes.object,
  seriesData: PropTypes.object,
  otherOptions: PropTypes.object,
  hasFetchParams: PropTypes.bool,
  fetchParams: PropTypes.object,
  seriesKey: PropTypes.string,
  shouldClear: PropTypes.bool,
  description: PropTypes.string,
};

export default AreaChart;
