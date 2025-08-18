import React, { useRef } from "react";

const CommuteCsvUploader = ({ onSuccess }) => {
  const fileInputRef = useRef();

  const handleUploadClick = () => {
    // Always reset the input to allow re-uploading the same file
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

      // ✅ Validate headers only
      const requiredHeaders = ["員工編號", "開始日期", "結束日期", "交通工具", "出發地", "目的地"];
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
            case "開始日期": row["dateofstart"] = values[i]; break;
            case "結束日期": row["dateofend"] = values[i]; break;
            case "交通工具": row["transportation"] = values[i]; break;
            case "出發地": row["startaddress"] = values[i]; break;
            case "目的地": row["destinationaddress"] = values[i]; break;
            default: break;
          }
        });
        return row;
      });

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/icx_scope3_import_commute_csv`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: rows })
        });
        const result = await res.json();
        console.log("✅ 通勤資料匯入成功:", result);
        // ✅ Show number of rows uploaded
       if (result.success) {
  alert(`✅ 匯入成功，共 ${rows.length} 筆資料`);
} else {
  alert(`❌ 匯入失敗：${result.message || '未知錯誤'}`);
}
        // 🟢 Always call onSuccess on each import
        if (typeof onSuccess === 'function') onSuccess();
      } catch (err) {
        console.error("❌ 匯入失敗:", err);
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

export default CommuteCsvUploader;
