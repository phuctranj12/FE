import React, { useState, useEffect } from "react";
import reportService from "../../api/reportService";
import { toast } from "react-toastify";
import "../../styles/report.css";

const STATUS_OPTIONS = [
    { value: null, label: "Tất cả" },
    { value: 0, label: "Bản nháp" },
    { value: 20, label: "Đang xử lý" },
    { value: 30, label: "Hoàn thành" },
    { value: 31, label: "Từ chối" },
    { value: 32, label: "Hủy bỏ" },
];

function ReportMyProcess() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Set mặc định giống component kia
    const [fromDate, setFromDate] = useState("2025-01-01");
    const [toDate, setToDate] = useState("2025-12-31");

    const [completedFromDate, setCompletedFromDate] = useState("");
    const [completedToDate, setCompletedToDate] = useState("");
    const [status, setStatus] = useState(null);
    const [textSearch, setTextSearch] = useState("");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const user = JSON.parse(localStorage.getItem("user"));
    const organizationId = user?.organizationId || 1;

    useEffect(() => {
        fetchReportMyProcess();
    }, [page, size]);

    // Build params chỉ gửi các field có giá trị
    const buildParams = () => {
        const params = {
            fromDate,
            toDate,
            page,
            size,
        };

        if (completedFromDate) params.completedFromDate = completedFromDate;
        if (completedToDate) params.completedToDate = completedToDate;
        if (status !== null) params.status = status;
        if (textSearch.trim() !== "") params.textSearch = textSearch;

        return params;
    };

    const fetchReportMyProcess = async () => {
        setLoading(true);
        try {
            const response = await reportService.getReportMyProcess(
                organizationId,
                buildParams()
            );

            setData(response.content || []);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);

        } catch (error) {
            toast.error("Lỗi khi tải báo cáo tài liệu đã nhận!");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchReportMyProcess();
    };

    const handleReset = () => {
        setFromDate("2025-01-01");
        setToDate("2025-12-31");
        setCompletedFromDate("");
        setCompletedToDate("");
        setStatus(null);
        setTextSearch("");
        setPage(0);
        fetchReportMyProcess();
    };

    const getStatusLabel = (statusValue) => {
        const found = STATUS_OPTIONS.find(opt => opt.value === statusValue);
        return found ? found.label : "N/A";
    };

    // Lấy người gửi từ participants → recipients
    const getSender = (item) => {
        try {
            return item.participants?.[0]?.recipients?.[0]?.name || "N/A";
        } catch {
            return "N/A";
        }
    };
    const getProcessorName = (item) => {
        if (!item?.participants || item.participants.length === 0) {
            return "N/A";
        }

        for (const participant of item.participants) {
            if (!participant?.recipients) continue;

            const processor = participant.recipients.find(
                (r) => r.role === 3
            );

            if (processor) {
                return processor.name || "N/A";
            }
        }

        return "N/A";
    };

    return (
        <div className="report-container">
            <h2> Báo cáo tài liệu đã nhận</h2>

            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Từ ngày tạo:</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Đến ngày tạo:</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Từ ngày hoàn thành:</label>
                        <input type="date" value={completedFromDate} onChange={(e) => setCompletedFromDate(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Đến ngày hoàn thành:</label>
                        <input type="date" value={completedToDate} onChange={(e) => setCompletedToDate(e.target.value)} />
                    </div>
                </div>

                <div className="filter-row">
                    <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select value={status ?? ""} onChange={(e) => setStatus(e.target.value ? parseInt(e.target.value) : null)}>
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value ?? ""}>{opt.label}</option>
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
                        <button className="btn-search" onClick={handleSearch}> Tìm kiếm</button>
                        <button className="btn-reset" onClick={handleReset}> Đặt lại</button>
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
                                    <th>Ngày tạo</th>
                                    <th>Ngày hết hạn</th>
                                    <th>Trạng thái</th>
                                    <th>Người gửi</th>
                                    <th>Người xử lý</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item, index) => (
                                        <tr key={index}>
                                            <td>{page * size + index + 1}</td>
                                            <td>{item.contractNo || "N/A"}</td>
                                            <td>{item.name || "N/A"}</td>
                                            <td>{item.signTime || "N/A"}</td>
                                            <td>{item.contractExpireTime || "N/A"}</td>
                                            <td>
                                                <span className={`status-badge status-${item.status}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </td>
                                            <td>{getSender(item)}</td>
                                            <td>{getProcessorName(item)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="no-data">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <span>
                                Tổng số: {totalElements} | Trang {page + 1} / {totalPages}
                            </span>
                            <div className="pagination-buttons">
                                <button disabled={page === 0} onClick={() => setPage(page - 1)}>← Trước</button>
                                <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Sau →</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ReportMyProcess;
