import React, {useEffect, useCallback,useMemo, useState } from 'react';
import { Alert } from 'antd';
import { numberFormat } from 'highcharts';
import PropTypes from 'prop-types';
import Loader from '../../core/shared/loader';
import LineChart from '../../core/shared/lineChart';
import numberFormatter from '../../utils/numberFormatter';
import { appClientMethods } from './httpClients';
 const SummaryGraph = ({removeClassName}) => {
  const chartProps = {
    type: "column",
    backgroundColor: "Transparent",
    height: 360,
    marginBottom: 60,
    marginTop: 10,
    style: { fontFamily: "IBM Plex Sans"},
};
const [filters, setFilters] = useState('Week');
const [error, setError] = useState('')
const [gettingYears, setGettingYears] = useState(false);
useEffect(() => {
    setGettingYears(true)
}, [])
const getSummaryGraphData = useCallback(() => {
    return appClientMethods.get(`payments/summary?type=${filters}`);
},[filters]);
     const handleRangeChange = useCallback((value) => {
         setFilters(value)
     }, [])
const fetchParams = useMemo(() => {
    return [filters]
}, [filters])
 
const otherOptions = {
  chart: {
    spacingTop: 5, 
    spacingBottom: 5,
    marginTop: 10, 
    marginBottom: 30,
    backgroundColor: "transparent"
  },
  title: {
    text: '',
  },
  tooltip: {
    formatter: function () {
      const { number: value, suffix = '' } = numberFormatter(this.y)
      return `${this.series.name}: <b>$${numberFormat(value, 2, '.', ',')}${suffix}</b>`;
    }
  },
  xAxis: {
    type: 'category',
    labels: {
      rotation: -45,
      formatter: function () {
        const text = this.value;
        const formatted = text.length > 15 ? text.substring(0, 12) + '...' : text;
        return '<div title="' + text + '">' + formatted + '</div>';
      },
      useHTML: true,
      style: {
        color: '#FFFFFF'
      }
    }
  },
  yAxis: {
    min: 0,
    max: 1,   // keeps values close, avoids big empty space
    title: {
      text: `<span class="text-lightWhite">USD</span>`,
      useHTML: true
    },
    labels: {
      style: {
        color: "var(--lightWhite)"
      },
      formatter: function () {
        const { number: value, suffix = '' } = numberFormatter(this.value)
        return `${numberFormat(value, 2, '.', ',')}${suffix}`;
      }
    }
  },
  plotOptions: {
    series: {
      marker: {
        radius: 3,        // smaller marker
        symbol: 'circle'  // instead of big diamond
      }
    }
  },
  lang: {
    thousandsSep: ','
  },
  credits: {
    enabled: false
  },
};


const closeError = useCallback(()=>{
    setError(null)
},[])
return (
        <div className={` payments-graph ${removeClassName ? "" : "bg-sectionBG border-t-borderLightGreen border-t p-5 rounded-sm"}`}>
            <div className="">
                 {/* <h3 className="text-2xl font-semibold text-titleColor mb-1 md:hidden block">Transactions Summary</h3> */}
                 <div className="text-right"> <div className="text-right">
                <div className='flex items-center justify-between'>
                    <h4 className="text-base font-semibold text-titleColor my-2">
                    Amount
                </h4>
                <div className="range-buttons border border-StrokeColor rounded-md flex md:block">
     
                    <button
                     className={filters === "Week" ? "active bg-primaryColor !border border-primaryColor text-lightDark px-4 py-1 text-xs rounded-l-md w-full md:w-auto" : "text-xs text-subTextColor px-4 py-1 border border-StrokeColor rounded-l-md w-full md:w-auto"}
                        onClick={() => handleRangeChange("Week")}
                    >
                       Week
                    </button>
               
                    <button
                      className={filters === "Month" ? "active active bg-primaryColor !border border-primaryColor text-lightDark px-4 py-1 text-xs rounded-r-md w-full md:w-auto" : "text-xs text-subTextColor px-4 py-1 border border-StrokeColor rounded-r-md w-full md:w-auto"}
                        onClick={() => handleRangeChange("Month")}
                    >
                      Month
                    </button>
                </div>
                </div>
            </div>
            </div>
            </div>
            {error !== null && error && (
                <div className="alert-flex">
                    <Alert
                        type="error"
                        description={error}
                        onClose={closeError}
                        showIcon
                    />
                    <button className="icon sm alert-close" onClick={() => setError(null)}></button>
                </div>
            )}
 
            {!filters && <Loader />}
            {filters && <LineChart
                shouldFetch={true}
                chartProperties={chartProps}
                fetchMethod={getSummaryGraphData}
                seriesKey="transactionsModels"
                otherOptions={otherOptions}
                hasFetchParams={true}
                axiskey={'yAxis'}
                fetchParams={fetchParams}
                gettingFilters={gettingYears}
            />}
        </div>
);
};
SummaryGraph.propTypes = {
    customerInfo:PropTypes.object.isRequired,
    removeClassName:PropTypes.bool
};
 
export default SummaryGraph;