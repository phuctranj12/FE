import React from 'react';
import { useLocation } from 'react-router-dom';
import CreatedDocument from './CreatedDocument';

const STATUS_ROUTE_MAP = {
    'wait-processing': 'cho-xu-ly',
    'processed': 'da-xu-ly',
    'shared': 'duoc-chia-se'
};

function CreatedDocumentRoute() {
    const location = useLocation();
    
    // Lấy status từ pathname
    // Ví dụ: /main/contract/receive/wait-processing -> wait-processing
    const pathParts = location.pathname.split('/');
    const routeKey = pathParts[pathParts.length - 1]; // Lấy phần cuối cùng của path
    
    const selectedStatus = STATUS_ROUTE_MAP[routeKey] || 'all';

    return <CreatedDocument selectedStatus={selectedStatus} />;
}

export default CreatedDocumentRoute;

