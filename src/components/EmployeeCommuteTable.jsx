import React, { useState, useMemo } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import EmployeeCommuteController from "../controllers/EmployeeCommuteController";
import EditCommuteModal from "./EditCommuteModal";

const EmployeeCommuteTable = ({ data = [], refresh }) => {
  // ---------- local state ----------
  const [deletingRow, setDeletingRow] = useState(null);
  const [editingRow, setEditingRow] = useState(null);

  // ---------- pagination ----------
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // ---------- sorting ----------
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc' | null

  // ---------- column definition ----------
  const columns = [
    { key: "codeofemp", label: "員編" },
    { key: "name", label: "交通工具" },
    { key: "dateofstart", label: "開始日期" },
    { key: "dateofend", label: "結束日期" },
    { key: "distofstart", label: "出發地" },
    { key: "distofend", label: "目的地" },
  ];

  // ---------- filtering ----------
  const filteredData = useMemo(() => {
    const keywords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    return data.filter((row) =>
      keywords.every((kw) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(kw)
        )
      )
    );
  }, [data, searchTerm]);

  // ---------- sorting ----------
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      // treat empty as largest
      if (aVal === null || aVal === undefined || aVal === "") aVal = "zz";
      if (bVal === null || bVal === undefined || bVal === "") bVal = "zz";
      // dates
      if (sortKey.includes("date")) {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  // ---------- pagination ----------
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ---------- handlers ----------
  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir("asc");
      }
    }
    setCurrentPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRow) return;
    await EmployeeCommuteController.deleteCommute(deletingRow);
    setDeletingRow(null);
    refresh();
  };

  // ---------- render ----------
  return (
    <>
      {/* controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="搜尋..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ padding: "4px 8px", width: 200 }}
        />
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          style={{ padding: "4px" }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* table wrapper – only this scrolls */}
      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 900,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#fafafa" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: 8,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span style={{ marginLeft: 4, fontSize: 12 }}>
                      {sortDir === "asc"
                        ? "▲"
                        : sortDir === "desc"
                        ? "▼"
                        : ""}
                    </span>
                  )}
                </th>
              ))}
              <th
                style={{
                  position: "sticky",
                  right: 0,
                  background: "#fafafa",
                  zIndex: 2,
                  whiteSpace: "nowrap",
                }}
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={row.uuid || idx}>
                {columns.map((col) => {
                  let value = row[col.key];
                  if (col.key.includes("date") && value) value = value.split("T")[0];
                  return (
                    <td key={col.key} style={{ padding: 8 }}>
                      {value}
                    </td>
                  );
                })}
                <td
                  style={{
                    position: "sticky",
                    right: 0,
                    background: "#fff",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  <button
                    onClick={() => setEditingRow(row)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      marginRight: 6,
                    }}
                    title="編輯"
                  >
                    <FaPencilAlt color="#007bff" />
                  </button>
                  <button
                    onClick={() => setDeletingRow(row)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                    title="刪除"
                  >
                    <FaTrashAlt color="#dc3545" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          上一頁
        </button>
        <span>
          第 {currentPage} / {totalPages} 頁
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          下一頁
        </button>
      </div>

      {/* confirm delete overlay */}
      {deletingRow && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 6,
              width: 300,
              textAlign: "center",
            }}
          >
            <p>確定要刪除此通勤資料？</p>
            <div style={{ marginTop: 20 }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  marginRight: 10,
                  color: "#fff",
                  background: "#dc3545",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                確定刪除
              </button>
              <button
                onClick={() => setDeletingRow(null)}
                style={{ padding: "6px 12px", cursor: "pointer" }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* edit modal */}
      <EditCommuteModal
        show={!!editingRow}
        commute={editingRow}
        onClose={() => setEditingRow(null)}
        refresh={refresh}
      />
    </>
  );
};

export default EmployeeCommuteTable;