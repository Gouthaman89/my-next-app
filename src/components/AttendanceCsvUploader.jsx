import React, { useRef } from "react";
import { useGlobalContext } from '../components/GlobalContext';
import { useAuth } from '../components/AuthContext';
const AttendanceCsvUploader = ({ onSuccess }) => {
  const fileInputRef = useRef();
  const { personId } = useAuth();
  const { globalOrgId } = useGlobalContext();
  const handleUploadClick = () => {
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const lines = csvText.split("\n").filter(Boolean);
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map(h => h.trim());

      const requiredHeaders = ["員工編號", "出勤日期"];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        alert("❌ 檔案格式錯誤，請確認欄位名稱是否正確：\n" + missingHeaders.join(", "));
        return;
      }

      const rows = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const row = {};
        headers.forEach((header, i) => {
          switch (header) {
            case "員工編號": row["codeofemp"] = values[i]; break;
            case "出勤日期": row["dateofcomm"] = values[i]; break;
            case "姓名": row["name"] = values[i]; break;
            default: break;
          }
        });
          // ✅ Add personId and orgId to every record
  row["idofperson"] = personId;
  row["idoforg"] = globalOrgId;
        return row;
      });

     try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_import_attendance_csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: rows })
  });

  // Handle non-2xx early with useful diagnostics
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("❌ 匯入失敗 (HTTP):", res.status, res.statusText, errText);
    alert(`❌ 匯入失敗：HTTP ${res.status} ${res.statusText}` + (errText ? `\n${errText}` : ""));
    return;
  }

  // Some backends return text, some JSON. Try JSON first; fall back to raw text.
  const rawText = await res.text();
  let result;
  try {
    result = rawText ? JSON.parse(rawText) : {};
  } catch (_) {
    // Not valid JSON; keep the raw text for debugging but still treat as success if HTTP 200
    result = { raw: rawText };
  }

  console.log("✅ 出勤紀錄匯入完成，回應：", result);

  const success = result?.success ?? true; // assume success on HTTP 200 unless backend says otherwise
  const count =
    result?.count ??
    result?.inserted ??
    result?.insertedCount ??
    result?.rowCount ??
    (Array.isArray(result?.data) ? result.data.length : undefined) ??
    rows.length; // fallback to attempted rows

  if (success) {
    alert(`✅ 匯入成功，共 ${count} 筆資料`);
  } else {
    const msg = result?.message || result?.error || "未知錯誤";
    alert(`❌ 匯入失敗：${msg}`);
  }

  if (typeof onSuccess === 'function') onSuccess();
} catch (err) {
  console.error("❌ 出勤紀錄匯入失敗:", err);
  alert("❌ 匯入失敗：請稍後再試或聯繫系統管理員");
}
    };

    reader.readAsText(file);
  };

  return (
    <>
      <button onClick={handleUploadClick}>從 CSV 匯入</button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default AttendanceCsvUploader;
