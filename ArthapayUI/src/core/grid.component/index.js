import * as React from 'react';
import { GridColumn, Grid ,GRID_COL_INDEX_ATTRIBUTE, GridNoRecords} from '@progress/kendo-react-grid';
import { withState } from './grid';
import { ColumnMenu } from './columnMenu'
import Moment from 'react-moment'
import { useTableKeyboardNavigation } from "@progress/kendo-react-data-tools";
import AppEmpty from '../shared/appEmpty';

const StatefullGrid = withState(Grid);
const CustomLockedCell = (props, customCell) => {
    const field = props.field || "";
    const value = props.dataItem[field];
    const navigationAttributes = useTableKeyboardNavigation(props.id);
    return (
        <td
            style={props.style} // this applies styles that lock the column at a specific position
            className={props.className} // this adds classes needed for locked columns
            colSpan={props.colSpan}
            role={"gridcell"}
            aria-colindex={props.ariaColumnIndex}
            aria-selected={props.isSelected}
            {...{
                [GRID_COL_INDEX_ATTRIBUTE]: props.columnIndex,
            }}
            {...navigationAttributes}>
            {customCell ? customCell(props) : value}
        </td>
    );
};
class List extends React.Component {
    constructor(props) {
        super(props);
        this.eleRef = React.createRef();
    }
    refreshGrid() {
        this.eleRef.current.refreshGrid();
    }
    renderDate = (props) => {
        if (props.dataItem[props.field]) {
            return <td><Moment format="DD/MM/YYYY">{this.convertUTCToLocalTime(props.dataItem[props.field])}</Moment></td>
        } else {
            return <td>{props.dataItem[props.field]}</td>
        }
    }
    renderDateTime = (props) => {
        if (props.dataItem[props.field]) {
            return <td><Moment format="DD/MM/YYYY hh:mm:ss A" globalLocal={true}>{this.convertUTCToLocalTime(props.dataItem[props.field])}</Moment></td>
        } else {
            return <td>{props.dataItem[props.field]}</td>
        }
    }
    renderNumber = (props) => {
        const formattedAmount = (amount) => {
          return amount?.toLocaleString('en-IN', { maximumFractionDigits: 18 });
        };

        return <td>{formattedAmount(props?.dataItem[props.field])}</td>;
      }

    gridFilterData = (column) => {
        if (column.filterType === "date") {
            if (column.isShowTime) {
                return this.renderDateTime;
            }
            else {
                return this.renderDate;
            }
        } else if (column.filterType === "numeric") {
            return this.renderNumber;
        } else if (column.filterType === "datetime") {
            return this.renderDateTime;
        } else {
            return null
        }
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
    CustomOrGroupHeaderCell = (props, column) => {
        if (props.rowType === "groupHeader") {
            return null;
        }
        if (column.locked) {
            return CustomLockedCell(props, column.customCell)
        }
        if (column.customCell) {
            return column.customCell(props)
        }
    }

    render() {
        const { columns, url, additionalParams,callbacks,state } = this.props
        return (
                <StatefullGrid url={url} additionalParams={additionalParams} state = {state} callbacks={callbacks} ref={this.eleRef} {...this.props} >
                    <GridNoRecords><AppEmpty description='No records available'/></GridNoRecords>
                    {columns?.map((column, indx) => <GridColumn key={indx}
                        columnMenu={column.filter ? ColumnMenu : null}
                        field={column.field}
                        headerCell={column.headerCell}
                        title={column.title} width={column.width}
                        cell={column.customCell || this.gridFilterData(column)}
                        filter={column.filterType || 'text'}
                        format="{0:#,0.##########}"
                        footerCell={column?.footerCell||""}
                        sortable={column.sortable === false ? false : true}
                    />
                    )}
                </StatefullGrid>
        );
    }
}

export default List;