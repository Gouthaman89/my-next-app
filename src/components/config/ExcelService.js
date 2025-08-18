import * as XLSX from "xlsx";

export const ExcelService = {
  async readExcel(file) {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheet];
    return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  }
};
