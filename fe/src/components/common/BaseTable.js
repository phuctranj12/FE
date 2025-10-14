import React from 'react';
import '../../styles/table.css';

/*
  BaseTable
  Props:
  - columns: string[] (tiêu đề cột)
  - data: React.ReactNode[][] | any[] (mảng hàng; có thể là mảng giá trị theo thứ tự cột hoặc object)
  - rowRenderer?: (row: any, rowIndex: number) => React.ReactNode[] (tùy chọn để map dữ liệu phức tạp)
*/
export default function BaseTable({ columns = [], data = [], rowRenderer }) {
    const renderRow = (row, idx) => {
        if (rowRenderer) return rowRenderer(row, idx);
        if (Array.isArray(row)) return row;
        // Nếu là object: map theo thứ tự columns
        return columns.map((key) => row[key]);
    };

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => {
                        const cells = renderRow(row, i);
                        return (
                            <tr key={i}>
                                {cells.map((cell, j) => (
                                    <td key={j}>{cell}</td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}


