import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export default function ActionMenuPortal({ children }) {
    const el = React.useMemo(() => document.createElement("div"), []);

    useEffect(() => {
        document.body.appendChild(el);
        return () => {
            if (document.body.contains(el)) {
                document.body.removeChild(el);
            }
        };
    }, [el]);

    return ReactDOM.createPortal(children, el);
}