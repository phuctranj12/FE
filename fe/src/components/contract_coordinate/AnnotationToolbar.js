import React from 'react';
import '../../styles/annotationToolbar.css';

/**
 * AnnotationToolbar Component
 * 
 * A reusable toolbar component for PDF annotation tools.
 * Provides buttons for drawing tools, undo/redo, and eraser functionality.
 * 
 * Props:
 * - currentTool: string - The currently selected tool ('line', 'freehand', 'rectangle', 'text', 'eraser')
 * - onSelectTool: function(tool) - Callback when a tool is selected
 * - onUndo: function() - Callback for undo action
 * - onRedo: function() - Callback for redo action
 * - onErase: function() - Callback for erase action
 * - canUndo: boolean - Whether undo is available
 * - canRedo: boolean - Whether redo is available
 */
function AnnotationToolbar({ 
    currentTool, 
    onSelectTool, 
    onUndo, 
    onRedo, 
    onErase,
    canUndo = false,
    canRedo = false
}) {
    const tools = [
        { id: 'line', label: 'Đường thẳng', icon: '—' },
        { id: 'freehand', label: 'Vẽ tự do', icon: '✏️' },
        { id: 'rectangle', label: 'Hình chữ nhật', icon: '▭' },
        { id: 'text', label: 'Văn bản', icon: 'T' },
        { id: 'eraser', label: 'Xóa', icon: '🗑️' }
    ];

    return (
        <div className="annotation-toolbar">
            {/* History Controls */}
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <span className="btn-icon">↶</span>
                    <span className="btn-label">Hoàn tác</span>
                </button>
                <button
                    className="toolbar-btn"
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Làm lại (Ctrl+Y)"
                >
                    <span className="btn-icon">↷</span>
                    <span className="btn-label">Làm lại</span>
                </button>
            </div>

            {/* Drawing Tools */}
            <div className="toolbar-group">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        className={`toolbar-btn tool-btn ${currentTool === tool.id ? 'active' : ''}`}
                        onClick={() => onSelectTool(tool.id)}
                        title={tool.label}
                    >
                        <span className="btn-icon">{tool.icon}</span>
                        <span className="btn-label">{tool.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default AnnotationToolbar;

