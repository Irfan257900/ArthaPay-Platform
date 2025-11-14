import React from 'react';
import { toDataSourceRequestString, translateDataSourceResultGroups } from '@progress/kendo-data-query';
import moment from 'moment';
import CryptoJS from "crypto-js";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { store } from '../../store';
import { deriveErrorMessage } from '../../core/shared/deriveErrorMessage';
import AppAlert from '../shared/appAlert';
import { getAccessTokenSilentlyGlobal } from '../authentication/auth0AccessToken';
import { decryptAES } from '../shared/encrypt.decrypt';

const filterOperators = {
    'text': [
        { text: 'grid.filterContainsOperator', operator: 'contains' },
        { text: 'grid.filterNotContainsOperator', operator: 'doesnotcontain' },
        { text: 'grid.filterEqOperator', operator: 'eq' },
        { text: 'grid.filterNotEqOperator', operator: 'neq' },
        { text: 'grid.filterStartsWithOperator', operator: 'startswith' },
        { text: 'grid.filterEndsWithOperator', operator: 'endswith' },
        { text: 'grid.filterIsEmptyOperator', operator: 'isempty' },
        { text: 'grid.filterIsNotEmptyOperator', operator: 'isnotempty' }
    ],
    'numeric': [
        { text: 'grid.filterEqOperator', operator: 'eq' },
        { text: 'grid.filterNotEqOperator', operator: 'neq' }
    ],
    'date': [
        { text: 'grid.filterAfterOrEqualOperator', operator: 'gte' },
        { text: 'grid.filterAfterOperator', operator: 'gt' },
        { text: 'grid.filterBeforeOperator', operator: 'lt' },
        { text: 'grid.filterBeforeOrEqualOperator', operator: 'lte' }
    ],
    'datetime': [
        { text: 'grid.filterEqOperator', operator: 'eq' },
        { text: 'grid.filterNotEqOperator', operator: 'neq' },
        { text: 'grid.filterAfterOrEqualOperator', operator: 'gte' },
        { text: 'grid.filterAfterOperator', operator: 'gt' },
        { text: 'grid.filterBeforeOperator', operator: 'lt' },
        { text: 'grid.filterBeforeOrEqualOperator', operator: 'lte' }
    ],
    'boolean': [
        { text: 'grid.filterEqOperator', operator: 'eq' }
    ]
}
export function withState(WrappedGrid) {
    return class StatefullGrid extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                excelExport: false,
                dataState: { skip: 0, take: this.props?.pSize || 10 },
                additionalParams: null,
                data: [],
                isLoading: false,
            };
            this.excelRef = React.createRef();
            this.gridref = React.createRef(null);
            this.tempRef = React.createRef(null)
        }
        numberWithCommas(x) {
            if (!x) {
                return ''
            } else if ((typeof x) === 'string') {
                return x
            }
            x = (typeof x) == 'string' ? x : x.toString();
            const arParts = x.split('.');
            const intPart = parseInt(arParts[0]).toLocaleString();
            const decPart = (arParts.length > 1 ? arParts[1] : '');
            return '' + intPart + (decPart ? ('.' + decPart) : '');
        }
        refreshGrid() {
            if (this.props.state?.gridState) {
                this.fetchData({ ...this.state.dataState, ...this.props.state?.gridState });
                this.setState((prev) => ({ ...prev, dataState: { ...prev.dataState, ...this.props.state?.gridState } }));
                return;
            }
            this.fetchData({ ...this.state.dataState, skip: 0 });
        }
        loadingPanel = (
            <div className="k-loading-mask">
                <span className="k-loading-text">Loading</span>
                <div className="k-loading-image"></div>
                <div className="k-loading-color"></div>
            </div>
        );
        exportToPDF = () => {
            if (this.tempRef.current)
                this.tempRef.current.save();
        }
        getCombineFieldValue = (dataItem, fields) => {
            for (const i in this.props.columns) {
                if (this.props.columns[i].filterType === "numeric") {
                    dataItem[fields[0]] = this.numberWithCommas(dataItem[fields[0]])
                    dataItem[fields[1]] = this.numberWithCommas(dataItem[fields[1]])
                }
            }
            return dataItem[fields[0]] && dataItem[fields[1]] ? `${dataItem[fields[0]]} / ${dataItem[fields[1]]}` : (dataItem[fields[0]] || dataItem[fields[1]]);
        }
        convertUTCToLocalTime = (dateString) => {
            let date = new Date(dateString);
            const milliseconds = Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds(),
            );
            return new Date(milliseconds)
        };
        handleExcelExport = () => {
            if (!this.excelRef || !this.excelRef.current || !this.excelRef.current.save) {
                return;
            }

            const workbook = this.excelRef.current.workbookOptions();
            workbook?.sheets[0]?.rows?.forEach(this.processRow);

            this.excelRef.current.save(workbook);
            this.props.onExportSuccess?.()
        };
        processRow = (item, index) => {
            if (item.type !== "data") {
                return;
            }

            for (const i in this.props.columns) {
                const idx = this.props.columns.length === item.cells.length ? i : (i - 1);
                this.processCell(item.cells[idx], this.props.columns[i]);
            }
        };

        processCell = (cell, column) => {
            if (!column) {
                return;
            }

            if (column.filterType === "date") {
                this.formatDateCell(cell, column);
            }

            if (column.filterType === "numeric") {
                this.formatNumericCell(cell);
            }

            if (column.combine) {
                cell.value = this.getCombineFieldValue(this.excelRef?.current.props.data[cell.rowIndex - 1], column.combineFields);
            }
            if (column.field === "email") {
                if (cell.value && column.isEncrypted) {
                    cell.value = decryptAES(cell.value);
                }
                else{
                    cell.value = cell.value;
                }
            }
        };

        formatDateCell = (cell, column) => {
            if (cell.value) {
                if (column.isShowTime)
                    cell.value = moment(this.convertUTCToLocalTime(cell.value)).format("DD/MM/YYYY hh:mm:ss A");
                else
                    cell.value = moment(cell.value).format("DD/MM/YYYY");
            }
        };

        formatNumericCell = (cell) => {
            if (cell.value) {
                cell.value = this.numberWithCommas(cell.value);
                cell.textAlign = "right";
            }
        };

        render() {
            return (
                <div className="cust-list relative">
                    {this.state.isLoading && this.loadingPanel}
                    {this.state.error && (<div className='mx-2'>
                        <div className="alert-flex withdraw-alert fiat-alert">
                            <AppAlert
                                type="error"
                                description={this.state?.error}
                                showIcon
                            />
                            <button className="icon sm alert-close" onClick={() => this.setState((prev) => ({ ...prev, error: null }))}></button>
                        </div>
                    </div>)}
                    {this.props.showExcelExport ?
                        <ExcelExport data={this.state.data} ref={this.excelRef} fileName={this.props?.excelFileName}>
                            <WrappedGrid ref={this.gridref}
                                sortable={true}
                                resizable={true}
                                filterOperators={filterOperators}
                                pageable={{ pageSizes: [5, 10, 20, 30, 40, 50, "All"] }}
                                {...this.props}
                                total={this.state.total}
                                data={this.state.data}
                                skip={this.state.dataState.skip}
                                pageSize={this.state.dataState.take}
                                filter={this.state.dataState.filter}
                                sort={this.state.dataState.sort}
                                onDataStateChange={this.handleDataStateChange}
                                loading={this.state.isLoading}
                            />
                        </ExcelExport>
                        :
                        <WrappedGrid ref={this.gridref}
                            sortable={true}
                            resizable={true}
                            filterOperators={filterOperators}
                            pageable={{ pageSizes: [5, 10, 20, 30, 40, 50, "All"] }}
                            {...this.props}
                            total={this.state.total}
                            data={this.state.data}
                            skip={this.state.dataState.skip}
                            pageSize={this.state.dataState.take}
                            filter={this.state.dataState.filter}
                            sort={this.state.dataState.sort}
                            onDataStateChange={this.handleDataStateChange}
                            loading={this.state.isLoading}
                        />}
                </div>
            );
        }
        componentDidMount() {
            if (this.props.state?.gridState) {
                this.fetchData({ ...this.state.dataState, ...this.props.state?.gridState });
                this.setState((prev) => ({ ...prev, dataState: { ...prev.dataState, ...this.props.state?.gridState } }));
                return;
            }
            this.fetchData(this.state.dataState);
        }
        componentDidUpdate(prevProps) {
            if (this.props.showExcelExport !== prevProps.showExcelExport && this.props.showExcelExport) {
                this.handleExcelExport();
            }
            if (JSON.stringify(this.props.additionalParams) !== JSON.stringify(prevProps.additionalParams) || this.props.url !== prevProps.url || this.props.query !== prevProps.query) {
                this.fetchData(this.state.dataState);
            }
        }
        componentWillUnmount() {
            if (this.excelExportSubscription) {
                this.excelExportSubscription.unsubscribe();
            }
        }
        handleDataStateChange = (changeEvent) => {
            let _dataState = { ...changeEvent.dataState };
            if (isNaN(_dataState.take)) {
                _dataState.take = this.state.total
            }
            this.props.callbacks?.onStateChange?.(_dataState)
            this.setState((prev) => ({ ...prev, dataState: _dataState }));
            this.props?.handlePageData?.(changeEvent.dataState);
            this.fetchData(_dataState);
        }
        _encrypt = (msg, key) => {
            msg = typeof (msg) == 'object' ? JSON.stringify(msg) : msg;
            const salt = CryptoJS.lib.WordArray.random(128 / 8);

            key = CryptoJS.PBKDF2(key, salt, {
                keySize: 256 / 32,
                iterations: 10
            });

            const iv = CryptoJS.lib.WordArray.random(128 / 8);

            const encrypted = CryptoJS.AES.encrypt(msg, key, {
                iv: iv,
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC

            });
            return ((salt.toString()) + (iv.toString()) + (encrypted.toString()));
        }
        getDateBasedOnOperator = (originalDate, operator) => {
            const formattedDate = moment(originalDate).format('YYYY-MM-DD');
            if (operator === 'lte' || operator === 'gt') {
                return new Date(`${formattedDate}T23:59:59`);
            } else {
                return new Date(`${formattedDate}T00:00:00`);
            }
        }
        fetchData = async (dataState) => {
            if (dataState.filter) {
                dataState.filter.filters?.map((item) => {
                    return item.filters?.map((value) => {
                        if (value.operator === "gte" || value.operator === "gt" || value.operator === "lte" || value.operator === "lt") {
                            const newValue = { ...value };// Create a shallow copy of the value object
                            newValue.value = newValue.value
                                ? this.getDateBasedOnOperator(newValue.value, newValue.operator)
                                : null;
                        }
                    })
                })
            }
            this.setState(prev => ({ ...prev, isLoading: true }))
            const state = store.getState();
            const { deviceToken } = {deviceToken:(await getAccessTokenSilentlyGlobal()) || state?.oidc?.deviceToken || null``};
            let queryStr = this.props.hasQuery ? `${this.props.query}&${toDataSourceRequestString(dataState)}` : `${toDataSourceRequestString(dataState)}`; // Serialize the state.
            const hasGroups = dataState.group && dataState.group.length;
            if (this.props.additionalParams) {
                let _additionalParams = '';
                for (let key in this.props.additionalParams) {
                    _additionalParams = _additionalParams + `/${this.props.additionalParams[key]}`
                }
                queryStr = _additionalParams + '?' + queryStr;
            } else {
                queryStr = '?' + queryStr
            }
            const base_url = this.props.url;

            let init = {
                method: 'GET', accept: 'application/json', headers: {
                    "Authorization": `Bearer ${deviceToken}`,
                }
            };
            if (this.props.reqConfig) {
                init.method = this.props.reqConfig.method;
                init.body = JSON.stringify(this.props.reqConfig.body);
                init.headers['Content-Type'] = 'application/json'
            }
            try {
                const response = await fetch(`${base_url}${queryStr}`, init)
                const formattedResponse = await response.json()
                if (!response.ok) {
                    throw new Error(deriveErrorMessage({ data: formattedResponse, status: response.status }))
                }
                this.setState(prev => ({ ...prev, data: hasGroups ? translateDataSourceResultGroups(formattedResponse.data) : formattedResponse.data, total: formattedResponse.total, error: null }))
            } catch (error) {
                this.setState(prev => ({ ...prev, error: error.message }))
            } finally {
                this.setState(prev => ({ ...prev, isLoading: false }))
            }
        }
    }
}