import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import VendorFactorController from "../controllers/VendorFactorController";
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const VendorFactorTable = ({ data, refreshFactors }) => {
  const tableRef = useRef();
  const [deletingFactor, setDeletingFactor] = useState(null);

  useEffect(() => {
  const table = $(tableRef.current).DataTable({
    destroy: true,
    paging: true,
    searching: true,
    ordering: true,
    language: {
      search: "搜尋:",
      paginate: {
        next: "下一頁",
        previous: "上一頁"
      },
      lengthMenu: "每頁顯示 _MENU_ 筆資料",
      info: "顯示第 _START_ 到第 _END_ 筆，共 _TOTAL_ 筆"
    }
  });

  return () => {
    table.destroy();
  };
}, [data]);

  const handleConfirmDelete = async () => {
    if (deletingFactor) {
      await VendorFactorController.deleteFactor(deletingFactor);
      setDeletingFactor(null);
      refreshFactors();
    }
  };

  return (
    <>
      <div style={{ overflowX: "auto", marginTop: "10px" }}>
  <table ref={tableRef} className="display" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>版本</th>
            <th>名稱</th>
            <th>係數值</th>
            <th>係數單位</th>
            <th>對應氣體</th>
            <th>對應範疇</th>
            <th>係數等級</th>
            <th>備註</th>
            <th style={{ width: "100px" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row, index) => (
            <tr key={index}>
              <td>{row.pkgversion}</td>
              <td>{row.pkgname}</td>
              <td>{row.factor}</td>
              <td>{row.unitname}</td>
              <td>{row.gas}</td>
              <td>{row.scopetype}</td>
              <td>{row.leveloffactor}</td>
              <td>{row.description}</td>
              <td>
                <span style={{ whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => console.log("編輯", row)} // placeholder for future edit
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#007bff",
                      marginRight: "6px"
                    }}
                    title="編輯"
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={() => setDeletingFactor(row)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#dc3545"
                    }}
                    title="刪除"
                  >
                    <FaTrashAlt />
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {/* Confirm Delete Modal */}
      {deletingFactor && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "6px",
            width: "300px",
            textAlign: "center"
          }}>
            <p>確定要刪除此係數？</p>
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  marginRight: "10px",
                  color: "#fff",
                  background: "#dc3545",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer"
                }}
              >
                確定刪除
              </button>
              <button
                onClick={() => setDeletingFactor(null)}
                style={{ padding: "6px 12px", cursor: "pointer" }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorFactorTable;
