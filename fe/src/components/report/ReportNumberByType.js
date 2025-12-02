import React, { useState, useEffect } from "react";
import reportService from "../../api/reportService";
import { toast } from "react-toastify";
import "../../styles/report.css";

// Hàm lấy ngày đầu tháng - cuối tháng giống component kia
const getDefaultDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d) => d.toISOString().split("T")[0];
    return {
        from: format(firstDay),
        to: format(lastDay)
    };
};

function ReportNumberByType() {
    const defaultRange = getDefaultDateRange();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(defaultRange.from);
    const [toDate, setToDate] = useState(defaultRange.to);

    const organizationId =
        JSON.parse(localStorage.getItem("user"))?.organizationId || 1;

    useEffect(() => {
        fetchReportNumberByType();
    }, []);

    const fetchReportNumberByType = async () => {
        setLoading(true);
        try {
            const response = await reportService.getReportNumberByType(
                organizationId,
                fromDate,
                toDate
            );

            setData(response || []);
        } catch (error) {
            toast.error("Lỗi khi tải báo cáo số lượng theo loại tài liệu!");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchReportNumberByType();
    };

    const handleReset = () => {
        const again = getDefaultDateRange();
        setFromDate(again.from);
        setToDate(again.to);
        fetchReportNumberByType();
    };

    const getTotalCount = () =>
        data.reduce((sum, item) => sum + (item.count || 0), 0);

    const total = getTotalCount();

    return (
        <div className="report-container">
            <h2>📋 Báo cáo số lượng theo loại tài liệu</h2>

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
                                            <th>Loại tài liệu</th>
                                            <th>Mã loại</th>
                                            <th>Số lượng</th>
                                            <th>Tỷ lệ (%)</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {data.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.typeName || "N/A"}</td>
                                                <td>{item.typeCode || "N/A"}</td>
                                                <td className="number-cell">{item.count || 0}</td>
                                                <td className="number-cell">
                                                    {total > 0
                                                        ? ((item.count / total) * 100).toFixed(2)
                                                        : "0.00"}
                                                    %
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                    <tfoot>
                                        <tr className="total-row">
                                            <td colSpan="3">
                                                <strong>Tổng cộng</strong>
                                            </td>
                                            <td className="number-cell">
                                                <strong>{total}</strong>
                                            </td>
                                            <td className="number-cell">
                                                <strong>{total > 0 ? "100%" : "0%"}</strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                {/* BIỂU ĐỒ */}
                                <div className="chart-section">
                                    <h3>Biểu đồ trực quan</h3>

                                    <div className="bar-chart-report">
                                        {data.map((item, index) => {
                                            const percent =
                                                total > 0
                                                    ? (item.count / total) * 100
                                                    : 0;

                                            return (
                                                <div key={index} className="bar-item">
                                                    <div className="bar-label">
                                                        {item.typeName || "N/A"}
                                                    </div>

                                                    <div className="bar-wrapper">
                                                        <div
                                                            className="bar bar-type"
                                                            style={{
                                                                width: `${percent}%`,
                                                                minWidth:
                                                                    item.count > 0 ? "30px" : "0px",
                                                                backgroundColor: `hsl(${index * 60
                                                                    }, 70%, 60%)`,
                                                            }}
                                                        >
                                                            {item.count}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="no-data">Không có dữ liệu</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ReportNumberByType;
