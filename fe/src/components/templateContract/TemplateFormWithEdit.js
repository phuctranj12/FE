import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TemplateForm from './TemplateForm';
import contractService from '../../api/contractService';

function TemplateFormWithEdit() {
    const { template_contract_id } = useParams();
    const navigate = useNavigate();
    const [editTemplate, setEditTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTemplate = async () => {
            if (!template_contract_id) {
                setError('Không tìm thấy ID mẫu tài liệu');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const response = await contractService.getTemplateContractById(template_contract_id);
                if (response?.code === 'SUCCESS' && response.data) {
                    setEditTemplate(response.data);
                } else {
                    throw new Error(response?.message || 'Không thể tải thông tin mẫu tài liệu');
                }
            } catch (err) {
                console.error('Error loading template for edit:', err);
                setError(err?.response?.data?.message || err?.message || 'Không thể tải thông tin mẫu tài liệu');
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [template_contract_id]);

    const handleBack = () => {
        navigate(`/main/contract-template/detail/${template_contract_id}`);
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin mẫu tài liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px'
            }}>
                <div style={{ color: '#d32f2f', fontSize: '18px', fontWeight: 'bold' }}>⚠ Lỗi</div>
                <p style={{ color: '#666', textAlign: 'center' }}>{error}</p>
                <button 
                    onClick={handleBack}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!editTemplate) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <p>Không tìm thấy thông tin mẫu tài liệu</p>
                <button 
                    onClick={handleBack}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    return <TemplateForm onBack={handleBack} editTemplate={editTemplate} />;
}

export default TemplateFormWithEdit;

