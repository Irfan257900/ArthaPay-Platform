import React from "react";
import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";

const SparklineGraph = ({ data, color }) => {
  return (
      <div className="w-14 md:w-48">
        <Sparklines data={data} limit={data?.length} width={180} height={40} margin={5} >
        <SparklinesLine color={color} style={{ fill: "none" }} />
        <SparklinesReferenceLine type="mean" />
      </Sparklines>
      </div>
  );
};

export default SparklineGraph;
