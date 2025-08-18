const VendorFactorController = {
  async getFactors(orgId) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_get_factor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId })
  });
  return await response.json();
},

  async deleteFactor(factor) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_delete_factor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(factor)
    });

    return await response.json();
  }
};

export default VendorFactorController;
