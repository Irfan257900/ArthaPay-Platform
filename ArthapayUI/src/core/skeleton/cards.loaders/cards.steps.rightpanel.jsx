import React from 'react';
import { Skeleton, } from 'antd';
const Dashboard = () => {
    const avatarShape = "circle"; // Define the shape of the avatar

    return (
        <>
            <div>
                <span className="text-md text-lightWhite font-medium inline-block mb-4">
                    <Skeleton
                        active
                        paragraph={{ rows: 1 }}
                        title={false}
                        className="w-56"
                    />
                </span>
                <div className="bg-rightincard border border-coinBr mb-6 p-4 rounded-sm ">
                    <h3>
                        <Skeleton
                            active
                            paragraph={{ rows: 1 }}
                            title={false}
                            className="w-56 mt-5"
                        />
                    </h3>

                    <div className='flex items-center justify-center gap-4 mt-7 mb-4'>
                        <div className=''>
                            <Skeleton.Avatar
                                active
                                size="large"
                                shape={avatarShape}
                                className=''
                            />
                        </div>
                        <div className='text-center'>
                            <Skeleton
                                active
                                paragraph={{ rows: 1 }}
                                title={false}
                                className="w-40"
                            />
                        </div>

                        <div className=''>
                            <Skeleton.Avatar
                                active
                                size="large"
                                shape={avatarShape}
                                className=''
                            /></div>
                        <div className='text-center'>


                            <Skeleton
                                active
                                paragraph={{ rows: 1 }}
                                title={false}
                                className="w-40"
                            />
                        </div>

                        <div className=''>
                            <Skeleton.Avatar
                                active
                                size="large"
                                shape={avatarShape}
                                className=''
                            />

                        </div>
                    </div>

                    <div className="rounded-sm border border-borderLightGreen p-4">
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />



                    </div>


                    <h3>
                        <Skeleton
                            active
                            paragraph={{ rows: 1 }}
                            title={false}
                            className="w-56 mt-5"
                        />
                    </h3>
                    <div className='grid md:grid-cols-2 mt-5 gap-3'>
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />

                    </div>


                    <h3>
                        <Skeleton
                            active
                            paragraph={{ rows: 1 }}
                            title={false}
                            className="w-56 mt-5"
                        />
                    </h3>
                    <div className='grid md:grid-cols-2 mt-5 gap-3'>
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />

                    </div>
                    <div className='flex items-center justify-between mb-2  '>

                        <h3>
                            <Skeleton
                                active
                                paragraph={{ rows: 1 }}
                                title={false}
                                className="w-56 mt-5"
                            />
                        </h3>

                        <h3>
                            <Skeleton
                                active
                                paragraph={{ rows: 1 }}
                                title={false}
                                className="w-56 mt-5"
                            />
                        </h3>
                    </div>
                    <Skeleton.Input active style={{ height: 230 }} className="!w-full mb-2" />

                    <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />


                    <h3>
                        <Skeleton
                            active
                            paragraph={{ rows: 1 }}
                            title={false}
                            className="w-56 mt-3"
                        />
                    </h3>
                    <div className='grid md:grid-cols-2 mt-5 gap-3'>
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />


                    </div>
                    <div className='flex items-center justify-between mb-2 '>

                        <h3>
                            <Skeleton
                                active
                                paragraph={{ rows: 1 }}
                                title={false}
                                className="w-56 mt-3"
                            />
                        </h3>

                        <h3>
                            <Skeleton
                                active
                                paragraph={{ rows: 1 }}
                                title={false}
                                className="w-56 mt-5"
                            />
                        </h3>
                    </div>

                    <Skeleton.Input active style={{ height: 230 }} className="!w-full mb-3" />

                        


                    <Skeleton.Input active  className=" mb-3" />


                    <div className='grid md:grid-cols-2 mt-5 gap-3'>
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                        <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />
                    </div>

                    <Skeleton.Input active style={{ height: 230 }} className="!w-full mb-2" />



                    <Skeleton.Input active style={{ height:40 }} className="!w-full mb-2" />

                    <Skeleton.Input active style={{ height: 230 }} className="!w-full mb-2" />


                    <Skeleton.Input active style={{ height: 40 }} className="!w-full mb-2" />









                    <div className='flex justify-center mt-16 rounded-full'>
                        <Skeleton.Button style={{ width: 500 }} shape='rounded' active />
                    </div>



                </div>
            </div>


        </>
    );
};

export default Dashboard;