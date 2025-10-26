import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "../common/Button";
function AdvancedSearchModal({ show, onClose, onSearch }) {
    const [filters, setFilters] = useState({
        name: "",
        contract_no: "",
        fromDate: "",
        toDate: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };
    const handleReset = () => {
        setFilters({
            name: "",
            contract_no: "",
            fromDate: "",
            toDate: ""
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
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
                                    <label className="form-label">Tên hợp đồng</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={filters.name}
                                        onChange={handleChange}
                                        placeholder="Nhập tên hợp đồng..."
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Mã hợp đồng</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="contract_no"
                                        value={filters.contract_no}
                                        onChange={handleChange}
                                        placeholder="Nhập mã hợp đồng..."
                                    />
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
