import React, {useEffect, useCallback,useMemo, useState } from 'react';
import { Alert } from 'antd';
import { numberFormat } from 'highcharts';
import PropTypes from 'prop-types';
import Loader from '../../core/shared/loader';
import LineChart from '../../core/shared/lineChart';
import numberFormatter from '../../utils/numberFormatter';
import { ApiControllers } from '../../api/config';
import { appClientMethods } from '../../api/clients';
import AppSelect from '../../core/shared/appSelect';
import { getGraphYearLu } from './http.services';
 const SummaryGraph = ({customerInfo,removeClassName}) => {
  const chartProps = {
    type: "column",
    backgroundColor: "Transparent",
    height: 400,
    marginBottom: 100,
    marginTop: 30,
    style: { fontFamily: "IBM Plex Sans"},
};
const currDate = new Date()
const [filters, setFilters] = useState(null);
const [error, setError] = useState('')
const [gettingYears, setGettingYears] = useState(false);
const [yearLu, setYearLu] = useState([])
useEffect(() => {
    setGettingYears(true)
    getYearLu()
    setFilters(currDate.getFullYear())
}, [])
const getSummaryGraphData = useCallback(() => {
    return appClientMethods.get(`${ApiControllers.dashboard}PaymentsDashboardGraph/${customerInfo.id}/${currDate.getFullYear()}`);
},[customerInfo,currDate]);
     const getYearLu = async () => {
         await getGraphYearLu(setYearLu, setGettingYears)
     }
     const handleYearLu = useCallback((value) => {
         setFilters(value)
     }, [])
     const yearOptions = useMemo(() => {
         return yearLu?.Years?.map((year) => ({
             label: year.name,
             value: year.code,
         }));
     }, [yearLu]);
const fetchParams = useMemo(() => {
    return [filters]
}, [filters])
 
const otherOptions = {
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
                const text = this.value,
                    formatted = text.length > 15 ? text.substring(0, 12) + '...' : text;
 
                return '<div title="' + text + '">' + formatted + '</div>';
            },
            useHTML: true,
            style: {
                color: '#FFFFFF'
            }
        }
    },
    yAxis: {
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
    lang: {
        thousandsSep: ','
    },
    credits: {
        enabled: false
    },
}

const closeError = useCallback(()=>{
    setError(null)
},[])
return (
        <div className={`${removeClassName ? "" : "bg-sectionBG border-t-borderLightGreen border-t p-5 rounded-sm"}`}>
            <div className="flex items-start justify-end pb-5 ">
                <AppSelect
                    className={"w-40"}
                    showSearch={false}
                    allowClear={false}
                    placeholder="Select Year"
                    value={filters}
                    onChange={handleYearLu}
                    options={yearOptions}
                    loading={gettingYears}
                />
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