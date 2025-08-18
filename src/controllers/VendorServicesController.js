// VendorServicesController.js
const VendorServicesController = {
  async getServices(orgId) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_getservice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orgId })
  });
  return await response.json();
},

  async addService(service) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_add_service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service)
      });

      const result = await response.json();
      console.log("✅ 新增成功:", result);
      return result;
    } catch (error) {
      console.error("❌ 新增失敗:", error);
    }
  },

  async updateService(service) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_update_service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service)
      });

      const result = await response.json();
      console.log("✅ 更新成功:", result);
      return result;
    } catch (error) {
      console.error("❌ 更新失敗:", error);
    }
  },


  async deleteService(service) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_delete_service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service)
      });

      const result = await response.json();
      console.log("✅ 刪除成功:", result);
      return result;
    } catch (error) {
      console.error("❌ 刪除失敗:", error);
    }
  }
};

export default VendorServicesController;
