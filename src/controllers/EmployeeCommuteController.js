const EmployeeCommuteController = {
async getCommutes(orgId) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_get_commute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId })
  });
  return await response.json();
},
  async addCommute(commute) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_add_commute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commute)
    });
    return await response.json();
    },

  async updateCommute(data) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_update_commute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async deleteCommute(commute) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_delete_commute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commute)
    });
    return await response.json();
  }
};

export default EmployeeCommuteController;
