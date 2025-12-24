import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "../common/Button";

function AdvancedSearchModal({ show, onClose, onSearch }) {
    const [filters, setFilters] = useState({
        name: "",
        document_no: "",
        type: "all",
        fromDate: "",
        toDate: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        const resetFilters = {
            name: "",
            document_no: "",
            type: "all",
            fromDate: "",
            toDate: ""
        };
        setFilters(resetFilters);
        onSearch(null); // ✅ Gửi tín hiệu hiển thị tất cả tài liệu
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
        onClose();
    };

    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow-lg">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">Tìm kiếm nâng cao</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Tên tài liệu</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={filters.name}
                                        onChange={handleChange}
                                        placeholder="Nhập tên tài liệu..."
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Loại tài liệu</label>
                                    <select
                                        className="form-select"
                                        name="type"
                                        value={filters.type}
                                        onChange={handleChange}
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="1">Tài liệu gốc</option>
                                        <option value="2">Tài liệu khách hàng</option>
                                        <option value="3">Tài liệu đính kèm</option>
                                        <option value="5">Tài liệu hoàn thành được nén lại</option>
                                        <option value="6">Tài liệu backup hợp đồng</option>
                                        <option value="7">Tài liệu ảnh eKYC</option>
                                        <option value="8">Tài liệu tracking theo hợp đồng</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Từ ngày</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="fromDate"
                                        value={filters.fromDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Đến ngày</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="toDate"
                                        value={filters.toDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <Button
                                outlineColor="rgb(11, 87, 208)"
                                backgroundColor="transparent"
                                text="Đặt lại"
                                onClick={handleReset}
                                type="button"
                            />
                            <Button
                                outlineColor="#0B57D0"
                                backgroundColor="rgb(11, 87, 208)"
                                text="Tìm kiếm"
                                onClick={handleSubmit}
                                type="submit"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdvancedSearchModal;
