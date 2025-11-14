//common
export const whiteListColors = {
  'Submitted': 'bg-green',
  'Approved': 'bg-green',
  'rejected': 'bg-red',
  'Active': 'bg-green',
  'Inactive': 'bg-red'
}
export const ItemDescription = ({ data }) => (
  <div className="text-xs font-medium text-summaryLabelGrey">
    {`${data?.currency}`}
  </div>
);
export const CryptoItemDescription = ({ data }) => (
  <div className="text-xs font-medium text-summaryLabelGrey">
    {`${data?.currency} (${data?.network})`}
  </div>
);


//fiat payees

export const lookupFor = {
  'personal': 'documentTypes',
  'business': 'businessTypes',
  'paymentTypes': 'paymentTypes'
}

export const selectTab="Crypto"
export const selectTabs="Fiat"

export const recipientDetailsFields = {
  'personal': [
    { label: "Favorite Name", field: 'favouriteName' },
    { label: 'Account Type', field: 'accountType' },
    { label: "First Name", field: 'firstName'},
    { label: "Last Name", field: 'lastName'},
    { label: 'Email', field: 'email',isdecrypt : true },
    { label: 'Phone', field: 'phoneNumber',isdecrypt : true  },
    { label: 'Currency', field: 'currency' },
    { label: 'Reason', field: 'rejectReason'},
  ],
  'business': [
    { label: "Favorite Name", field: 'favouriteName' },
    { label: 'Account Type', field: 'accountType' },
    { label: "Business Name", field: 'firstName' },
    { label: 'Email', field: 'email',isdecrypt : true },
    { label: 'Phone', field: 'phoneNumber',isdecrypt : true },
    { label: 'Currency', field: 'currency' },
    { label: 'Reason', field: 'rejectReason' },
  ]
}

export const addressFields = [
  { label: "Street", field: 'line1' },
  { label: "City", field: 'city' },
  { label: "State", field: 'state' },
  { label: "Country", field: 'country' },
  { label: "Pin Code", field: 'postalCode',isdecrypt : true },
]
export const additionalDetailsFields = {
  'personal': [
    { label: "Document Type", field: 'documentType' },
    { label: "Front Image", field: 'frontImage', type: 'image', dataType: 'object' },
    { label: "Back Image", field: 'backImage', type: 'image', dataType: 'object' },
    { label: "Document Number", field: 'documentNumber' },
  ],
  'business': [
    { label: "Business Type", field: 'businessType' },
    { label: "Business Registration Number", field: 'businessRegistrationNo' },
  ]
}
export const bankFields = [
  { label: "Bank Name", field: 'bankName' },
  { label: "Account Number ", field: 'accountNumber',isdecrypt : true },
  { label: "Routing Number (ABA)", field: 'bankTransferCode' },
  { label: "Bank Address", field: 'bankAddress' },
]
export const bankEURFields = [
  // { label: "Bank Name", field: 'bankName' },
  { label: "BIC", field: 'swiftOrBicCode' },
  { label: "Branch", field: 'bankBranch' },
  { label: "Country", field: 'country' },
  { label: "State", field: 'state' },
  { label: "City", field: 'city' },
  { label: "Zip", field: 'postalCode',isdecrypt : true },
]

export const paymentDetailsFields = [
  { label: "Payment Type", field: 'paymentType' },
]

export const getAccountType = (accountType) => {
  if (['myself', 'individuals', 'individual', 'personal'].includes(accountType)) {
    return 'personal'
  }
  return 'business'
}

//Crypto Services
export const walletAddressTypes = [
  { title: 'self', value: 'FirstParty-WalletSource' },
  { title: '3rd Party', value: 'WalletSources' }
]
export const WARNING_MESSAGES = {
  rejected: `You can't modify rejected payee.`,
  inactive: `You can't modify inactive payee.`,
  approved: `You can't modify approved payee.`,
  submitted:`You can't modify submitted payee.`,
  pending : `You can't modify pending payee.`,
}
export const badgeColors = {
  'Approved': "!text-paidApproved !border !border-paidApproved",
  'Submitted': '!text-submiteted !border !border-submiteted',
  'Processed': '!text-notPaid !border !border-notPaid',
  'Rejected': '!text-canceled !border !border-canceled',
  'Inactive':'!text-canceled !border !border-canceled',
  'Active':'!text-paidApproved !border !border-paidApproved',
  'Draft': '!text-partiallyPaid !border !border-partiallyPaid',
  'Pending': '!text-partiallyPaid !border !border-partiallyPaid',
}

