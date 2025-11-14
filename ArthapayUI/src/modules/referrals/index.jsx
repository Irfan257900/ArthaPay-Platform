import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Button,DatePicker,Form,Input, Select} from 'antd';
import { fetchKpis, fetchStatusLookupData } from './httpServices';
import { useSelector } from 'react-redux';
import List from '../../core/grid.component';
import KpisData from './kpis';
import { referralReducer, referralState } from './reducer';
import AppAlert from '../../core/shared/appAlert';
import { TransactionRegisterDateHandler, TransactionsEmailHandler, TransactionsNameHandler, TransactionstatusHandler, baseURL, currentApiVersion} from './services';
import PageHeader from '../../core/shared/page.header';
import KpiLoader from '../../core/skeleton/kpi.loader/kpi';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import customerImg from'../../assets/images/defaultuser.jpg';
function Referrals(){
    const { Search } = Input;
    const gridRef = useRef(null)
    const [form] = Form.useForm();
    const customerInfo = useSelector((store) => store.userConfig.details)
    const [localState, localDispatch] = useReducer(referralReducer, referralState);
    const [searchData, setSearchData] = useState({ status: "All", search:null,startDate:'',endDate:'' });
    const { RangePicker } = DatePicker;
    const {t}=useTranslation();
    useEffect(() => {
      getKpisData()
      getStatusData()
  }, [customerInfo?.id])

  const getKpisData = async () => {
    const urlParams={id:customerInfo?.id,referrer:true}
    await fetchKpis(localDispatch, urlParams)
}
const getStatusData = async () => {
  await fetchStatusLookupData(localDispatch)
}
function clearError(){
  localDispatch({ type: 'setError', payload: null });
}

  const breadCrumbList = [
    { id: "1", title: `${t('referrals.referrals')}`  },
];

const onsubmit= useCallback((value)=>{
  const startDate = value?.registeredDate?.[0] ? value?.registeredDate?.[0]?.format("YYYY-MM-DD") : ''
  const endDate = value?.registeredDate?.[1] ? value?.registeredDate?.[1]?.format("YYYY-MM-DD") : ''
 let trimSearchData = value?.search?.trim();
 if(trimSearchData === '.'){
  form.setFieldsValue({ ...value,search: null })
  return;
 }
  form.setFieldsValue({
    search:trimSearchData || null,
  })
  setSearchData({
    status: value?.status || 'All', 
    search:trimSearchData || null,
    startDate:startDate || '',
    endDate:endDate || ''
  })

},[form, setSearchData])

const handleDateChange=useCallback((date)=>{
  const startDate = date?.[0] ? date?.[0]?.format("YYYY-MM-DD") : ''
  const endDate = date?.[1] ? date?.[1]?.format("YYYY-MM-DD") : ''
  const formattedDates = [startDate, endDate].join('/')
  setSearchData((prev) => ({
    ...prev,
    registeredDate: formattedDates,
  }));
},[]);

const handleStateChange=useCallback((state)=>{
  setSearchData((prev) => {
    const updated = { ...prev, status:state };
    return updated;
  });
},[]);

const statusHandler =(cellprops) => {
  return(<TransactionstatusHandler cellprops={cellprops} />)
}

const registerDateHandler =(dateProps) => {
  return(<TransactionRegisterDateHandler dateProps={dateProps} />)
}
const transactionsNameHandler =(propsData) => {
  return(<TransactionsNameHandler propsData={propsData} customerImg={customerImg}/>)
}

const transactionsEmailHandler =(propsData) => {
  return(<TransactionsEmailHandler propsData={propsData}/>)
}


const transactionColoumns = [
  {
    field: 'name',
    title: `${t('referrals.grid_columns.name')}`,
    width: 90,
    filter: false,
    sortable: false,
    customCell:transactionsNameHandler
},
{
  field: 'email',
  title: `${t('referrals.grid_columns.email')}`,
  width:100,
  filter: false,
  sortable: false,
  customCell:transactionsEmailHandler
},
  {
      field: "registeredDate",
      title: `${t('referrals.grid_columns.registered_Date')}`,
      width: 90,
      filter: false,
      sortable: false,
      customCell:registerDateHandler
  },
  {
      field: 'status',
      title: `${t('referrals.grid_columns.state')}`,
      width: 50,
      filter: false,
      sortable: false,
      customCell:statusHandler
  },

] 
const gridQuery = useMemo(() => {
        const {status="All", search=null,startDate='',endDate=''} = searchData;
        return `status=${status }&search=${search}&startDate=${startDate}&endDate=${endDate}`;
    }, [searchData]);
    return (
        <div className=''>
          <PageHeader breadcrumbList={breadCrumbList}  />
            {localState?.error &&
                <div className="alert-flex mb-24">
                    <AppAlert
                        className="w-100 "
                        type="warning"
                        description={localState?.error}
                        showIcon
                    />
                    <span className="icon sm alert-close" onClick={clearError}></span>
                </div>
            }
           <div className=''>
           {localState?.kpisLoader ?<div className='mb-8'> <KpiLoader /> </div> : <KpisData data={localState?.kpisInfo}/>}
           </div>        
        <div className='kpicardbg dashboard-transactions sm-m-0 db-table hover-bg !mt-5'>
        <div className='d-flex align-start transactions-header filters-wrap'>
          <Form
            form={form}
            initialValues={{  status: 'All', search:null,registeredDate: '' }}
            className="d-flex payment-filters align-center gap-16"
            onFinish={onsubmit}
          >
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4 referrals-content'>
            <Form.Item name="status" className='mb-0'>
                <Select
                  placeholder="Status"
                  className=""
                  defaultValue="All"
                  onChange={handleStateChange}
                >
                  {localState?.statusLookupData?.map((status) => (
                    <Select.Option key={status?.code} value={status?.name}>
                      {status?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
                <Form.Item className='mb-0' name={"registeredDate"}
                >
                  <RangePicker 
                    format='DD/MM/YYYY'
                    className="payee-input input-bordered text-lightWhite !items-center sm-mb-10"
                    onChange={handleDateChange} 
                    placeholder={[
                      t("referrals.placeholder.start_Date"),
                      t("referrals.placeholder.end_Date"),
                    ]}
                    />
                </Form.Item>
              <Form.Item className='!mb-0'name={"search"}>
                <div className="transaction-mobile-actions">
                  <div className="flex items-center transactions-search">
                    <div className="coin-search mb-0 refe-search-h !w-full">
                      <Search placeholder={`${t('referrals.placeholder.search_referrals')}`}
                        suffix={<Button className='!bg-transparent border-none p-0 !hover:bg-transparent focus:bg-transparent focus:shadow-none' htmlType='submit'><span className="icon md search cursor-pointer"></span></Button>}
                        size="middle" className="coin-search-input h-[52px] " allowClear/>
                    </div>
                  </div>
                </div>
              </Form.Item>
            </div>
          </Form>
        </div>
          <List
            ref={gridRef}
            columns={transactionColoumns}
            className="custom-grid"
            url={`${baseURL}/${currentApiVersion}/referrals`}
            pSize={10}
            hasQuery={true}
            query={gridQuery}
          />
        </div>
      </div>
    )
}
export default Referrals
