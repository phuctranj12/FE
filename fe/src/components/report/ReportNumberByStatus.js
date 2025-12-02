import React, { useState, useEffect } from "react";
import reportService from "../../api/reportService";
import { toast } from "react-toastify";
import "../../styles/report.css";

const STATUS_MAP = {
    totalDraff: "Bản nháp",
    totalCreated: "Đang xử lý",
    totalProcessing: "Đang xử lý",
    totalSigned: "Hoàn thành",
    totalReject: "Từ chối",
    totalCancel: "Hủy bỏ",
    totalLiquidation: "Thanh lý",
    totalExpires: "Hết hạn",
    totalAboutExpire: "Sắp hết hạn",
    totalWaiting: "Chờ xử lý"
};

function ReportNumberByStatus() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState("2025-01-01");
    const [toDate, setToDate] = useState("2025-12-31");

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
            setData(response || {});
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
        setFromDate("2025-01-01");
        setToDate("2025-12-31");
        setData({});
    };

    const totalCount = Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

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
                        {totalCount > 0 ? (
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
                                        {Object.entries(data).map(([key, value], index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span className={`status-badge status-${key}`}>
                                                        {STATUS_MAP[key] || key}
                                                    </span>
                                                </td>
                                                <td className="number-cell">{value || 0}</td>
                                                <td className="number-cell">
                                                    {totalCount > 0
                                                        ? ((value || 0) / totalCount * 100).toFixed(2)
                                                        : 0}
                                                    %
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="total-row">
                                            <td colSpan="2"><strong>Tổng cộng</strong></td>
                                            <td className="number-cell"><strong>{totalCount}</strong></td>
                                            <td className="number-cell"><strong>100%</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div className="chart-section">
                                    <h3>Biểu đồ trực quan</h3>
                                    <div className="bar-chart-report">
                                        {Object.entries(data).map(([key, value], index) => (
                                            <div key={index} className="bar-item">
                                                <div className="bar-label">{STATUS_MAP[key] || key}</div>
                                                <div className="bar-wrapper">
                                                    <div
                                                        className={`bar status-${key}`}
                                                        // style={{ width: `${totalCount > 0 ? (value || 0) / totalCount * 6 : 0}%`, backgroundColor: '#0B57D0' }}
                                                        style={{
                                                            width: totalCount > 0 ? `${(value / totalCount) * 100}%` : "0%",
                                                        }}


                                                    >
                                                        {value || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="no-data">
                                Không có dữ liệu trong khoảng thời gian này
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ReportNumberByStatus;
