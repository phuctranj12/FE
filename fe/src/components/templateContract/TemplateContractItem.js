import React from "react";
import "../../styles/templateContractItem.css";
import TemplateActionMenu from "./TemplateActionMenu";

function TemplateContractItem({ 
    contract, 
    onClick, 
    isShared = false,
    onEdit, 
    onBatchCreate, 
    onSingleCreate, 
    onStopPublish, 
    onShare, 
    onCopy, 
    onCreateWithFlow, 
    onDelete,
    onDownload
}) {
    const {
        id,
        name,
        contractExpireTime,
        organization_name,
        customer_name,
        templateId,
        partyA,
        partyB,
        contractNo,
        participants
    } = contract;

    // Format the data for display
    const displayName = templateId || name || `MẪU${id}`;
    // Lấy name của participant đầu tiên, nếu không có thì fallback về cách cũ
    const displayPartyA = (participants && participants.length > 0 && participants[0]?.name) 
        ? participants[0].name 
        : (organization_name || partyA);
    const displayPartyB = customer_name || partyB;
    const displayCode = contractNo || `Contract No. ${id}`;
    const displayDate = (contractExpireTime ? new Date(contractExpireTime).toLocaleDateString('vi-VN') : '');

    return (
        <div className="template-contract-item" onClick={onClick}>
            <div className="contract-icon-wrapper">
                <svg 
                    className="contract-icon" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none"
                >
                    <path 
                        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" 
                        stroke="url(#gradient)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                    <polyline 
                        points="14 2 14 8 20 8" 
                        stroke="url(#gradient)" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                    <line 
                        x1="8" 
                        y1="12" 
                        x2="16" 
                        y2="12" 
                        stroke="url(#gradient)" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                    />
                    <line 
                        x1="8" 
                        y1="16" 
                        x2="16" 
                        y2="16" 
                        stroke="url(#gradient)" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                    />
                    <line 
                        x1="8" 
                        y1="20" 
                        x2="12" 
                        y2="20" 
                        stroke="url(#gradient)" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0B57D0" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="contract-details">
                <div className="contract-title">{displayName}</div>
                <div className="contract-party">
                    <span className="party-label">Bên A :</span> {displayPartyA}
                </div>
                {displayPartyB && displayPartyB.trim() && (
                    <div className="contract-party">
                        <span className="party-label">Bên B :</span> {displayPartyB}
                    </div>
                )}
            </div>

            <div className="contract-code">{displayCode}</div>

            <div className="contract-date">
                <svg 
                    className="date-icon" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#9CA3AF" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>{displayDate}</span>
            </div>

            <TemplateActionMenu
                template={contract}
                isShared={isShared}
                onEdit={onEdit}
                onBatchCreate={onBatchCreate}
                onSingleCreate={onSingleCreate}
                onStopPublish={onStopPublish}
                onShare={onShare}
                onCopy={onCopy}
                onCreateWithFlow={onCreateWithFlow}
                onDelete={onDelete}
                onDownload={onDownload}
            />
        </div>
    );
}

export default TemplateContractItem;

