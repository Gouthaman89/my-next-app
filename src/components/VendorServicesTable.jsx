import React, { useState, useEffect, useRef } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import VendorServicesController from "../controllers/VendorServicesController";
import EditServiceModal from "./EditServiceModal";
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/js/dataTables.dataTables';
import 'datatables.net-dt/css/dataTables.dataTables.css';
const VendorServicesTable = ({ data, refreshServices }) => {
   const tableRef = useRef();
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);

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
    if (deletingService) {
      await VendorServicesController.deleteService(deletingService);
      setDeletingService(null);
      refreshServices();
    }
  };

  return (
    <>
      <div style={{ overflowX: "auto", marginTop: "10px" }}>
  <table ref={tableRef} className="display" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>供應商名稱</th>
            <th>排放範疇</th>
            <th>服務名稱</th>
            <th>顧問單位</th>
            <th>產品代碼</th>
            <th>建立日期</th>
            <th style={{ width: "100px" }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row, index) => (
            <tr key={index}>
              <td>{row.vendername}</td>
              <td>{row.scopetype}</td>
              <td>{row.servicename}</td>
              <td>{row.orgname}</td>
              <td>{row.productnumber}</td>
              <td>{row.createdate}</td>
              <td>
                <span style={{ whiteSpace: "nowrap" }}>
                  <button
                    onClick={() => setEditingService(row)}
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
                    onClick={() => setDeletingService(row)}
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
      <EditServiceModal
        show={!!editingService}
        service={editingService}
        onClose={() => setEditingService(null)}
        refreshServices={refreshServices}
      />

      {/* Confirm Delete Modal */}
      {deletingService && (
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
            <p>確定要刪除此服務？</p>
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleConfirmDelete}
                style={{ marginRight: "10px", color: "#fff", background: "#dc3545", border: "none", padding: "6px 12px", cursor: "pointer" }}
              >
                確定刪除
              </button>
              <button
                onClick={() => setDeletingService(null)}
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

export default VendorServicesTable;
