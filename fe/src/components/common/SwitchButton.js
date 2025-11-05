import React from 'react';
import '../../styles/switchButton.css';

const SwitchButton = ({ checked, onChange, disabled = false }) => {
    return (
        <label className="switch">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange && onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className="slider"></span>
        </label>
    );
};

export default SwitchButton;

