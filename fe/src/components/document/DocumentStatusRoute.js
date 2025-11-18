import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Document from './document';

const STATUS_ROUTE_MAP = {
    draft: 0,
    processing: 1,
    complete: 2,
    fail: 3,
    validate: 4,
    waiting: 5
};

function DocumentStatusRoute() {
    const { filter } = useParams();

    const status = useMemo(() => {
        if (!filter) return 'all';
        return STATUS_ROUTE_MAP[filter] ?? 'all';
    }, [filter]);

    return <Document selectedStatus={status} />;
}

export default DocumentStatusRoute;

