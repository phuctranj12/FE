import React from 'react';
import '../../styles/documentPackage.css';

const DocumentPackage = ({ used = 4276, total = 90750, expirationDate = '01/01/2029' }) => {
    const unused = total - used;
    const usedPercentage = (used / total) * 100;
    const unusedPercentage = (unused / total) * 100;
    
    // Tính toán cho SVG donut chart
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const usedDashLength = (usedPercentage / 100) * circumference;
    const unusedDashLength = (unusedPercentage / 100) * circumference;
    
    // Used segment: nhỏ, màu xanh, bắt đầu từ -90 độ
    // Unused segment: lớn, màu tím, tiếp theo used segment
    const usedDashOffset = circumference - usedDashLength;
    const unusedDashOffset = usedDashLength; // Bắt đầu sau used segment
    
    return (
        <div className="document-package-container">
            <div className="document-package-header">
                <h3 className="document-package-title">Gói tài liệu</h3>
            </div>
            
            <div className="document-package-content">
                <div className="donut-chart-wrapper">
                    <svg className="donut-chart" width="200" height="200" viewBox="0 0 200 200">
                        {/* Background circle - unused (larger, light purple) */}
                        <circle
                            className="donut-segment unused"
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="#E8E0FF"
                            strokeWidth="30"
                            strokeDasharray={`${unusedDashLength} ${circumference}`}
                            strokeDashoffset={unusedDashOffset}
                            transform="rotate(-90 100 100)"
                        />
                        {/* Foreground circle - used (smaller, bright blue) */}
                        <circle
                            className="donut-segment used"
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="#0B57D0"
                            strokeWidth="30"
                            strokeDasharray={`${usedDashLength} ${circumference}`}
                            strokeDashoffset={usedDashOffset}
                            transform="rotate(-90 100 100)"
                        />
                    </svg>
                    
                    {/* Center text */}
                    <div className="donut-center-text">
                        <div className="donut-used-number">{used.toLocaleString()}</div>
                        <div className="donut-total-text">TỔNG: {total.toLocaleString()}</div>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="donut-legend">
                    <div className="legend-item">
                        <div className="legend-color used"></div>
                        <span className="legend-label">Đã dùng</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color unused"></div>
                        <span className="legend-label">Chưa dùng</span>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <div className="document-package-footer">
                <div className="footer-separator"></div>
                <div className="footer-content">
                    <span className="footer-label">Ngày hết hạn sử dụng dịch vụ:</span>
                    <span className="footer-date">{expirationDate}</span>
                </div>
            </div>
        </div>
    );
};

export default DocumentPackage;
