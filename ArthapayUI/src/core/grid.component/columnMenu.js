import * as React from 'react'
import {
  GridColumnMenuSort,
  GridColumnMenuFilter,
} from '@progress/kendo-react-grid'
export class ColumnMenu extends React.Component {
  state = {
    columns: this.props.columns,
    columnsExpanded: false,
    filterExpanded: false,
  }
  onFilterExpandChange = (value) => {
    this.setState({
      filterExpanded: value,
      columnsExpanded: value ? false : this.state.columnsExpanded,
    })
  }
  render() {
    return (
      <div>
        {this.props.column?.field !== 'caseids' &&
          this.props.column?.field !== '' && (
            <GridColumnMenuSort {...this.props} />
          )}
        {this.props.column?.field !== 'caseids' &&
          this.props.column?.field !== '' && (
            <GridColumnMenuFilter
              {...this.props}
              onExpandChange={this.onFilterExpandChange}
              expanded={this.state.filterExpanded}
            />
          )}
      </div>
    )
  }
}
