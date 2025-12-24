import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "../../styles/document.css";
import "../../styles/table.css";
import SearchBar from "../common/SearchBar";
import Button from "../common/Button";
import certificateService from "../../api/serverCertificateService";
import customerService from "../../api/customerService";
import CertificateActionMenu from "./CertificateActionMenu";
// Modals
import CertificateDetailsModal from "./CertificateDetailsModal";
import AssignUsersModal from "./AssignUsersModal";
import ImportCertModal from "./ImportCertModal";
import UpdateCertificateModal from "./UpdateCertificateModal";
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
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    useEffect(() => {
        if (subjectSearch) {
            console.log("🔴 subjectSearch changed to:", subjectSearch);
            console.trace();
        }
    }, [subjectSearch]);
    // Load list cert
    const loadCertificates = async () => {
        try {
            // const data = await certificateService.getAllCertificates();
            // const data = await certificateService.findCerts();
            const data = await certificateService.findCerts({
                subject: "",
                serial_number: "",
                status: 1, // hoặc để trống nếu muốn lấy tất cả
                size: 100, // số lượng records muốn lấy
                page: 0
            });
            console.log("Danh sách chứng thư số tải về:", data);
            // const arr = data.certificates || [];
            const arr = data.content || data.certificates || data || [];
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
        console.log("🔍 Filtering triggered");
        console.log("allCertificates:", allCertificates.length);
        console.log("signSearch:", signSearch);
        console.log("subjectSearch:", subjectSearch);
        console.log("statusFilter:", statusFilter);
        let filteredData = [...allCertificates];

        if (signSearch.trim()) {
            const term = signSearch.toLowerCase();
            filteredData = filteredData.filter((c) =>
                c.keyStoreFileName?.toLowerCase().includes(term)
            );
        }

        if (subjectSearch.trim()) {
            const term = subjectSearch.toLowerCase();
            filteredData = filteredData.filter((c) => {
                const cnMatch = c.certInformation?.match(/CN=([^,]+)/);
                const subject = cnMatch ? cnMatch[1] : "";
                return subject.toLowerCase().includes(term);
            });
        }

        if (statusFilter !== "Tất cả") {
            filteredData = filteredData.filter(
                (c) =>
                    (statusFilter === "Hoạt động" && c.status === 1) ||
                    (statusFilter === "Không hoạt động" && c.status !== 1)
            );
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
    const handleOpenUpdate = (id) => {
        setSelectedCertId(id);
        setOpenUpdate(true);
    };


    const handleOpenAssign = (id) => {
        setSelectedCertId(id);
        setOpenAssign(true);
    };

    const handleOpenImport = () => {
        setOpenImport(true);
    };

    // Handle delete certificate
    const handleDeleteCert = async (certificateId) => {
        if (!certificateId) {
            toast.error('Không tìm thấy ID chứng thư số cần xóa');
            return;
        }

        try {
            // Lấy email của user hiện tại
            const userResponse = await customerService.getCustomerByToken();
            const currentUserEmail = userResponse?.data?.email;

            if (!currentUserEmail) {
                toast.error('Không tìm thấy email của user hiện tại');
                return;
            }

            // Lấy thông tin cert để lấy danh sách customers
            const certInfo = await certificateService.findCertById(certificateId);

            if (!certInfo?.customers || !Array.isArray(certInfo.customers)) {
                toast.error('Không tìm thấy danh sách users trong chứng thư số');
                return;
            }

            // Tìm customer có email trùng với user hiện tại
            const matchedCustomer = certInfo.customers.find(
                customer => customer.email === currentUserEmail
            );

            if (!matchedCustomer || !matchedCustomer.id) {
                toast.error('Bạn không có quyền sử dụng chứng thư số này');
                return;
            }

            // Lấy id của customer trùng email
            const customerIds = [matchedCustomer.id];

            // Gọi API xóa user hiện tại khỏi cert
            await certificateService.deleteCertificate(certificateId, customerIds);
            toast.success('Xóa chứng thư số thành công!');

            // Reload certificate list after successful deletion
            await loadCertificates();
        } catch (error) {
            console.error('❌ Lỗi khi xóa chứng thư số:', error);

            // Extract error message from different error formats
            let errorMessage = 'Không thể xóa chứng thư số. Vui lòng thử lại.';

            if (error.response?.data) {
                const errorData = error.response.data;
                errorMessage = errorData.message || errorData.error || errorData.data || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
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
                        alignItems: "stretch",
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
                        style={{ display: "flex", width: "35%" }}
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
                                margin: "0 10px 20px 10px",
                                padding: "10px 10px",
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
                                {currentCerts.map((c, index) => {
                                    const info = c.certInformation || "";
                                    const cnMatch = info.match(/CN=([^,]+)/);
                                    const cccdMatch = info.match(/UID=CCCD:([^,]+)/);
                                    const mstMatch = info.match(/UID=MST:([^,]+)/);

                                    const subject = cnMatch ? cnMatch[1] : "";
                                    const cccd = cccdMatch ? cccdMatch[1] : "";
                                    const mst = mstMatch ? mstMatch[1] : "";

                                    const statusText = c.status === 1 ? "Hoạt động" : "Không hoạt động";

                                    return (
                                        <tr key={index} className="document-row"
                                            onClick={() => handleOpenDetails(c.id)}
                                        >
                                            <td className="document-title-cell">{c.keystoreSerialNumber}</td>
                                            <td>{subject}</td>
                                            <td>{mst}</td>
                                            <td>{formatDate(c.keystoreDateStart)}</td>
                                            <td>{formatDate(c.keystoreDateEnd)}</td>
                                            <td>{statusText}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {/* ✅ Truyền ID và callbacks */}
                                                <CertificateActionMenu
                                                    certificateId={c.id}  // ✅ Chỉ truyền ID
                                                    certificateName={c.keyStoreFileName}  // Để hiển thị tên khi xóa
                                                    onViewDetails={() => handleOpenDetails(c.id)}
                                                    onAssignUsers={() => handleOpenAssign(c.id)}
                                                    onDelete={handleDeleteCert}
                                                    onUpdate={loadCertificates}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
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
            <UpdateCertificateModal
                open={openUpdate}
                certificateId={selectedCertId}
                onClose={() => setOpenUpdate(false)}
                onUpdated={loadCertificates}
            />

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
