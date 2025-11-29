import React, { useState, useEffect } from "react";
import reportService from "../../api/reportService";
import { toast } from "react-toastify";
import "../../styles/report.css";

const STATUS_MAP = {
    0: "Bản nháp",
    20: "Đang xử lý",
    30: "Hoàn thành",
    31: "Từ chối",
    32: "Hủy bỏ",
};

function ReportNumberByStatus() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const organizationId = JSON.parse(localStorage.getItem('user'))?.organizationId || 1;

    useEffect(() => {
        fetchReportNumberByStatus();
    }, []);

    const fetchReportNumberByStatus = async () => {
        if (!fromDate || !toDate) {
            toast.warn("Vui lòng chọn khoảng thời gian!");
            return;
        }

        setLoading(true);
        try {
            const response = await reportService.getReportNumberByStatus(
                organizationId,
                fromDate,
                toDate
            );
            setData(response || []);
        } catch (error) {
            toast.error("Lỗi khi tải báo cáo số lượng theo trạng thái!");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchReportNumberByStatus();
    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        setData([]);
    };

    const getTotalCount = () => {
        return data.reduce((sum, item) => sum + (item.count || 0), 0);
    };

    return (
        <div className="report-container">
            <h2>📊 Báo cáo số lượng theo trạng thái</h2>

            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label>Từ ngày:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Đến ngày:</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
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
                        {data.length > 0 ? (
                            <>
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>STT</th>
                                            <th>Trạng thái</th>
                                            <th>Số lượng</th>
                                            <th>Tỷ lệ (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className={`status-badge status-${item.status}`}>
                                                        {STATUS_MAP[item.status] || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="number-cell">{item.count || 0}</td>
                                                <td className="number-cell">
                                                    {getTotalCount() > 0
                                                        ? ((item.count / getTotalCount()) * 100).toFixed(2)
                                                        : 0}
                                                    %
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="total-row">
                                            <td colSpan="2">
                                                <strong>Tổng cộng</strong>
                                            </td>
                                            <td className="number-cell">
                                                <strong>{getTotalCount()}</strong>
                                            </td>
                                            <td className="number-cell">
                                                <strong>100%</strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* Biểu đồ đơn giản bằng CSS */}
                                <div className="chart-section">
                                    <h3>Biểu đồ trực quan</h3>
                                    <div className="bar-chart-report">
                                        {data.map((item, index) => (
                                            <div key={index} className="bar-item">
                                                <div className="bar-label">
                                                    {STATUS_MAP[item.status] || "N/A"}
                                                </div>
                                                <div className="bar-wrapper">
                                                    <div
                                                        className={`bar status-${item.status}`}
                                                        style={{
                                                            width: `${getTotalCount() > 0
                                                                ? (item.count / getTotalCount()) * 100
                                                                : 0
                                                                }%`,
                                                        }}
                                                    >
                                                        {item.count}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="no-data">
                                Vui lòng chọn khoảng thời gian và tìm kiếm
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ReportNumberByStatus;