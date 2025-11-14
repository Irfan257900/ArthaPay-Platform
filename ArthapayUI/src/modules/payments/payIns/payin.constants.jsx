export const validateForTexts = {
    'preview': 'previewing the details.',
    'submit': 'generating the link'
}

export const statusWarningTexts=(action)=>{
    return {
        'partially paid':'Pay-In has been partially paid.',
        'paid':'Pay-In has been fully paid.',
        'cancelled':`Cannot ${action} cancelled Pay-In`
    }
}

export const actionStatusList={
    'update':['paid','cancelled'],
    'beforeShare':['paid','cancelled'],
}

export const invoiceType = {
    'Static': 'StaticTemplateDownload',
    'Invoice': 'InvoiceTemplateDownload'
  }

export const toasterMessages ={
    statusToaster:"Payin status has been successfully changed.",
    download:"Downloaded successfully",
    paymentCreation:'Payment Link Generated Successfully',
    paymentUpdate:"Payment Link Updated Successfully"
} 