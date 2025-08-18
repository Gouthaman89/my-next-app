const EmployeeAttendanceController = {
  async getRecords(orgId, year, month) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_get_attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, year, month })
  });
  return await response.json();
},

  async addRecord(record) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_add_attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
    return await response.json();
  },

  async updateRecord(data) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_update_attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },


  async deleteRecord(row) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_delete_attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row)
    });
    return await response.json();
  },
  async syncScope3Commuting(orgId, year, month) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_commuting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, year, month })
  });
  return await response.json();
},
async checkSyncedPdf(orgId, year, month) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scope3_commuting_getcurrentpdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId, year, month })
  });
  return await response.json();
},
  async checkSyncedProcessing(orgId, year, month) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scope3_commuting_getcurrentprocessing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, year, month })
    });
    return await response.json();
  }
};

export default EmployeeAttendanceController;
