import React from 'react';
import { Skeleton } from 'antd';
import PropTypes from 'prop-types';

const KpiLoader = ({ itemCount = 3 }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div className="" key={index}>
            <div className="p-3.5 border border-dbkpiStroke rounded-5">
              <Skeleton 
                active 
                paragraph={{ rows: 4 }} 
                title={false} 
                className="skeleton-custom" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

KpiLoader.propTypes = {
  itemCount: PropTypes.number,
};

export default KpiLoader;
