import React, { useState, useRef, useEffect } from 'react';
import '../../styles/orgSelect.css';

/*
  OrganizationSelect - Simple dropdown with search
  Props:
  - organizations: Array<{ id: number|string, name: string, [key:string]: any }>
  - placeholder?: string
  - value?: number|string|null           // selected organization id
  - onChange?: (org: any|null) => void   // return selected org object (or null)
*/
export default function OrganizationSelect({ organizations = [], placeholder = 'Chọn tổ chức', value = null, onChange }) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const boxRef = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const selected = organizations.find(org => org.id === value);

    const filteredOrgs = organizations.filter(org => 
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (org) => {
        onChange && onChange(org || null);
        setOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange && onChange(null);
    };

    const handleOpen = () => {
        if (boxRef.current) {
            const rect = boxRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: rect.left
            });
        }
        setOpen(!open);
    };

    return (
        <div className="org-select-container" ref={boxRef}>
            <button type="button" className="org-select-input" onClick={handleOpen}>
                <span className="org-select-text">{selected ? selected.name : placeholder}</span>
                <div className="org-select-actions">
                    {selected && (
                        <button 
                            type="button" 
                            className="org-clear-btn" 
                            onClick={handleClear}
                            title="Xóa lựa chọn"
                        >
                            ×
                        </button>
                    )}
                    <span className="org-select-caret">▾</span>
                </div>
            </button>
            
            {open && (
                <div className="org-select-panel" style={{ top: position.top, left: position.left }}>
                    <div className="org-search">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tổ chức..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="org-list">
                        {filteredOrgs.length > 0 ? (
                            filteredOrgs.map((org) => (
                                <div 
                                    key={org.id} 
                                    className="org-item"
                                    onClick={() => handleSelect(org)}
                                >
                                    {org.name}
                                </div>
                            ))
                        ) : (
                            <div className="org-no-results">Không tìm thấy tổ chức</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
