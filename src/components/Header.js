import React from "react";

const Header = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px",
      borderBottom: "1px solid #ccc"
    }}>
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        ICX Platform
      </div>
      <div>
        帳戶
        <input
          type="text"
          placeholder="Search in site"
          style={{
            marginLeft: "10px",
            padding: "4px 8px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
      </div>
    </div>
  );
};

export default Header;
