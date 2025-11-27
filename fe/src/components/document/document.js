import React, { useState, useEffect } from "react";
import "../../styles/document.css";
// import "../../styles/table.css";
import Button from "../common/Button";
import AdvancedSearchModal from "./AdvancedSearchModal";
import ActionMenu from "./ActionMenu";
import SearchBar from "../common/SearchBar";
import ViewFlowModal from "./ViewFlowModal";
import ShareContractModal from "./ShareContractModal";
import ExtendContractModal from "./ExtendContractModal";
import UploadAttachmentModal from "./UploadAttachmentModal";
import RelatedContractsModal from "./RelatedContractsModal";
import documentService from "../../api/documentService";
import { useNavigate } from "react-router-dom";
import ContractFilterHeader from "./ContractFilterHeader";
console.log({
    AdvancedSearchModal,
    ActionMenu,
    ViewFlowModal,
    ShareContractModal,
    ExtendContractModal,
    UploadAttachmentModal,
    RelatedContractsModal,
    Button,
    SearchBar
});


function Document({ selectedStatus = "all", onDocumentClick }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showViewFlow, setShowViewFlow] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [showUploadAttachment, setShowUploadAttachment] = useState(false);
    const [showRelatedContracts, setShowRelatedContracts] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [docs, setDocs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [scope, setScope] = useState("my"); // "my" = tài liệu của tôi, "org" = tài liệu tổ chức
    const totalPages = Math.ceil(totalDocs / itemsPerPage);
    const navigate = useNavigate();

    const extractListAndTotal = (response) => {
        const payload = response?.data ?? response ?? {};
        const nested = payload?.data ?? {};
        const list =
            Array.isArray(payload)
                ? payload
                : Array.isArray(payload.content)
                    ? payload.content
                    : Array.isArray(payload.items)
                        ? payload.items
                        : Array.isArray(nested)
                            ? nested
                            : Array.isArray(nested.content)
                                ? nested.content
                                : Array.isArray(nested.items)
                                    ? nested.items
                                    : [];
        const total =
            typeof payload.total === "number" ? payload.total :
                typeof payload.totalElements === "number" ? payload.totalElements :
                    typeof nested.total === "number" ? nested.total :
                        typeof nested.totalElements === "number" ? nested.totalElements :
                            list.length;
        return { list, total };
    };
    const [organizationId] = useState(1); // ID mặc định tổ chức
    const fetchDocuments = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        const filter = {
            status: selectedStatus === "all" ? undefined : selectedStatus,
            textSearch: searchTerm,
            fromDate: advancedFilters.fromDate || null,
            toDate: advancedFilters.toDate || null,
            page: currentPage - 1,
            size: itemsPerPage,
        };

        try {
            let data;

            if (scope === "my") {
                // Tài liệu của tôi
                data = await documentService.getMyContracts(filter);
            } else if (scope === "org") {
                // Tài liệu của tổ chức
                data = await documentService.getOrganizationContracts({ ...filter, organizationId });
            }

            const { list, total } = extractListAndTotal(data);
            setDocs(list);
            setTotalDocs(total);

        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErrorMessage("Bạn chưa đăng nhập hoặc token đã hết hạn.");
                } else {
                    setErrorMessage(`Lỗi server: ${error.response.status}`);
                }
            } else if (error.message === "Network Error") {
                setErrorMessage("Không thể kết nối tới server. Vui lòng kiểm tra mạng hoặc server.");
            } else {
                setErrorMessage("Đã xảy ra lỗi không xác định.");
            }
            setDocs([]);
            setTotalDocs(0);
        }
    };


    useEffect(() => {
        fetchDocuments();
    }, [searchTerm, selectedStatus, advancedFilters, currentPage, scope]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, advancedFilters]);

    const handleEdit = (doc) => {
        if (!doc?.id) return;

        const statusMap = {
            0: "draft",
            10: "created",
            20: "processing",
            30: "signed",
            40: "liquidated",
            31: "rejected",
            32: "cancel",
            1: "about-expire",
            2: "expire",
            35: "scan",
        };

        const statusSlug = statusMap[doc.status] || "unknown";
        navigate(`/main/contract/create/${statusSlug}/${doc.id}`);
    };

    // Mở trang chi tiết tài liệu (giống TemplateDetail nhưng cho hợp đồng)
    const handleRowClick = (doc) => {
        if (!doc?.id) return;
        // Nếu parent truyền onDocumentClick thì ưu tiên dùng
        if (onDocumentClick) {
            onDocumentClick(doc);
            return;
        }
        // Mặc định mở trang chi tiết hợp đồng, ContractDetail sẽ load PDF từ URL
        // Thêm showAllFields=1 để hiển thị luôn tất cả component ký/text trên PDF
        navigate(`/main/c/detail/${doc.id}?showAllFields=1`);
    };

    const handleViewFlow = (doc) => {
        if (!doc?.id) return;
        setSelectedContract(doc);
        setShowViewFlow(true);
    };

    const handleShare = (doc) => {
        if (!doc?.id) return;
        // Chỉ cho phép chia sẻ hợp đồng hoàn thành (status = 30)
        if (doc.status !== 30) {
            setErrorMessage("Chỉ có thể chia sẻ hợp đồng đã hoàn thành!");
            return;
        }
        setSelectedContract(doc);
        setShowShare(true);
    };

    const handleExtend = (doc) => {
        if (!doc?.id) return;
        setSelectedContract(doc);
        setShowExtend(true);
    };

    const handleUploadAttachment = (doc) => {
        if (!doc?.id) return;
        setSelectedContract(doc);
        setShowUploadAttachment(true);
    };

    const handleViewRelated = (doc) => {
        if (!doc?.id) return;
        setSelectedContract(doc);
        setShowRelatedContracts(true);
    };

    const handleCopy = async (doc) => {
        if (!doc?.id) return;

        try {
            const contractData = await documentService.getContractById(doc.id);

            navigate('/main/contract/create', {
                state: {
                    copyFrom: contractData?.data || contractData,
                    isCopy: true
                }
            });

            setSuccessMessage("Đang chuẩn bị sao chép tài liệu...");
        } catch (error) {
            setErrorMessage("Không thể sao chép tài liệu. Vui lòng thử lại.");
            console.error(error);
        }
    };

    const handleDelete = async (docId) => {
        try {
            await documentService.deleteContract(docId, "Xóa tài liệu");
            setSuccessMessage("Xóa tài liệu thành công!");
            fetchDocuments();
        } catch (error) {
            setErrorMessage("Không thể xóa tài liệu. Vui lòng thử lại.");
            console.error(error);
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

    const formatDate = (date) => date ? new Date(date).toLocaleString("vi-VN") : "";

    const handleAdvancedSearch = (filters) => {
        if (!filters || Object.values(filters).every(v => v === "" || v === "all" || v === null)) {
            setAdvancedFilters({});
            return;
        }
        setAdvancedFilters(filters);
    };



    return (
        <div className="document-wrapper">

            <div className="table-container">
                <div>
                    <h2>
                        Danh sách tài liệu{" "}
                        {selectedStatus !== "all" && selectedStatus !== undefined
                            ? `(${getStatusLabel(Number(selectedStatus))})`
                            : ""}
                    </h2>
                </div>
                <div className="ContractFilterHeader">
                    <ContractFilterHeader scope={scope} setScope={setScope} />
                </div>



                <div className="documnent-head">
                    <SearchBar
                        placeholder="Tìm kiếm nhanh theo tên tài liệu..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="rgb(11, 87, 208)"
                        text="Nâng cao"
                        onClick={() => setShowAdvanced(true)}
                    />
                </div>

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}

                {successMessage && (
                    <p className="success-message">{successMessage}</p>
                )}

                {docs.length === 0 && !errorMessage ? (
                    <p className="no-docs">Không có tài liệu nào phù hợp với tìm kiếm.</p>
                ) : (
                    <>
                        <table className="content-table">
                            <thead>
                                <tr>
                                    <th>Tên tài liệu</th>
                                    <th>Mã hợp đồng</th>
                                    <th>Số tài liệu</th>
                                    <th>Trạng thái</th>
                                    <th>Thời gian tạo</th>
                                    <th>Thời gian cập nhật</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map(doc => (
                                    <tr
                                        key={doc.id}
                                        className="tr-row"
                                        onClick={() => handleRowClick(doc)}
                                    >

                                        <td className="document-title-cell">
                                            <div className="svg-container">
                                                <div className="svg-bg">
                                                    <svg
                                                        className="contract-icon"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <polyline
                                                            points="14 2 14 8 20 8"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <line
                                                            x1="8"
                                                            y1="12"
                                                            x2="16"
                                                            y2="12"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                        <line
                                                            x1="8"
                                                            y1="16"
                                                            x2="16"
                                                            y2="16"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                        <line
                                                            x1="8"
                                                            y1="20"
                                                            x2="12"
                                                            y2="20"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" stopColor="#0B57D0" stopOpacity="0.8" />
                                                                <stop offset="100%" stopColor="#9333EA" stopOpacity="0.8" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                </div>
                                                <div className="doc-name">    {doc.name}</div>

                                            </div>

                                        </td>
                                        <td>{doc.id}</td>
                                        <td>{doc.contractNo || "-"}</td>
                                        <td>
                                            <span className={`status-badge status-${doc.status}`}>
                                                {getStatusLabel(doc.status)}
                                            </span>
                                        </td>
                                        <td>{formatDate(doc.createdAt)}</td>
                                        <td>{formatDate(doc.updatedAt)}</td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <ActionMenu
                                                onEdit={handleEdit}
                                                onViewFlow={handleViewFlow}
                                                onCopy={handleCopy}
                                                onDelete={handleDelete}
                                                onShare={handleShare}
                                                onExtend={handleExtend}
                                                onUploadAttachment={handleUploadAttachment}
                                                onViewRelated={handleViewRelated}
                                                doc={doc}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalDocs > itemsPerPage && (
                            <div className="pagination">
                                <div className="page-info">
                                    <span>Trang</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(e) => {
                                            let page = Number(e.target.value);
                                            if (page < 1) page = 1;
                                            if (page > totalPages) page = totalPages;
                                            setCurrentPage(page);
                                        }}
                                    />
                                    <span>/ {totalPages}</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
                <AdvancedSearchModal
                    className="advanced-modal"
                    show={showAdvanced}
                    onClose={() => setShowAdvanced(false)}
                    onSearch={handleAdvancedSearch}
                />




                <ViewFlowModal
                    show={showViewFlow}
                    onClose={() => setShowViewFlow(false)}
                    contractId={selectedContract?.id}
                />

                <ShareContractModal
                    show={showShare}
                    onClose={() => setShowShare(false)}
                    contractId={selectedContract?.id}
                    contractName={selectedContract?.name}
                />

                <ExtendContractModal
                    show={showExtend}
                    onClose={() => setShowExtend(false)}
                    contractId={selectedContract?.id}
                    currentExpireTime={selectedContract?.contractExpireTime}
                />

                <UploadAttachmentModal
                    show={showUploadAttachment}
                    onClose={() => setShowUploadAttachment(false)}
                    contractId={selectedContract?.id}
                    onUploadSuccess={fetchDocuments}
                />

                <RelatedContractsModal
                    show={showRelatedContracts}
                    onClose={() => setShowRelatedContracts(false)}
                    contractId={selectedContract?.id}
                />
            </div>
        </div >
    );
}

export default Document;