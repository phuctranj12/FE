import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import documentService from "../../api/documentService";
import DocumentForm from "../createContract/DocumentForm";

export default function EditDocumentForm() {
    const { id, status } = useParams(); // lấy cả status
    const [contractData, setContractData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContractDetail();
    }, [id]);

    const loadContractDetail = async () => {
        try {
            const res = await documentService.getContractById(id);
            setContractData(res.data);
            console.log("Loaded contract data:", res.data);
        } catch (err) {
            console.error("Error load contract", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div>
            <h2>Chỉnh sửa tài liệu ({status})</h2>
            <DocumentForm
                isEdit={true}
                initialData={contractData}
            />
        </div>
    );
}
