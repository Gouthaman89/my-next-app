import React from "react";

const Sidebar = ({ setCurrentPage, currentPage }) => {
  const menuItems = [
    { label: "分析", key: "analysis" },
    { label: "資料", key: "data" },
    { label: "設定", key: "settings" },
    { label: "公司設定", key: "company" },
    { label: "參數設定", key: "params" },
    { label: "人員設定", key: "people" },
    { label: "帳號設定", key: "accounts" },
    { label: "供應商設定", key: "vendors" },
    { label: "供應商服務", key: "vendorServices" },
    { label: "供應商係數設定", key: "vendorFactors" },
    { label: "員工通勤主檔", key: "commute" },
    { label: "員工出勤紀錄", key: "employeeAttendance"}
  ];

  return (
    <div style={{
      width: "220px",
      backgroundColor: "#f3f3f3",
      padding: "16px",
      height: "100vh",
      boxSizing: "border-box"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "20px" }}>
        Frame
      </div>
      {menuItems.map((item, index) => (
        <div
          key={index}
          onClick={() => setCurrentPage(item.key)}
          style={{
            marginBottom: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: currentPage === item.key ? "bold" : "normal",
            color: currentPage === item.key ? "#000" : "#555"
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
