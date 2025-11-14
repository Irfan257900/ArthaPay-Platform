import React, { useEffect, useMemo, useRef, useState } from "react";
import useApi from "../../hooks/useApi";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import PropTypes from 'prop-types';
import TransactionsSummaryLoader from "../skeleton/transactions.loaders/transactions.summary.loader";
import AppEmpty from "./appEmpty";
const stateKeys = {
  chart: "chart",
};
function LineChart({
  fetchOptions,
  fetchMethod,
  chartOptions,
  shouldFetch,
  chartProperties,
  events,
  seriesData,
  otherOptions,
  hasFetchParams,
  fetchParams,
  seriesKey = "series",
  shouldClear
}) {
  const { awaitingResponse, data, handleApi } = useApi();
  const [options, setOptions] = useState(null)
  const { chart: chartState } = useMemo(() => {
    return stateKeys;
  }, []);
  const chartRef = useRef(null);
  useEffect(() => {
    shouldFetch && fetchParams && handleApi(fetchMethod, fetchOptions, stateKeys["chart"], hasFetchParams, fetchParams, shouldClear);
  }, [shouldFetch, hasFetchParams, fetchParams, shouldClear]);
  const drilldownEvents = (e) => {
    const { point, target, seriesOptions } = e;
    if (!seriesOptions) {
      const dataToDrill = shouldFetch ? data[chartState] : seriesData;
      for (let key in dataToDrill) {
        if (
          dataToDrill[key] &&
          key.includes("drilldown") &&
          dataToDrill[key].hasOwnProperty(point.drilldown)
        ) {
          const seriesToDrill = dataToDrill[key][point.drilldown];
          if (
            seriesToDrill["name"] === point.series.name &&
            [undefined, null, "line", ""].includes(seriesToDrill.type)
          ) {
            target.addSeriesAsDrilldown(point, seriesToDrill);
          }
        }
      }
      target.applyDrilldown();
    }
  };
  const propertiesForChart = useMemo(() => {
    const chartPropsToSet = chartProperties
      ? {
        ...chartProperties,
        className: "bg-gray",
      }
      : {};

    Object.defineProperties(chartPropsToSet, {
      events: {
        value: {
          ...events,
          drilldown: drilldownEvents,
        },
        writable: false,
        configurable: false,
        enumerable: true,
      },
      type: {
        value: "line",
        writable: false,
        configurable: true,
      },
      renderTo: {
        value: undefined,
        writable: false,
        configurable: false,
      },
      custom: { value: {}, writable: false, configurable: false },
    });
    return chartPropsToSet
  }, [chartProperties])

  useEffect(() => {
      if (!shouldFetch) {
        const updatedData = seriesData?.[seriesKey]?.map((series) => ({
          ...series,
          data: series.data?.map((point) => ({ ...point, y: point.yAxis })),
        }));
  
        setOptions({
          ...otherOptions,
          chart: propertiesForChart,
          series: updatedData || [],
        });
      }
    }, [shouldFetch]);
  const handleApiResponse = () => {
    const chartData = data?.[chartState] || [];
    let updatedData = []
    if (chartData) {
      updatedData = chartData.transactionsModels
        ?.map(series => {
          return {
            ...series, data: series.data?.map((point) => {
              return { ...point, y: point.yAxis }
            })
          }
        })
    }
    setOptions({
      ...otherOptions,
      chart: { ...propertiesForChart },
      drilldown: {
        series: [],
      },
      series: updatedData
    })

  };
  useEffect(() => {
    shouldFetch && data && handleApiResponse();
  }, [shouldFetch, data]);
  const hasData = data?.[stateKeys.chart]?.[seriesKey]?.length > 0 || seriesData?.[seriesKey]?.length > 0;
 const renderChartContent = () => {
  return (
    <div>
      {awaitingResponse[stateKeys.chart] ? (
        <TransactionsSummaryLoader />
      ) : hasData && options ? (
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
      ) : !hasData ? (
        <div className="flex items-center justify-center">
          <AppEmpty />
        </div>
      ) : null}
    </div>
  );
};
  
  return <>{renderChartContent()}</>
}
LineChart.propTypes = {
  fetchOptions: PropTypes.object.isRequired,
  fetchMethod: PropTypes.func.isRequired,
  chartOptions: PropTypes.object.isRequired,
  shouldFetch: PropTypes.bool.isRequired,
  chartProperties: PropTypes.object.isRequired,
  events: PropTypes.object.isRequired,
  seriesData: PropTypes.object.isRequired,
  otherOptions: PropTypes.object.isRequired,
  hasFetchParams: PropTypes.bool.isRequired,
  fetchParams: PropTypes.object.isRequired,
  seriesKey: PropTypes.string,
  shouldClear: PropTypes.bool.isRequired,
};
export default React.memo(LineChart);
