export const reportSections = [
  {
    id: 'section1',
    label: 'Section 1',
    apiEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/report2_list1`,
    columns: [
      { key: 'carbonyear', label: 'carbonyear' },
      { key: 'controlno', label: 'controlno' },
      { key: 'companyname', label: 'companyname' },
      { key: 'taxcode', label: 'taxcode' },
      { key: 'organizationcode', label: 'organizationcode' },
      { key: 'owner', label: 'owner' },
      { key: 'contactname', label: 'contactname' },
      { key: 'tel', label: 'tel' },
      { key: 'email', label: 'email' },
      { key: 'fax', label: 'fax' },
      { key: 'mobile', label: 'mobile' },
      { key: 'industrycode', label: 'industrycode' },
      { key: 'industryname', label: 'industryname' },
      { key: 'reason', label: 'reason' },
      { key: 'accordto', label: 'accordto' },
      { key: 'ispermit', label: 'ispermit' },
      { key: 'institution', label: 'institution' },
      { key: 'comment', label: 'comment' }
    ],
  },
  {
    id: 'section2',
    label: 'Section 2',
    apiEndpoint: '/api/report2_list2',
    columns: [
      { key: 'item', label: 'Item' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'unit', label: 'Unit' },
    ],
  },
];