import React, { useMemo, useState, useRef, useEffect } from 'react';
import '../../styles/orgDropdown.css';

/*
  OrganizationDropDown
  Props:
  - organizations: Array<{ id: number|string, name: string, parent_id: number|null, [key:string]: any }>
  - placeholder?: string
  - value?: number|string|null           // selected organization id
  - onChange?: (org: any|null) => void   // return selected org object (or null)
*/
export default function OrganizationDropDown({ organizations = [], placeholder = 'Chọn tổ chức', value = null, onChange }) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(() => new Set());
    const boxRef = useRef(null);

    useEffect(() => {
        const onDocClick = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const byId = useMemo(() => {
        const m = new Map();
        organizations.forEach((o) => m.set(String(o.id), o));
        return m;
    }, [organizations]);

    const selected = value != null ? byId.get(String(value)) : null;

    const treeMap = useMemo(() => {
        const map = new Map();
        organizations.forEach((o) => {
            const key = o.parent_id == null ? 'root' : String(o.parent_id);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(o);
        });
        return map;
    }, [organizations]);

    const toggle = (id) => {
        const s = new Set(expanded);
        if (s.has(id)) s.delete(id); else s.add(id);
        setExpanded(s);
    };

    const handleSelect = (org) => {
        onChange && onChange(org || null);
        setOpen(false);
    };

    const renderNodes = (nodes, depth = 0) => {
        return (nodes || []).map((node) => {
            const children = treeMap.get(String(node.id)) || [];
            const hasChildren = children.length > 0;
            const isExpanded = expanded.has(node.id);
            const onRowClick = (e) => {
                e.stopPropagation();
                // Cha và lá đều có thể chọn; mở/đóng chỉ khi bấm icon
                handleSelect(node);
            };
            return (
                <div key={node.id} className="org-item">
                    <div className="org-row" onClick={onRowClick}>
                        <span className="tree-indent" style={{ ['--indent']: `${depth * 16}px` }} />
                        {hasChildren && (
                            <button
                                type="button"
                                className="expand-btn small"
                                onClick={(e) => { e.stopPropagation(); toggle(node.id); }}
                            >
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        )}
                        <span className="org-name">{node.name}</span>
                    </div>
                    {isExpanded && children.length > 0 && (
                        <div className="org-children">
                            {renderNodes(children, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="search-section search-section--filled org-dropdown" ref={boxRef}>
            <button type="button" className="org-input" onClick={() => setOpen(!open)}>
                <span className="org-input-text">{selected ? selected.name : placeholder}</span>
                <span className="org-caret">▾</span>
            </button>
            {open && (
                <div className="org-panel">
                    <div className="org-list">
                        {renderNodes(treeMap.get('root') || [], 0)}
                    </div>
                </div>
            )}
        </div>
    );
}


