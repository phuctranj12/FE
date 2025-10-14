import React from 'react';
import '../../styles/button.css';

/*
  Reusable Button
  Props:
  - outlineColor: string (CSS color)
  - backgroundColor: string (CSS color)
  - icon?: ReactNode (nullable)
  - text: string
  - onClick?: () => void
*/
export default function Button({ outlineColor = '#0B57D0', backgroundColor = 'transparent', icon = null, text = '', onClick }) {
    const style = {
        borderColor: outlineColor,
        backgroundColor,
        color: backgroundColor === 'transparent' ? outlineColor : '#ffffff',
    };

    return (
        <button className="btn-outline-rounded" style={style} onClick={onClick}>
            {icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{text}</span>
        </button>
    );
}


