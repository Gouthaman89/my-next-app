import { ExcelService } from "../components/config/ExcelService";

export const ExcelController = {
  async handleFileUpload(event, setVendors) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const jsonData = await ExcelService.readExcel(file);
      console.log("Parsed Excel data:", jsonData);
      setVendors(jsonData);
    } catch (error) {
      console.error("Failed to read Excel file:", error);
    }
  }
};
