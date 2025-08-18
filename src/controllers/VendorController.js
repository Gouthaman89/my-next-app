export const VendorController = {
  async loadVendorData(orgId) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_getvender`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId })
  });
  return await response.json();
},

  async getGHGOptions() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_dropdown_scope`);
    const data = await response.json();
    return data;
  },

  async submitVendor(form) {
    try {
      //POST Nodered
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_add_vender`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const result = await response.json();
      console.log("新增成功:", result);
    } catch (err) {
      console.error("提交失敗:", err);
    }
  },

  async updateVendor(updatedVendor) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_update_vender`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedVendor)
      });
      const result = await response.json();
      console.log("更新成功", result);
    } catch (error) {
      console.error("更新失敗", error);
    }
  },

  async deleteVendor(vendor) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_delete_vender`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor)
      });

      const result = await response.json();
      console.log("✅ 刪除成功:", result);
      return result;
    } catch (error) {
      console.error("❌ 刪除失敗:", error);
    }
  }

};

export default VendorController;
