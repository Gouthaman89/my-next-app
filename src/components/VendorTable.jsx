import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import EditVendorModal from "./EditVendorModal";
import VendorController from "../controllers/VendorController";
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';

const VendorTable = ({ vendors, refreshVendors }) => {
  const tableRef = useRef();
  const [editingVendor, setEditingVendor] = useState(null);
  const [deletingVendor, setDeletingVendor] = useState(null);

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
}, [vendors]);

  const handleConfirmDelete = async () => {
    if (deletingVendor) {
      await VendorController.deleteVendor(deletingVendor);
      setDeletingVendor(null);
      refreshVendors();
    }
  };

  return (
    <>
      <div style={{ overflowX: "auto", marginTop: "10px" }}>
  <table ref={tableRef} className="display" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>統編 taxcode</th>
            <th>名稱 name</th>
            <th>範疇三類別</th>
            <th>建立日期 createdate</th>
            <th>是否啟用 flagofpublic</th>
            <th style={{ width: "100px" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v, index) => (
            <tr key={index}>
              <td>{v.vendertaxcode}</td>
              <td>{v.vendername}</td>
              <td>{v.typename}</td>
              <td>{v.createdate}</td>
              <td>{v.flagofpublic}</td>
              <td>
                <span style={{ whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => setEditingVendor(v)}
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
                    onClick={() => setDeletingVendor(v)}
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
      <EditVendorModal
        show={!!editingVendor}
        vendor={editingVendor}
        onClose={() => setEditingVendor(null)}
      />

      {/* Confirm Delete Modal */}
      {deletingVendor && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
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
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
          }}>
            <p>確定要刪除此供應商？</p>
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
                onClick={() => setDeletingVendor(null)}
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

export default VendorTable;
