
import React from 'react';

const CasesColumns = ({ viewCase }) => {
  const casesColoumns = [
    {
      field: "caseNumber",
      title: "Case Number",
      filter: true,
      customCell: (props) => (
        <td>
          <div className="gridLink" onClick={() => viewCase(props)}>
            {props.dataItem.caseNumber}
          </div>
        </td>
      ),
    },
    { field: "caseTitle", title: "Case Title", filter: true },
    { field: "createdDate", title: "Date", filter: true, dataType: "date", filterType: "date" },
    { field: "state", title: "State", filter: true },
  ];

  return casesColoumns;
};

export default CasesColumns;
