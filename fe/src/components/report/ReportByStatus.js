import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import reportService from "../../api/reportService";
import "../../styles/report.css";
const STATUS_OPTIONS = [
    { value: null, label: "Tất cả" },
    { value: 0, label: "Bản nháp" },
    { value: 20, label: "Đang xử lý" },
    { value: 30, label: "Hoàn thành" },
    { value: 31, label: "Từ chối" },
    { value: 32, label: "Hủy bỏ" },
];

function ReportByStatus() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [completedFromDate, setCompletedFromDate] = useState("");
    const [completedToDate, setCompletedToDate] = useState("");
    const [status, setStatus] = useState(null);
    const [textSearch, setTextSearch] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const organizationId = JSON.parse(localStorage.getItem('user'))?.organizationId || 1;

    useEffect(() => {
        fetchReportByStatus();
    }, [page, size]);

    const fetchReportByStatus = async () => {
        setLoading(true);

        try {
            // Chuẩn hóa ngày mặc định
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            const defaultFromDate = "2025-01-01"; // hoặc tùy mày
            const defaultToDate = today;

            // Chỉ gửi param nếu có giá trị
            const params = {};
            if (fromDate) params.fromDate = fromDate;
            else params.fromDate = defaultFromDate;

            if (toDate) params.toDate = toDate;
            else params.toDate = defaultToDate;

            if (completedFromDate) params.completed_from_date = completedFromDate;
            if (completedToDate) params.completed_to_date = completedToDate;
            if (status !== null) params.status = status;
            if (textSearch) params.textSearch = textSearch;

            params.page = page;
            params.size = size;

            const response = await reportService.getReportByStatus(organizationId, params);

            // Map data theo chuẩn response
            const mappedData = (response.content || []).map(item => {
                let processedBy = "N/A";

                // Tìm người xử lý có role = 3
                const signer = item.participants
                    ?.flatMap(p => p.recipients || [])
                    ?.find(r => r.role === 3);

                if (signer) {
                    processedBy = signer.name;
                } else if (item.updatedBy) {
                    processedBy = item.updatedBy;
                }

                return {
                    contractId: item.id,
                    contractName: item.name,
                    contractCode: item.contractNo,
                    status: item.status,
                    updatedDate: item.updatedAt?.slice(0, 10) || "N/A",
                    processedBy,
                    note: item.note || "",
                };
            });


            setData(mappedData);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);

        } catch (error) {
            toast.error("Lỗi khi tải báo cáo trạng thái xử lý!");
        } finally {
            setLoading(false);
        }
    };


    const handleSearch = () => {
        setPage(0);
        fetchReportByStatus();
    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        setCompletedFromDate("");
        setCompletedToDate("");
        setStatus(null);
        setTextSearch("");
        setPage(0);
    };

    const getStatusLabel = (statusValue) => {
        const found = STATUS_OPTIONS.find(opt => opt.value === statusValue);
        return found ? found.label : "N/A";
    };

    return (
        <div className="report-container">
            <h2>📈 Báo cáo trạng thái xử lý</h2>

            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Từ ngày tạo:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Đến ngày tạo:</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Từ ngày hoàn thành:</label>
                        <input
                            type="date"
                            value={completedFromDate}
                            onChange={(e) => setCompletedFromDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Đến ngày hoàn thành:</label>
                        <input
                            type="date"
                            value={completedToDate}
                            onChange={(e) => setCompletedToDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select value={status || ""} onChange={(e) => setStatus(e.target.value ? parseInt(e.target.value) : null)}>
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value || ""}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Tìm kiếm:</label>
                        <input
                            type="text"
                            placeholder="Nhập từ khóa..."
                            value={textSearch}
                            onChange={(e) => setTextSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-buttons">
                        <button className="btn-search" onClick={handleSearch}>
                            🔍 Tìm kiếm
                        </button>
                        <button className="btn-reset" onClick={handleReset}>
                            🔄 Đặt lại
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã tài liệu</th>
                                    <th>Tên tài liệu</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày cập nhật</th>
                                    <th>Người xử lý</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={index}>
                                            <td>{page * size + index + 1}</td>
                                            <td>{item.contractCode || "N/A"}</td>
                                            <td>{item.contractName || "N/A"}</td>
                                            <td>
                                                <span className={`status-badge status-${item.status}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </td>
                                            <td>{item.updatedDate || "N/A"}</td>
                                            <td>{item.processedBy || "N/A"}</td>
                                            <td>{item.note || "N/A"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="no-data">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <span>
                                Tổng số: {totalElements} | Trang {page + 1} / {totalPages}
                            </span>
                            <div className="pagination-buttons">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(page - 1)}
                                >
                                    ← Trước
                                </button>
                                <button
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Sau →
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ReportByStatus;