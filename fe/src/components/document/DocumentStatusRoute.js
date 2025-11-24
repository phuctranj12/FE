import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Document from './document';

const STATUS_ROUTE_MAP = {
    draft: 0,
    created: 10,
    processing: 20,
    signed: 30,
    liquidated: 40,
    rejected: 31,
    cancel: 32,
    "about-expire": 1,
    expire: 2,
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

