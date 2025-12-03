import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/documentTemplates.css";
import SearchBar from "../common/SearchBar";
import Button from "../common/Button";
import Pagination from "../common/Pagination";
import TemplateContractItem from "./TemplateContractItem";
import TemplateForm from "./TemplateForm";
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
        console.log("Share template:", template);
    };

    const handleCopy = (template) => {
        console.log("Copy template:", template);
    };

    const handleCreateWithFlow = (template) => {
        console.log("Create document with flow from template:", template);
    };

    const handleDelete = (template) => {
        console.log("Delete template:", template);
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
