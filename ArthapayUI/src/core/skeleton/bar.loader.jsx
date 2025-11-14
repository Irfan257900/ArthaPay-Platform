import React from "react";
import { Skeleton,  } from 'antd';
const SingleBarLoader =()=> {
  return (
    <div>
        <Skeleton.Input active style={{  height: 45 }} className="!w-full" />
    </div>
  );
}

export default SingleBarLoader;
