import React, { useState } from "react";
import "../../styles/documentTemplates.css";
import SearchBar from "../common/SearchBar";
import Button from "../common/Button";
import Pagination from "../common/Pagination";
import TemplateContractItem from "./TemplateContractItem";
import TemplateForm from "./TemplateForm";
import TemplateDetail from "./TemplateDetail";

function DocumentTemplates() {
    const [activeTab, setActiveTab] = useState("created"); // "created" or "shared"
    const [searchName, setSearchName] = useState("");
    const [searchType, setSearchType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Mock data - Replace with real API data
    const [templates] = useState([
        {
            id: 1,
            name: "Hợp đồng cung cấp dịch vụ MobiFone",
            end_time: "2026-12-31T23:59:59",
            organization_name: "Trung tâm công nghệ thông tin MobiFone",
            customer_name: "Nguyễn Văn A",
        },
        {
            id: 2,
            templateId: "TL CHECK EKYC NGOÀI HỆ THỐNG MINH 001",
            partyA: "Trung tâm công nghệ thông tin MobiFone",
            partyB: "",
            contractCode: "JKLMKMKMLK9138091830AA",
            date: "01/01/2026"
        },
        {
            id: 3,
            templateId: "MẪU2173173",
            partyA: "Trung tâm công nghệ thông tin MobiFone",
            partyB: "Người ký (1)",
            contractCode: "NJNKJN19093BBJHC",
            date: "15/12/2026"
        },
        {
            id: 4,
            templateId: "MẪU2173174",
            partyA: "Trung tâm công nghệ thông tin MobiFone",
            partyB: "Người ký (1)",
            contractCode: "NJNKJN19093BBJHD",
            date: "20/12/2026"
        },
        {
            id: 5,
            templateId: "MẪU2173175",
            partyA: "Trung tâm công nghệ thông tin MobiFone",
            partyB: "Người ký (1)",
            contractCode: "NJNKJN19093BBJHE",
            date: "25/12/2026"
        }
    ]);

    const documentTypes = [
        { value: "", label: "Tất cả" },
        { value: "1", label: "Tài liệu gốc" },
        { value: "2", label: "Tài liệu khách hàng" },
        { value: "3", label: "Tài liệu đính kèm" },
        { value: "4", label: "Tài liệu hợp đồng theo lô" }
    ];

    const itemsPerPage = 5;
    const totalPages = Math.ceil(templates.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTemplates = templates.slice(startIndex, endIndex);

    const handleSearch = () => {
        // Implement search logic
        console.log("Searching with:", { searchName, searchType });
    };

    const handleAddNew = () => {
        setShowAddForm(true);
        setEditingTemplate(null);
    };

    const handleBackToList = () => {
        setShowAddForm(false);
        setEditingTemplate(null);
    };

    const handleTemplateClick = (template) => {
        setSelectedTemplate(template);
    };

    const handleBackFromDetail = () => {
        setSelectedTemplate(null);
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

    if (selectedTemplate) {
        return <TemplateDetail template={selectedTemplate} onBack={handleBackFromDetail} />;
    }

    return (
        <div className="document-templates-wrapper">
            <div className="templates-header">
                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === "created" ? "active" : ""}`}
                        onClick={() => setActiveTab("created")}
                    >
                        Mẫu tài liệu tạo
                    </button>
                    <button
                        className={`tab-button ${activeTab === "shared" ? "active" : ""}`}
                        onClick={() => setActiveTab("shared")}
                    >
                        Mẫu tài liệu được chia sẻ
                    </button>
                </div>
            </div>

            <div className="search-filter-section">
                <div className="search-inputs-group">
                    <div className="search-input-wrapper">
                        <SearchBar
                            placeholder="Tên mẫu tài liệu"
                            value={searchName}
                            onChange={setSearchName}
                        />
                    </div>

                    <select
                        className="document-type-select"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        {documentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="action-buttons">
                    <Button
                        outlineColor="#6c757d"
                        backgroundColor="#6c757d"
                        text="Tìm kiếm"
                        onClick={handleSearch}
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
                    {currentTemplates.length > 0 ? (
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
                    ) : (
                        <div className="no-templates">
                            Không có mẫu tài liệu nào
                        </div>
                    )}
                </div>
            </div>

            <FullPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={templates.length}
                itemsPerPage={itemsPerPage}
                startIndex={startIndex + 1}
                endIndex={Math.min(endIndex, templates.length)}
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
