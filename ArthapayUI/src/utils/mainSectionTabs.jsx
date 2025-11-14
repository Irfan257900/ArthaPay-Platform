import React, { useState, useEffect } from "react";
import { Button } from 'antd';
import { useNavigate,useParams } from "react-router";
const fiatCryptoTabs = [{ key: 'fiat', name: 'Fiat' }, { key: 'crypto', name: 'Crypto' }]
const MainSectionTabs = (props) => {
  const [activeTab, setActiveTab] = useState(false);
  const navigate = useNavigate();
  const { url } = useParams()
  useEffect(() => {
    if (url?.includes('fiat')) {
      setActiveTab('fiat')
    }
    if (url?.includes('crypto')) {
      setActiveTab('crypto')
    }
  }, [url]);//eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`${props.baseUrl}/${tab}`)
  }
  return (
    <div className={`flex gap-2.5 items-center md:mb-0 mb-2.5 flex-mb sell-header p-0`} >
      {props.isFiatCrypto && (
        <div className="coinbal-tabs">
          {fiatCryptoTabs?.map(tab => (
            <Button className={`tabs-button ${tab.key === activeTab ? 'btn-active' : ''}`} onClick={() => handleTabChange(tab.key)}>{tab.name}</Button>
          ))}
        </div>)}
    </div>

  )
}

export default MainSectionTabs;