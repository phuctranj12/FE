import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/documentTemplates.css";
import SearchBar from "../common/SearchBar";
import Button from "../common/Button";
import Pagination from "../common/Pagination";
import TemplateContractItem from "./TemplateContractItem";
import TemplateForm from "./TemplateForm";
import ConfirmDeleteModal from "../document/ConfirmDeleteModal";
import TemplateShareModal from "./TemplateShareModal";
import contractService from "../../api/contractService";

// Simple debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function DocumentTemplates() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("created"); // "created" or "shared"
    const [searchName, setSearchName] = useState("");
    const [searchType, setSearchType] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [templates, setTemplates] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [documentTypesList, setDocumentTypesList] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [searchTrigger, setSearchTrigger] = useState(0);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [templateToShare, setTemplateToShare] = useState(null);
    const [toasts, setToasts] = useState([]);
    
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                setError(null);

                let res;
                if (activeTab === "shared") {
                    // Gọi API cho template được chia sẻ
                    res = await contractService.getSharedTemplates({
                        textSearch: searchName || undefined,
                        fromDate: fromDate || undefined,
                        toDate: toDate || undefined,
                        page: currentPage - 1,
                        size: pageSize
                    });
                } else {
                    // Gọi API cho template đã tạo (created)
                    res = await contractService.getMyTemplateContracts({
                        type: searchType || undefined,
                        name: searchName || undefined,
                        page: currentPage - 1,
                        size: pageSize
                    });
                }

                // Giả sử backend trả về dạng { code, data: { content, totalElements, totalPages } }
                const payload = res.data?.data || res.data || {};
                const list = payload.content || payload.items || payload || [];
                const total = payload.totalElements ?? payload.totalItems ?? list.length;

                setTemplates(list);
                setTotalItems(total);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách tài liệu mẫu:", err);
                setError("Không thể tải danh sách tài liệu mẫu");
                setTemplates([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
        // Gọi mỗi khi đổi tab, đổi page, filter hoặc trigger search
    }, [activeTab, currentPage, searchName, searchType, fromDate, toDate, pageSize, refreshTrigger, searchTrigger]);

    const documentTypes = [
        { value: "", label: "Tất cả" },
        { value: "1", label: "Tài liệu gốc" },
        { value: "2", label: "Tài liệu khách hàng" },
        { value: "3", label: "Tài liệu đính kèm" },
        { value: "4", label: "Tài liệu hợp đồng theo lô" }
    ];

    const itemsPerPage = pageSize;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTemplates = templates.slice(startIndex, endIndex);

    // Debounced search cho text input
    const debouncedSearch = useCallback(
        debounce((searchValue, typeValue) => {
            if (activeTab === "created") {
                // Tự động search khi user nhập text (chỉ cho tab created)
                setSearchTrigger(prev => prev + 1);
            }
        }, 800),
        [activeTab]
    );

    const handleSearchNameChange = (value) => {
        setSearchName(value);
        debouncedSearch(value, searchType);
    };

    const handleSearchTypeChange = (value) => {
        setSearchType(value);
        if (activeTab === "created") {
            setCurrentPage(1);
            setSearchTrigger(prev => prev + 1);
        }
    };

    const handleManualSearch = () => {
        setCurrentPage(1);
        setSearchTrigger(prev => prev + 1); // Manual search trigger
    };

    const handleAddNew = () => {
        setShowAddForm(true);
        setEditingTemplate(null);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingTemplate(null);
        // Refresh lại danh sách templates khi quay về từ form tạo/sửa
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTemplateClick = (template) => {
        const templateId = template.id || template.contractId;
        if (templateId) {
            navigate(`/main/contract-template/detail/${templateId}`);
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowAddForm(true);
    };

    const handleBatchCreate = (template) => {
        console.log("Batch create from template:", template);
    };

    const handleSingleCreate = (template) => {
        console.log("Single create from template:", template);
    };

    const handleStopPublish = (template) => {
        console.log("Stop publish template:", template);
    };

    const handleShare = (template) => {
        setTemplateToShare(template);
        setShowShareModal(true);
    };

    const generateRandomContractNo = () => {
        const prefix = 'HD';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${timestamp}-${random}`;
    };

    const handleCopy = async (template) => {
        const templateId = template.id || template.contractId;
        if (!templateId) {
            showToast("Không tìm thấy ID của mẫu tài liệu", 'error');
            return;
        }

        try {
            showToast("Đang sao chép mẫu tài liệu...", 'success');
            
            // Bước 1: Lấy thông tin template contract
            const templateContractRes = await contractService.getTemplateContractById(templateId);
            if (templateContractRes?.code !== 'SUCCESS' || !templateContractRes?.data) {
                throw new Error("Không thể lấy thông tin mẫu tài liệu");
            }
            const templateContract = templateContractRes.data;
            const contractId = templateContract.id || templateContract.contractId;

            // Bước 2: Lấy participants với recipients
            let templateParticipants = [];
            try {
                const participantsRes = await contractService.getTemplateParticipantsByContract(contractId);
                if (participantsRes?.code === 'SUCCESS' && participantsRes?.data) {
                    templateParticipants = Array.isArray(participantsRes.data) ? participantsRes.data : [];
                }
            } catch (err) {
                console.warn("Lỗi khi lấy participants:", err);
            }

            // Bước 3: Lấy fields
            let templateFields = [];
            try {
                const fieldsRes = await contractService.getTemplateFieldsByContract(contractId);
                if (fieldsRes?.code === 'SUCCESS' && fieldsRes?.data) {
                    templateFields = Array.isArray(fieldsRes.data) ? fieldsRes.data : [];
                }
            } catch (err) {
                console.warn("Lỗi khi lấy fields:", err);
            }

            // Bước 4: Lấy documents
            let templateDocuments = [];
            try {
                const documentsRes = await contractService.getTemplateDocumentsByContract(contractId);
                if (documentsRes?.code === 'SUCCESS' && documentsRes?.data) {
                    templateDocuments = Array.isArray(documentsRes.data) ? documentsRes.data : [];
                }
            } catch (err) {
                console.warn("Lỗi khi lấy documents:", err);
            }

            // Bước 5: Generate contractNo mới
            const newContractNo = generateRandomContractNo();

            // Bước 6: Tạo contract mới (template contract)
            const newContractData = {
                name: `${templateContract.name || 'Mẫu tài liệu'} (Bản sao)`,
                contractNo: newContractNo,
                typeId: templateContract.typeId,
                contractExpireTime: templateContract.contractExpireTime || null,
                note: templateContract.note || '',
                isTemplate: true
            };

            const createContractRes = await contractService.createTemplateContract(newContractData);
            if (createContractRes?.code !== 'SUCCESS' || !createContractRes?.data) {
                throw new Error("Không thể tạo hợp đồng mẫu mới");
            }
            const newContractId = createContractRes.data.id || createContractRes.data.contractId;

            // Bước 7: Tạo participants với recipients và map recipientId
            const recipientIdMap = new Map(); // Map old recipientId -> new recipientId
            if (templateParticipants.length > 0) {
                const participantsPayload = templateParticipants.map(participant => ({
                    name: participant.name,
                    type: participant.type,
                    ordering: participant.ordering,
                    status: participant.status || 1,
                    contractId: newContractId,
                    recipients: (participant.recipients || []).map(recipient => ({
                        name: recipient.name,
                        email: recipient.email || '',
                        phone: recipient.phone || '',
                        cardId: recipient.cardId || '',
                        role: recipient.role,
                        ordering: recipient.ordering,
                        status: recipient.status || 0,
                        signType: recipient.signType || 6
                    }))
                }));

                const createParticipantsRes = await contractService.createTemplateParticipant(newContractId, participantsPayload);
                
                // Map recipientId cũ sang mới
                if (createParticipantsRes?.code === 'SUCCESS' && createParticipantsRes?.data) {
                    const newParticipants = Array.isArray(createParticipantsRes.data) ? createParticipantsRes.data : [];
                    
                    templateParticipants.forEach((oldParticipant, pIndex) => {
                        const newParticipant = newParticipants[pIndex];
                        if (newParticipant && newParticipant.recipients) {
                            (oldParticipant.recipients || []).forEach((oldRecipient, rIndex) => {
                                const newRecipient = newParticipant.recipients[rIndex];
                                if (oldRecipient.id && newRecipient?.id) {
                                    recipientIdMap.set(oldRecipient.id, newRecipient.id);
                                }
                            });
                        }
                    });
                }
            }

            // Bước 8: Tạo documents trước để có documentId cho fields
            const documentIdMap = new Map(); // Map old documentId -> new documentId
            if (templateDocuments.length > 0) {
                for (const doc of templateDocuments) {
                    const documentData = {
                        name: doc.name || '',
                        type: doc.type,
                        contractId: newContractId,
                        fileName: doc.fileName || '',
                        path: doc.path || '',
                        status: doc.status || 1
                    };
                    const createDocRes = await contractService.createTemplateDocument(documentData);
                    if (createDocRes?.code === 'SUCCESS' && createDocRes?.data?.id) {
                        const oldDocId = doc.id || doc.documentId;
                        const newDocId = createDocRes.data.id;
                        if (oldDocId) {
                            documentIdMap.set(oldDocId, newDocId);
                        }
                    }
                }
            }

            // Bước 9: Tạo fields với documentId và recipientId đã được map
            if (templateFields.length > 0) {
                const fieldsPayload = templateFields.map(field => {
                    const oldDocId = field.documentId;
                    const newDocId = oldDocId ? documentIdMap.get(oldDocId) : null;
                    
                    const oldRecipientId = field.recipientId;
                    const newRecipientId = oldRecipientId ? recipientIdMap.get(oldRecipientId) : null;

                    const parseNumber = (val, fallback = 0) => {
                        if (typeof val === 'number') return val;
                        const n = parseFloat(val);
                        return Number.isNaN(n) ? fallback : n;
                    };

                    const boxX = parseNumber(field.boxX ?? field.x, 0);
                    const boxY = parseNumber(field.boxY ?? field.y, 0);
                    const boxW = parseNumber(field.boxW ?? field.width, 100);
                    const rawBoxH = field.boxH ?? field.height ?? '30';
                    const boxH =
                        typeof rawBoxH === 'string'
                            ? rawBoxH
                            : rawBoxH.toString();

                    return {
                        name: field.name,
                        font: field.font || 'Times New Roman',
                        fontSize: field.fontSize || 11,
                        boxX,
                        boxY,
                        page: field.page ? field.page.toString() : '1',
                        ordering: field.ordering ?? 0,
                        boxW,
                        boxH,
                        contractId: newContractId,
                        documentId: newDocId || null,
                        type: field.type || 1,
                        recipientId: newRecipientId || null,
                        status: field.status ?? 0
                    };
                });

                console.log('[Template Copy] Fields payload to createTemplateField:', fieldsPayload);
                await contractService.createTemplateField(fieldsPayload);
            }

            // Bước 10: Đổi trạng thái hợp đồng mẫu mới sang 10 (CREATED)
            try {
                const statusRes = await contractService.changeTemplateContractStatus(
                    newContractId,
                    10
                );
                if (statusRes?.code !== 'SUCCESS') {
                    console.warn('Không thể đổi trạng thái template copy sang 10:', statusRes);
                }
            } catch (statusErr) {
                console.warn('Lỗi khi đổi trạng thái template copy sang 10:', statusErr);
            }

            showToast("Sao chép mẫu tài liệu thành công", 'success');
            // Refresh lại danh sách
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Lỗi khi sao chép mẫu tài liệu:", error);
            const errorMessage = error.response?.data?.message || error.message || "Không thể sao chép mẫu tài liệu";
            showToast(errorMessage, 'error');
        }
    };

    const handleCreateWithFlow = (template) => {
        console.log("Create document with flow from template:", template);
    };

    const showToast = (message, variant = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, variant }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleDelete = (template) => {
        setTemplateToDelete(template);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!templateToDelete) return;

        const templateId = templateToDelete.id || templateToDelete.contractId;
        if (!templateId) {
            showToast("Không tìm thấy ID của mẫu tài liệu", 'error');
            setShowDeleteConfirm(false);
            setTemplateToDelete(null);
            return;
        }

        try {
            await contractService.deleteTemplateContract(templateId);
            showToast("Xóa mẫu tài liệu thành công", 'success');
            setShowDeleteConfirm(false);
            setTemplateToDelete(null);
            // Refresh lại danh sách
            setRefreshTrigger(prev => prev + 1);
            // Nếu trang hiện tại không còn item nào, quay về trang trước
            if (currentTemplates.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        } catch (error) {
            console.error("Lỗi khi xóa mẫu tài liệu:", error);
            const errorMessage = error.response?.data?.message || error.message || "Không thể xóa mẫu tài liệu";
            showToast(errorMessage, 'error');
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setTemplateToDelete(null);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (showAddForm) {
        return <TemplateForm onBack={handleBackToList} editTemplate={editingTemplate} />;
    }

    return (
        <div className="document-templates-wrapper">
            <div className="templates-header">
                <div className="filter-scope">
                    <button
                        className={`tab-button ${activeTab === "created" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("created");
                            setCurrentPage(1); // Reset về trang 1 khi chuyển tab
                            setFromDate(""); // Reset date filters khi chuyển về tab created
                            setToDate("");
                        }}
                    >
                        Mẫu tài liệu tạo
                    </button>
                    <button
                        className={`tab-button ${activeTab === "shared" ? "active" : ""}`}
                        onClick={() => {
                            setActiveTab("shared");
                            setCurrentPage(1); // Reset về trang 1 khi chuyển tab
                            setSearchType(""); // Reset type filter khi chuyển sang tab shared
                        }}
                    >
                        Mẫu tài liệu được chia sẻ
                    </button>
                </div>
            </div>

            <div className="search-filter-section">
                <div className="search-inputs-group">
                    <div className="search-input-wrapper">
                        <SearchBar
                            placeholder={activeTab === "shared" ? "Tìm kiếm theo tên..." : "Tên mẫu tài liệu"}
                            value={searchName}
                            onChange={handleSearchNameChange}
                        />
                    </div>

                    {activeTab === "created" && (
                    <select
                        className="document-type-select"
                        value={searchType}
                        onChange={(e) => handleSearchTypeChange(e.target.value)}
                    >
                            {documentTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    )}

                    {activeTab === "shared" && (
                        <div className="date-range-wrapper-template">
                            <div className="date-input-wrapper-template">
                                <input
                                    type="date"
                                    className="date-input-template"
                                    placeholder="Từ ngày"
                                    value={fromDate}
                                    onChange={(e) => {
                                        setFromDate(e.target.value);
                                        setCurrentPage(1);
                                        setSearchTrigger(prev => prev + 1);
                                    }}
                                />
                            </div>
                            <span className="date-range-separator">-</span>
                            <div className="date-input-wrapper-template">
                                <input
                                    type="date"
                                    className="date-input-template"
                                    placeholder="Đến ngày"
                                    value={toDate}
                                    onChange={(e) => {
                                        setToDate(e.target.value);
                                        setCurrentPage(1);
                                        setSearchTrigger(prev => prev + 1);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="action-buttons">
                    <Button
                        outlineColor="#6c757d"
                        backgroundColor="#6c757d"
                        text="Tìm kiếm"
                        onClick={handleManualSearch}
                    />
                    <Button
                        outlineColor="#0B57D0"
                        backgroundColor="#0B57D0"
                        text="Thêm mới"
                        onClick={handleAddNew}
                    />
                </div>
            </div>

            <div className="templates-list-container">
                <div className="list-header">
                    <div className="header-item header-name">Tên mẫu tài liệu</div>
                    <div className="header-item header-code">Mã mẫu tài liệu</div>
                    <div className="header-item header-date">Ngày hết hiệu lực</div>
                    <div className="header-options"></div>
                </div>

                <div className="templates-list">
                    {loading && (
                        <div className="no-templates">Đang tải danh sách tài liệu mẫu...</div>
                    )}
                    {!loading && error && (
                        <div className="no-templates" style={{ color: '#dc3545' }}>{error}</div>
                    )}
                    {!loading && !error && templates.length === 0 && (
                        <div className="no-templates">Không có mẫu tài liệu nào</div>
                    )}
                    {!loading && !error && templates.length > 0 && (
                        currentTemplates.map((template) => (
                            <TemplateContractItem
                                key={template.id}
                                contract={template}
                                isShared={activeTab === "shared"}
                                onClick={() => handleTemplateClick(template)}
                                onEdit={handleEdit}
                                onBatchCreate={handleBatchCreate}
                                onSingleCreate={handleSingleCreate}
                                onStopPublish={handleStopPublish}
                                onShare={handleShare}
                                onCopy={handleCopy}
                                onCreateWithFlow={handleCreateWithFlow}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>

            <FullPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                startIndex={totalItems === 0 ? 0 : startIndex + 1}
                endIndex={endIndex}
                onPageChange={handlePageChange}
            />

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                show={showDeleteConfirm}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                documentName={templateToDelete?.name || templateToDelete?.contractName || "mẫu tài liệu này"}
            />

            {/* Share Template Modal */}
            <TemplateShareModal
                show={showShareModal}
                onClose={() => {
                    setShowShareModal(false);
                    setTemplateToShare(null);
                }}
                templateId={templateToShare?.id || templateToShare?.contractId}
                templateName={
                    templateToShare?.name ||
                    templateToShare?.templateId ||
                    "Mẫu tài liệu"
                }
            />

            {/* Toast Notifications */}
            {toasts.length > 0 && (
                <div style={{ 
                    position: 'fixed', 
                    top: 16, 
                    right: 16, 
                    zIndex: 10000, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 8 
                }}>
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            style={{
                                minWidth: 260,
                                maxWidth: 420,
                                padding: '12px 16px',
                                borderRadius: 8,
                                color: t.variant === 'success' ? '#0a3622' : '#842029',
                                background: t.variant === 'success' ? '#d1e7dd' : '#f8d7da',
                                border: `1px solid ${t.variant === 'success' ? '#a3cfbb' : '#f5c2c7'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <span style={{ flex: 1 }}>{t.message}</span>
                            <button
                                onClick={() => removeToast(t.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    color: 'inherit',
                                    marginLeft: '12px',
                                    padding: '0 4px'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Full pagination component with page info
function FullPagination({ currentPage, totalPages, totalItems, itemsPerPage, startIndex, endIndex, onPageChange }) {
    const windowSize = 5;

    const handlePageChange = (page) => {
        onPageChange && onPageChange(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        const size = Math.max(1, windowSize);

        if (totalPages <= size) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= Math.ceil(size / 2)) {
            for (let i = 1; i <= size; i++) pages.push(i);
        } else if (currentPage >= totalPages - Math.floor(size / 2)) {
            for (let i = totalPages - size + 1; i <= totalPages; i++) pages.push(i);
        } else {
            const start = currentPage - Math.floor(size / 2);
            for (let i = 0; i < size; i++) pages.push(start + i);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="full-pagination-container">
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={handlePageChange}
                windowSize={windowSize}
            />

            <div className="pagination-info">
                <span className="page-count">{currentPage} của {totalPages} trang</span>
                <span className="item-count">Số lượng: {startIndex} - {endIndex} / {totalItems}</span>
            </div>
        </div>
    );
}

export default DocumentTemplates;
