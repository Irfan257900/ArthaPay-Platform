import { Modal } from 'antd'
import React from 'react'

const PreviewModal = ({title,isModalOpen,children,destroyOnClose,onCancel,width,footer,closeIcon}) => {
  return (
    <Modal 
    wrapClassName=' invoice-modal cust-preview-modal mt-5'
    title={title || ''}
    visible={isModalOpen} 
    footer={footer} 
    destroyOnClose={destroyOnClose || true}
    onCancel={onCancel}
    closeIcon={<button  onClick={onCancel}><span className="icon lg close cursor-pointer" title="close"></span></button>}
    closable={true}
    width={width}
    >
        {children}
    </Modal>
  )
}

export default PreviewModal