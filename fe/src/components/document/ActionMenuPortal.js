// ActionMenuPortal.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export default function ActionMenuPortal({ children }) {
    // tạo 1 container cho portal chỉ 1 lần
    const el = React.useMemo(() => document.createElement("div"), []);

    useEffect(() => {
        // thêm vào body khi mount
        document.body.appendChild(el);

        // trả về cleanup khi unmount
        return () => {
            if (document.body.contains(el)) {
                document.body.removeChild(el);
            }
        };
    }, [el]);

    // đơn giản: render children vào el. Không đọc/ghi position ở đây.
    return ReactDOM.createPortal(children, el);
}
