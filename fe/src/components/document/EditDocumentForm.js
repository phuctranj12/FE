import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import documentService from "../../api/documentService";
// import FormContract from "./FormContract";  // dùng lại form tạo hợp đồng

export default function EditDocumentForm() {
    const { id } = useParams();
    const [contractData, setContractData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContractDetail();
    }, []);

    const loadContractDetail = async () => {
        try {
            const res = await documentService.getContractById(id);
            setContractData(res.data);
        } catch (err) {
            console.error("Error load contract", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (<div>Chức năng chỉnh sửa tài liệu đang được phát triển.</div>
        // <FormContract
        //     isEdit={true}
        //     initialData={contractData}
        // />
    );
}
