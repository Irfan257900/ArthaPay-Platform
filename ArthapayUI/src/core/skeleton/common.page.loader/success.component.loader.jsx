import { Card, Skeleton } from 'antd'
import React from 'react'
import SingleBarLoader from '../bar.loader'

const SuccessComponentLoader = () => {
  return (
    <Card className="bg-bodyBg border border-StrokeColor rounded-5 mt-7">
    <div>
      <div className="h-64">
      <div className="mt-2">
        <Skeleton paragraph={{ rows: 5 }} active title={null}/>
      </div>
      <div className="mt-8 md:w-1/2 w-full m-auto">
        <SingleBarLoader />
      </div>
      </div>
    </div>
  </Card>
  )
}

export default SuccessComponentLoader