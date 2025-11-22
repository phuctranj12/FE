import React, { useState, useEffect } from "react";
import "../../styles/document.css";
import "../../styles/table.css";
import SearchBar from "../common/SearchBar";
import Button from "../common/Button";
import ActionMenu from "../document/ActionMenu";
import certificateService from "../../api/serverCertificateService";

// Modals
import CertificateDetailsModal from "./CertificateDetailsModal";
import AssignUsersModal from "./AssignUsersModal";
import ImportCertModal from "./ImportCertModal";

function ServerCertificateList() {
    const [signSearch, setSignSearch] = useState("");
    const [subjectSearch, setSubjectSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [allCertificates, setAllCertificates] = useState([]);
    const [filtered, setFiltered] = useState([]);

    // MODAL STATES
    const [openDetails, setOpenDetails] = useState(false);
    const [openAssign, setOpenAssign] = useState(false);
    const [openImport, setOpenImport] = useState(false);
    const [selectedCertId, setSelectedCertId] = useState(null);

    // Load list cert
    const loadCertificates = async () => {
        try {
            const data = await certificateService.getAllCertificates();
            const arr = data.certificates || [];
            setAllCertificates(arr);
            setFiltered(arr);
        } catch (error) {
            console.error("Lỗi khi tải chứng thư số:", error);
        }
    };

    useEffect(() => {
        loadCertificates();
    }, []);

    // Filtering
    useEffect(() => {
        let filteredData = [...allCertificates];

        if (signSearch.trim()) {
            const term = signSearch.toLowerCase();
            filteredData = filteredData.filter((c) =>
                c.signId?.toLowerCase().includes(term)
            );
        }

        if (subjectSearch.trim()) {
            const term = subjectSearch.toLowerCase();
            filteredData = filteredData.filter((c) =>
                c.subject?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "Tất cả") {
            filteredData = filteredData.filter((c) => c.status === statusFilter);
        }

        setFiltered(filteredData);
        setCurrentPage(1);
    }, [signSearch, subjectSearch, statusFilter, allCertificates]);

    // Paging
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCerts = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const formatDate = (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : "";

    // === ACTION HANDLERS ===
    const handleOpenDetails = (id) => {
        setSelectedCertId(id);
        setOpenDetails(true);
    };

    const handleOpenAssign = (id) => {
        setSelectedCertId(id);
        setOpenAssign(true);
    };

    const handleOpenImport = () => {
        setOpenImport(true);
    };

    return (
        <div className="document-wrapper">
            <div className="table-container">
                <h2>Danh sách chứng thư số server</h2>

                <div
                    className="documnent-head"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        width: "100%",
                        marginBottom: "15px",
                    }}
                >
                    {/* Ký hiệu */}
                    <div style={{ display: "flex", width: "35%" }}>
                        <SearchBar
                            placeholder="Tìm theo ký hiệu..."
                            value={signSearch}
                            onChange={setSignSearch}
                        />
                    </div>

                    {/* Chủ thể */}
                    <div
                        style={{ display: "flex", flexDirection: "column", width: "35%" }}
                    >
                        <SearchBar
                            placeholder="Tìm theo chủ thể..."
                            value={subjectSearch}
                            onChange={setSubjectSearch}
                        />
                    </div>

                    {/* Trạng thái */}
                    <div style={{ display: "flex", width: "20%", justifyContent: "center" }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="filter-select"
                            style={{
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                fontSize: "14px",
                                outline: "none",
                                cursor: "pointer",
                            }}
                        >
                            <option value="Tất cả">Tất cả</option>
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Không hoạt động">Không hoạt động</option>
                        </select>
                    </div>

                    {/* Nút Import */}
                    <div style={{ marginLeft: "auto" }}>
                        <Button
                            outlineColor="#0B57D0"
                            backgroundColor="rgb(11, 87, 208)"
                            text="Import chứng thư"
                            onClick={handleOpenImport}
                        />
                    </div>
                </div>

                {/* Danh sách */}
                {filtered.length === 0 ? (
                    <p className="no-docs">Không có chứng thư số phù hợp với tìm kiếm.</p>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ký hiệu</th>
                                    <th>Chủ thể</th>
                                    <th>MST/CCCD</th>
                                    <th>Ngày bắt đầu</th>
                                    <th>Ngày hết hạn</th>
                                    <th>Trạng thái</th>
                                    <th>Quản lý</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCerts.map((c, index) => (
                                    <tr key={index} className="document-row">
                                        <td className="document-title-cell">{c.signId}</td>
                                        <td>{c.subject}</td>
                                        <td>{c.mst}</td>
                                        <td>{formatDate(c.startDate)}</td>
                                        <td>{formatDate(c.endDate)}</td>
                                        <td>{c.status || "Hoạt động"}</td>
                                        <td>
                                            <ActionMenu
                                                onViewFlow={() => handleOpenDetails(c.id)}
                                                onEdit={() => handleOpenAssign(c.id)}
                                                onDelete={() => console.log("Xóa:", c.id)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Phân trang */}
                        {filtered.length > itemsPerPage && (
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
            </div>

            {/* === MODALS === */}
            <CertificateDetailsModal
                open={openDetails}
                certificateId={selectedCertId}
                onClose={() => setOpenDetails(false)}
            />

            <AssignUsersModal
                open={openAssign}
                certificateId={selectedCertId}
                onClose={() => setOpenAssign(false)}
                onAssigned={loadCertificates}
            />

            <ImportCertModal
                open={openImport}
                onClose={() => setOpenImport(false)}
                onImported={loadCertificates}
            />
        </div>
    );
}

export default ServerCertificateList;
