import React from 'react';
import '../../styles/documentProcessingFlow.css';

function DocumentProcessingFlowPanel({ onClose, workflowSteps = [] }) {
    return (
        <div className="document-processing-flow-overlay">
            <div className="document-processing-flow-panel">
                <div className="panel-header">
                    <h2 className="panel-title">Luồng xử lý tài liệu</h2>
                </div>
                <div className="panel-content">
                    {workflowSteps.map((step, index) => (
                        <div key={step.id || index} className="workflow-step-item">
                            <div className="step-user-info">
                                <div className="user-name-email">
                                    <span className="user-name">{step.name}</span>
                                    {step.email && <span className="user-email"> ({step.email})</span>}
                                </div>
                                {step.details && step.details.length > 0 && (
                                    <div className="user-details">
                                        {step.details.map((detail, detailIndex) => (
                                            <span key={detailIndex} className="detail-line">{detail}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="step-status-time">
                                <span className="step-status">{step.status}</span>
                                {step.timestamp && <span className="step-timestamp"> ({step.timestamp})</span>}
                            </div>
                            <div className="step-action">
                                {step.action_icon === 'envelope_circle_arrows' && (
                                    <div className="action-icon" title="Thao tác">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" stroke="#0B57D0" strokeWidth="1.5"/>
                                            <path d="M8 12L12 8L16 12" stroke="#0B57D0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 8V16" stroke="#0B57D0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="step-operations">
                                {step.show_operations && (
                                    <>
                                        {step.status === "Đã ký" ? (
                                            <button className="operation-btn sms-btn" title="Gửi SMS">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2 3H22C23.1 3 24 3.9 24 5V19C24 20.1 23.1 21 22 21H2C0.9 21 0 20.1 0 19V5C0 3.9 0.9 3 2 3ZM22 5H2V19H22V5Z" fill="#666"/>
                                                    <path d="M12 7L20 12L12 17L4 12L12 7Z" fill="#666"/>
                                                </svg>
                                                Gửi SMS
                                            </button>
                                        ) : (
                                            <button className="operation-btn change-signer-btn" title="Thay đổi người ký">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <circle cx="8.5" cy="7" r="4" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M20 8L23 11L20 14" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M17 11H23" stroke="#0B57D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Thay đổi người ký
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="panel-footer">
                    <button className="exit-button" onClick={onClose}>Thoát</button>
                </div>
            </div>
        </div>
    );
}

export default DocumentProcessingFlowPanel;
