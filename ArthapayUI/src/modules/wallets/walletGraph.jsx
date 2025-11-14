import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiControllers } from '../../api/config';
import { appClientMethods } from '../../api/clients';
import { numberFormat } from 'highcharts';
import PropTypes from 'prop-types';
import numberFormatter from '../../utils/numberFormatter';
import Loader from '../../core/shared/loader';
import LineChart from '../../core/shared/lineChart';
const WalletGraph = () => {
    const chartProps = {
        type: "column",
        backgroundColor: "Transparent",
        height: 400,
        marginBottom: 100,
        marginTop: 30,
        style: { fontFamily: "IBM Plex Sans"},
    };
    const [filters, setFilters] = useState("7");
    const [gettingYears, setGettingYears] = useState(false);

    useEffect(() => {
        setGettingYears(true)
    }, [])
    const getTransactionsChartData =useCallback(() => {
        return appClientMethods.get(`${ApiControllers.dashboard}VaultsDashboardGraph/${filters}`);

    }, [filters]);
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
    const handleRangeChange = (value) => {
        setFilters(value)
    };
    return (
        <div>
            <div className="bg-sectionBG border border-dbkpiStroke p-2.5 md:p-5 rounded-5">
                <div className="md:flex items-start justify-between md:justify-end pb-5 ">
                    <h3 className="text-base font-semibold text-titleColor mb-0 md:hidden block">Transactions Summary</h3>
                     <div className="text-right">
                <div className="range-buttons border border-StrokeColor rounded-md flex md:block">
                    <button
                     className={filters === "7" ? "active bg-primaryColor !border border-primaryColor text-lightDark px-4 py-2 text-base rounded-l-md w-full md:w-auto" : "text-base text-subTextColor px-4 py-2 border border-dbkpiStroke rounded-l-md w-full md:w-auto"}
                        onClick={() => handleRangeChange("7")}
                    >
                        7 Days
                    </button>
                    <button
                      className={filters === "30" ? "active active bg-primaryColor !border border-primaryColor text-lightDark px-4 py-2 text-base rounded-r-md w-full md:w-auto" : "text-base text-subTextColor px-4 py-2 border border-dbkpiStroke rounded-r-md w-full md:w-auto"}
                        onClick={() => handleRangeChange("30")}
                    >
                        30 Days
                    </button>
                </div>
            </div>
                </div><div className=''>
                {!filters && <Loader />}
                {filters && <LineChart
                    shouldFetch={true}
                    chartProperties={chartProps}
                    fetchMethod={getTransactionsChartData}
                    seriesKey="transactionsModels"
                    otherOptions={otherOptions}
                    hasFetchParams={true}
                    axiskey={'yAxis'}
                    fetchParams={fetchParams}
                    gettingFilters={gettingYears}

                />}
                </div>
            </div>
        </div>
    );
};
WalletGraph.propTypes = {
    userInfo:PropTypes.object.isRequired
};
export default React.memo(WalletGraph);
