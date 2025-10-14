import React from 'react';
import '../../styles/searchBar.css';

/*
  SearchBar component (controlled)
  Props:
  - placeholder: string
  - value?: string
  - onChange?: (v: string) => void
  - type?: string
*/
export default function SearchBar({ placeholder = '', value = '', onChange, type = 'text' }) {
    return (
        <div className="search-section search-section--filled">
            <div className="search-inputs" style={{ flex: 1 }}>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange && onChange(e.target.value)}
                />
            </div>
        </div>
    );
}


