import React, { useState, useEffect } from "react";
import "../../styles/modal.css";
import "../../styles/table.css";
import documentService from "../../api/documentService";

function RelatedContractsModal({ show, onClose, contractId }) {
    const [relatedContracts, setRelatedContracts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show && contractId) {
            fetchRelatedContracts();
        }
    }, [show, contractId]);

    const fetchRelatedContracts = async () => {
        setLoading(true);
        setError("");
        try {
            // Lấy chi tiết hợp đồng hiện tại
            const contractData = await documentService.getContractById(contractId);
            const contract = contractData?.data || contractData;

            // Lấy danh sách contractRefs
            const refs = contract?.contractRefs || [];

            if (refs.length === 0) {
                setRelatedContracts([]);
                setLoading(false);
                return;
            }

            // Lấy chi tiết từng hợp đồng liên quan
            const refDetails = await Promise.all(
                refs.map(async (ref) => {
                    try {
                        const refData = await documentService.getContractById(ref.refId);
                        return refData?.data || refData;
                    } catch (err) {
                        console.error(`Error fetching contract ${ref.refId}:`, err);
                        return null;
                    }
                })
            );

            setRelatedContracts(refDetails.filter(Boolean));
        } catch (err) {
            setError("Không thể tải danh sách tài liệu liên quan");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            0: "Bản nháp",
            10: "Đã tạo",
            20: "Đang xử lý",
            30: "Hoàn thành",
            40: "Thanh lý",
            31: "Từ chối",
            32: "Hủy bỏ",
            1: "Sắp hết hạn",
            2: "Hết hạn",
            35: "Scan",
        };
        return statusMap[status] || "Không xác định";
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString("vi-VN");
    };

    const handleViewContract = (contract) => {
        // Có thể mở modal chi tiết hoặc navigate
        window.open(`/main/contract/view/${contract.id}`, '_blank');
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Tài liệu liên quan</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {loading && <p>Đang tải...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && !error && relatedContracts.length === 0 && (
                        <p className="no-data">Không có tài liệu liên quan</p>
                    )}

                    {!loading && !error && relatedContracts.length > 0 && (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tên tài liệu</th>
                                    <th>Mã HĐ</th>
                                    <th>Số tài liệu</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relatedContracts.map((contract) => (
                                    <tr key={contract.id}>
                                        <td>{contract.name}</td>
                                        <td>{contract.id}</td>
                                        <td>{contract.contractNo || "-"}</td>
                                        <td>
                                            <span className={`status-badge status-${contract.status}`}>
                                                {getStatusLabel(contract.status)}
                                            </span>
                                        </td>
                                        <td>{formatDate(contract.createdAt)}</td>
                                        <td>
                                            <button
                                                className="btn-view-small"
                                                onClick={() => handleViewContract(contract)}
                                            >
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
}

export default RelatedContractsModal;