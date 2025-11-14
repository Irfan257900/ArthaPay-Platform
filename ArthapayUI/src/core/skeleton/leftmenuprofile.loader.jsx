import React from "react";
import {  Skeleton } from 'antd';
const LeftmenuprofileLoader =()=> {
  return (

 <div className="">
            <div className="flex justify-center">
              <Skeleton.Avatar active style={{width:70, height:70}} shape="circle" className="mt-12 mb-2" /> 
              </div>  
              <Skeleton active className="mb-3 h-4 " paragraph={false} /> 
                <Skeleton active className=" mb-14" paragraph={false} /> 

             
        
          </div>
  );
}

export default LeftmenuprofileLoader;
