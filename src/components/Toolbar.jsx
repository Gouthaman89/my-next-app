import React, { useState } from "react";
import { ExcelController } from "../controllers/ExcelController";
import AddVendorModal from "./AddVendorModal";

const Toolbar = ({ setVendors, refreshVendors, showAdd = true, showImport = true }) => {

  const [showModal, setShowModal] = useState(false);

  
  

  const triggerUpload = () => {
    document.getElementById("excel-file-input").click();
  };

  return (
    
    <div style={{ marginBottom: "16px" }}>
      
      <button>顯示匯表</button>
      {showAdd && <button onClick={() => setShowModal(true)}>新增供應商</button>}
      <button onClick={refreshVendors}>重新整理</button>
      <button>匯出至 Excel</button>
      {showImport && <button onClick={triggerUpload}>從 Excel 匯入</button>}


      {/* Hidden file input for Excel upload */}
      <input
        type="file"
        id="excel-file-input"
        style={{ display: "none" }}
        accept=".xlsx, .xls"
        onChange={(e) => ExcelController.handleFileUpload(e, setVendors)}
      />


      {/* modal */}
      <AddVendorModal
        show={showModal}
        onClose={() => setShowModal(false)}
        refreshVendors={refreshVendors}
      />


    </div>
  );
};


export default Toolbar;
