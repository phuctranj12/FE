# Logic Vẽ Lên PDF Khi User Từ Chối Hợp Đồng

## Mục lục
- [I. Tổng Quan](#i-tổng-quan)
- [II. Thư Viện Sử Dụng](#ii-thư-viện-sử-dụng)
- [III. Giao Diện Từ Chối](#iii-giao-diện-từ-chối)
- [IV. Các Công Cụ Vẽ](#iv-các-công-cụ-vẽ)
- [V. Logic Vẽ Trên Canvas](#v-logic-vẽ-trên-canvas)
- [VI. Lưu PDF Đã Chú Thích](#vi-lưu-pdf-đã-chú-thích)
- [VII. Hệ Tọa Độ](#vii-hệ-tọa-độ)
- [VIII. Tổng Kết](#viii-tổng-kết)

---

## I. Tổng Quan

### 1. Mục Đích

Khi user từ chối hợp đồng, họ có thể:
- **Vẽ chú thích** trực tiếp lên PDF để đánh dấu các vấn đề
- **Nhập lý do từ chối** bằng text
- Hệ thống sẽ **lưu PDF đã chú thích** và **thay đổi trạng thái hợp đồng** sang REJECTED (31)

### 2. Component Chính

**File**: `src/components/contract_coordinate/RejectReviewDialog.js`

**Props**:
```javascript
{
  open: boolean,              // Hiển thị dialog
  onClose: function(),        // Đóng dialog
  contractId: number,         // ID hợp đồng
  recipientId: number,        // ID người xử lý
  documentMeta: {             // Thông tin tài liệu
    id: number,
    name: string,
    presignedUrl: string,
    totalPages: number
  },
  onRejected: function()      // Callback khi từ chối thành công
}
```

---

## II. Thư Viện Sử Dụng

### 1. Thư Viện Bên Ngoài

#### **A. pdf-lib** ⭐ (Quan trọng nhất)

**Mục đích**: Chỉnh sửa và vẽ lên PDF

```javascript
import { PDFDocument, rgb } from 'pdf-lib';
```

**Chức năng**:
- Load PDF từ bytes
- Vẽ đường thẳng, hình chữ nhật, text lên PDF
- Export PDF đã chỉnh sửa

**Cài đặt**:
```bash
npm install pdf-lib
```

**Website**: https://pdf-lib.js.org/


#### **B. react-pdf** ⭐

**Mục đích**: Hiển thị PDF trong React

```javascript
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
```

**Chức năng**:
- Render PDF pages
- Hỗ trợ zoom, pagination
- Cung cấp canvas để overlay

**Cài đặt**:
```bash
npm install react-pdf
```

**Website**: https://github.com/wojtekmaj/react-pdf

**Worker Configuration**:
```javascript
// Configure PDF.js worker - dùng local worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```

#### **C. React Hooks**

**Thư viện built-in của React**:
```javascript
import React, { useState, useRef, useEffect } from 'react';
```

**Không cần cài đặt thêm** - đã có sẵn trong React.

### 2. API Services (Tự Viết)

```javascript
import contractService from '../../api/contractService';
```

**Các API sử dụng**:
- `uploadDocument(file)` - Upload PDF lên MinIO
- `createDocument(data)` - Tạo document record
- `changeContractStatus(contractId, status, reason)` - Thay đổi trạng thái hợp đồng

### 3. Tổng Kết Thư Viện

| Thư viện | Loại | Mục đích | Cần cài đặt |
|----------|------|----------|-------------|
| **pdf-lib** | External | Chỉnh sửa PDF | ✅ Có |
| **react-pdf** | External | Hiển thị PDF | ✅ Có |
| **React** | Built-in | UI Framework | ❌ Không |
| **contractService** | Internal | API calls | ❌ Không |

---

## III. Giao Diện Từ Chối

### 1. Layout

```
┌─────────────────────────────────────────────────────────────┐
│              TỪ CHỐI XEM XÉT HỢP ĐỒNG                  [✕]  │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│  GHI CHÚ CHI TIẾT            │  LÝ DO TỪ CHỐI              │
│                              │                              │
│  [Toolbar: ✏️ 🗑️ ↶ ↷]       │  ┌────────────────────────┐ │
│  [Trang 1/5]  [‹ Trước] [Sau ›] │                        │ │
│                              │  │  Nhập lý do từ chối   │ │
│  ┌────────────────────────┐  │  │  ...                   │ │
│  │                        │  │  │                        │ │
│  │   PDF Page 1           │  │  └────────────────────────┘ │
│  │   [Canvas Overlay]     │  │                              │
│  │                        │  │  Hướng dẫn:                 │
│  │   ✏️ Vẽ chú thích      │  │  - Vẽ đánh dấu trên PDF    │
│  │                        │  │  - Nhập lý do cụ thể       │
│  ├────────────────────────┤  │  - Xác nhận từ chối        │
│  │   PDF Page 2           │  │                              │
│  │   [Canvas Overlay]     │  │  [Đang xử lý...]           │
│  │                        │  │                              │
│  └────────────────────────┘  │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
│              [Hủy]  [Xác nhận từ chối]                      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Cấu Trúc Component

```javascript
function RejectReviewDialog({ open, onClose, contractId, ... }) {
  // State cho drawing tools
  const [currentTool, setCurrentTool] = useState(null);
  const [strokes, setStrokes] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  // State cho PDF viewing
  const [numPages, setNumPages] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [activePage, setActivePage] = useState(1);
  
  // State cho drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const canvasRefs = useRef({});
  
  // State cho rejection
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="reject-dialog-overlay">
      {/* Header */}
      {/* Main Content: PDF + Reason */}
      {/* Footer: Actions */}
    </div>
  );
}
```

---

## IV. Các Công Cụ Vẽ

### 1. Danh Sách Tools

**File**: `src/components/contract_coordinate/AnnotationToolbar.js`

```javascript
const tools = [
  { id: 'line', label: 'Đường thẳng', icon: '—' },
  { id: 'freehand', label: 'Vẽ tự do', icon: '✏️' },
  { id: 'rectangle', label: 'Hình chữ nhật', icon: '▭' },
  { id: 'text', label: 'Văn bản', icon: 'T' },
  { id: 'eraser', label: 'Xóa', icon: '🗑️' }
];
```

**Minh họa**:

```
┌─────────────────────────────────────────────────────┐
│  [↶ Hoàn tác]  [↷ Làm lại]  │  [— Đường thẳng]     │
│                              │  [✏️ Vẽ tự do]       │
│                              │  [▭ Hình chữ nhật]   │
│                              │  [T Văn bản]         │
│                              │  [🗑️ Xóa]            │
└─────────────────────────────────────────────────────┘
```

### 2. Cấu Trúc Stroke (Nét Vẽ)

```javascript
const stroke = {
  id: 1234567890,           // Timestamp làm ID duy nhất
  type: 'freehand',         // Loại: line, freehand, rectangle, text, eraser
  page: 1,                  // Trang PDF (1-indexed)
  points: [                 // Danh sách điểm tọa độ
    { x: 100, y: 200 },
    { x: 105, y: 205 },
    { x: 110, y: 210 },
    // ...
  ],
  color: rgb(1, 0, 0),      // Màu đỏ (pdf-lib format)
  text: 'Ghi chú'           // Chỉ có khi type = 'text'
};
```

### 3. Undo/Redo Stack

```javascript
// Undo: Di chuyển stroke từ strokes → undoStack
const handleUndo = () => {
  if (strokes.length === 0) return;
  
  const lastStroke = strokes[strokes.length - 1];
  setUndoStack([...undoStack, lastStroke]);
  setStrokes(strokes.slice(0, -1));
  setRedoStack([]); // Clear redo
};

// Redo: Di chuyển stroke từ undoStack → strokes
const handleRedo = () => {
  if (undoStack.length === 0) return;
  
  const lastUndo = undoStack[undoStack.length - 1];
  setStrokes([...strokes, lastUndo]);
  setUndoStack(undoStack.slice(0, -1));
};
```

**Minh họa**:

```
Trạng thái ban đầu:
strokes: [A, B, C]
undoStack: []
redoStack: []

Sau khi Undo:
strokes: [A, B]
undoStack: [C]
redoStack: []

Sau khi Redo:
strokes: [A, B, C]
undoStack: []
redoStack: []

Sau khi vẽ stroke mới D:
strokes: [A, B, C, D]
undoStack: []
redoStack: [] ← Clear khi có action mới
```

---

## V. Logic Vẽ Trên Canvas

### 1. Cấu Trúc Canvas Overlay

**Mỗi trang PDF có 1 canvas overlay riêng**:

```javascript
<Document file={documentMeta.presignedUrl}>
  {Array.from({ length: numPages }, (_, index) => {
    const pageNumber = index + 1;
    return (
      <div key={pageNumber} className="reject-pdf-page-wrapper">
        {/* PDF Page - Sử dụng react-pdf */}
        <Page
          pageNumber={pageNumber}
          scale={pdfScale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
        
        {/* Canvas overlay - Vẽ bằng HTML5 Canvas */}
        <canvas
          ref={(el) => canvasRefs.current[pageNumber] = el}
          className="annotation-canvas"
          width={595 * pdfScale}   // A4 width
          height={842 * pdfScale}  // A4 height
          onMouseDown={(e) => handleMouseDown(e, pageNumber)}
          onMouseMove={(e) => handleMouseMove(e, pageNumber)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    );
  })}
</Document>
```

**Minh họa**:

```
┌─────────────────────────┐
│  PDF Page (react-pdf)   │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   PDF Content     │  │
│  │                   │  │
│  └───────────────────┘  │
│         ↑               │
│         │ Overlay       │
│  ┌───────────────────┐  │
│  │  Canvas (vẽ)      │  │ ← Trong suốt, nằm trên PDF
│  │  ✏️ Strokes       │  │
│  └───────────────────┘  │
└─────────────────────────┘
```


### 2. Quy Trình Vẽ (3 Giai Đoạn)

#### **Giai đoạn 1: Mouse Down (Bắt đầu vẽ)**

```javascript
handleMouseDown(e, pageNumber) {
  if (!currentTool) return; // Chưa chọn tool
  
  // Lấy vị trí chuột trên canvas (tính theo scale)
  const pos = getMousePos(e, pageNumber);
  
  // Set trang hiện tại
  setActivePage(pageNumber);
  
  // ═══════════════════════════════════════════════════
  // XỬ LÝ TOOL ERASER (Xóa)
  // ═══════════════════════════════════════════════════
  if (currentTool === 'eraser') {
    // Tìm stroke tại vị trí click
    const strokeToRemove = findStrokeAtPosition(pos);
    if (strokeToRemove) {
      // Xóa stroke khỏi danh sách
      setStrokes(prev => prev.filter(s => s.id !== strokeToRemove.id));
      // Lưu vào undo stack
      setUndoStack(prev => [...prev, strokeToRemove]);
      setRedoStack([]);
    }
    return;
  }
  
  // ═══════════════════════════════════════════════════
  // TẠO STROKE MỚI
  // ═══════════════════════════════════════════════════
  const newStroke = {
    id: Date.now(),
    type: currentTool,
    page: pageNumber,
    points: [pos],
    color: rgb(1, 0, 0) // Màu đỏ
  };
  
  // ═══════════════════════════════════════════════════
  // XỬ LÝ TOOL TEXT (Nhập text ngay)
  // ═══════════════════════════════════════════════════
  if (currentTool === 'text') {
    const text = prompt('Nhập văn bản:');
    if (text) {
      newStroke.text = text;
      setStrokes([...strokes, newStroke]);
      setRedoStack([]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
    return;
  }
  
  // ═══════════════════════════════════════════════════
  // BẮT ĐẦU VẼ (line, freehand, rectangle)
  // ═══════════════════════════════════════════════════
  setCurrentStroke(newStroke);
  setIsDrawing(true);
}

// Hàm lấy vị trí chuột trên canvas
const getMousePos = (e, pageNumber) => {
  const canvas = canvasRefs.current[pageNumber];
  if (!canvas) return { x: 0, y: 0 };
  
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / pdfScale,
    y: (e.clientY - rect.top) / pdfScale
  };
};
```

#### **Giai đoạn 2: Mouse Move (Đang vẽ)**

```javascript
handleMouseMove(e, pageNumber) {
  if (!isDrawing || !currentStroke) return;
  if (currentTool === 'text') return; // Text không cần move
  
  const pos = getMousePos(e, pageNumber);
  
  // ═══════════════════════════════════════════════════
  // VẼ TỰ DO (Freehand)
  // ═══════════════════════════════════════════════════
  if (currentTool === 'freehand') {
    // Thêm điểm mới vào stroke
    setCurrentStroke({
      ...currentStroke,
      points: [...currentStroke.points, pos]
    });
  }
  
  // ═══════════════════════════════════════════════════
  // ĐƯỜNG THẲNG / HÌNH CHỮ NHẬT
  // ═══════════════════════════════════════════════════
  else if (currentTool === 'line' || currentTool === 'rectangle') {
    // Chỉ cần 2 điểm: start và end
    setCurrentStroke({
      ...currentStroke,
      points: [currentStroke.points[0], pos]
    });
  }
}
```

**Minh họa Freehand vs Line/Rectangle**:

```
FREEHAND (nhiều điểm):
points: [
  { x: 100, y: 100 },  ← Start
  { x: 105, y: 102 },
  { x: 110, y: 105 },
  { x: 115, y: 108 },
  { x: 120, y: 110 }   ← End
]

LINE/RECTANGLE (2 điểm):
points: [
  { x: 100, y: 100 },  ← Start
  { x: 200, y: 150 }   ← End (cập nhật liên tục khi move)
]
```

#### **Giai đoạn 3: Mouse Up (Kết thúc vẽ)**

```javascript
handleMouseUp() {
  if (!isDrawing || !currentStroke) return;
  
  // Lưu stroke vào danh sách
  setStrokes([...strokes, currentStroke]);
  
  // Reset trạng thái
  setCurrentStroke(null);
  setIsDrawing(false);
  
  // Clear redo stack (vì có action mới)
  setRedoStack([]);
}
```

### 3. Render Strokes Lên Canvas

**Sử dụng HTML5 Canvas API** (không dùng thư viện ngoài):

```javascript
// Auto re-render khi strokes thay đổi
useEffect(() => {
  const refs = canvasRefs.current || {};
  
  // Vẽ lại từng canvas (từng trang)
  Object.keys(refs).forEach((pageKey) => {
    const pageNum = Number(pageKey);
    const canvas = refs[pageKey];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vẽ tất cả strokes của trang này
    const pageStrokes = strokes.filter(s => s.page === pageNum);
    pageStrokes.forEach(stroke => drawStroke(ctx, stroke));

    // Vẽ stroke đang vẽ (nếu có)
    if (currentStroke && currentStroke.page === pageNum) {
      drawStroke(ctx, currentStroke);
    }
  });
}, [strokes, currentStroke, pdfScale]);
```

**Hàm vẽ 1 stroke**:

```javascript
const drawStroke = (ctx, stroke) => {
  // Cấu hình style
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'red';
  ctx.lineWidth = 2 * pdfScale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Scale points theo pdfScale
  const points = stroke.points.map(p => ({
    x: p.x * pdfScale,
    y: p.y * pdfScale
  }));
  
  // ═══════════════════════════════════════════════════
  // VẼ FREEHAND (Đường cong)
  // ═══════════════════════════════════════════════════
  if (stroke.type === 'freehand') {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }
  
  // ═══════════════════════════════════════════════════
  // VẼ LINE (Đường thẳng)
  // ═══════════════════════════════════════════════════
  else if (stroke.type === 'line') {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
  }
  
  // ═══════════════════════════════════════════════════
  // VẼ RECTANGLE (Hình chữ nhật)
  // ═══════════════════════════════════════════════════
  else if (stroke.type === 'rectangle') {
    if (points.length < 2) return;
    
    const width = points[1].x - points[0].x;
    const height = points[1].y - points[0].y;
    ctx.strokeRect(points[0].x, points[0].y, width, height);
  }
  
  // ═══════════════════════════════════════════════════
  // VẼ TEXT (Văn bản)
  // ═══════════════════════════════════════════════════
  else if (stroke.type === 'text' && stroke.text) {
    ctx.font = `${14 * pdfScale}px Arial`;
    ctx.fillText(stroke.text, points[0].x, points[0].y);
  }
};
```

**Minh họa các loại stroke**:

```
FREEHAND:
  ╭─────╮
 ╱       ╲
╱         ╲
           ╲

LINE:
  ●─────────●

RECTANGLE:
  ┌─────────┐
  │         │
  └─────────┘

TEXT:
  ● Ghi chú
```

---

## VI. Lưu PDF Đã Chú Thích

### 1. Quy Trình Tổng Thể

```javascript
handleSubmit = async () => {
  // ═══════════════════════════════════════════════════
  // BƯỚC 1: VALIDATE
  // ═══════════════════════════════════════════════════
  if (!reason.trim()) {
    setReasonError('Vui lòng nhập lý do từ chối');
    return;
  }
  
  setReasonError('');
  setLoading(true);
  
  try {
    // ═══════════════════════════════════════════════════
    // BƯỚC 2: LOAD PDF GỐC
    // ═══════════════════════════════════════════════════
    setUploadProgress('Đang tải PDF gốc...');
    
    const pdfBytes = await fetch(documentMeta.presignedUrl)
      .then(res => res.arrayBuffer());
    
    // Sử dụng pdf-lib để load PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 3: VẼ ANNOTATIONS LÊN PDF
    // ═══════════════════════════════════════════════════
    setUploadProgress('Đang thêm chú thích...');
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = pdfDoc.getPages()[pageNum - 1];
      const { width, height } = page.getSize();
      
      // Lấy strokes của trang này
      const pageStrokes = strokes.filter(s => s.page === pageNum);
      
      // Vẽ từng stroke lên PDF
      for (const stroke of pageStrokes) {
        await drawStrokeOnPDF(page, stroke, height);
      }
    }
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 4: EXPORT PDF
    // ═══════════════════════════════════════════════════
    setUploadProgress('Đang xuất PDF...');
    
    const annotatedPdfBytes = await pdfDoc.save();
    const annotatedPdfBlob = new Blob([annotatedPdfBytes], { 
      type: 'application/pdf' 
    });
    const annotatedPdfFile = new File(
      [annotatedPdfBlob], 
      'annotated.pdf', 
      { type: 'application/pdf' }
    );
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 5: UPLOAD LÊN MINIO
    // ═══════════════════════════════════════════════════
    setUploadProgress('Đang tải lên PDF đã chú thích...');
    
    const uploadResponse = await contractService.uploadDocument(
      annotatedPdfFile
    );
    
    if (uploadResponse?.code !== 'SUCCESS') {
      throw new Error('Tải lên tài liệu thất bại');
    }
    
    const { path, fileName } = uploadResponse.data || {};
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 6: TẠO DOCUMENT RECORD
    // ═══════════════════════════════════════════════════
    const createDocResponse = await contractService.createDocument({
      name: `Rejection_${documentMeta.name}`,
      contractId: contractId,
      type: 9,        // Type 9: Rejection annotated document
      fileName: fileName,
      path: path,
      status: 1
    });
    
    if (createDocResponse?.code !== 'SUCCESS') {
      throw new Error('Tạo bản ghi tài liệu thất bại');
    }
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 7: THAY ĐỔI TRẠNG THÁI HỢP ĐỒNG
    // ═══════════════════════════════════════════════════
    setUploadProgress('Đang xử lý từ chối...');
    
    const rejectResponse = await contractService.changeContractStatus(
      contractId,
      31,     // REJECTED status
      reason  // Lý do từ chối
    );
    
    if (rejectResponse?.code !== 'SUCCESS') {
      throw new Error(
        rejectResponse?.message || 'Từ chối hợp đồng thất bại'
      );
    }
    
    // ═══════════════════════════════════════════════════
    // BƯỚC 8: THÀNH CÔNG
    // ═══════════════════════════════════════════════════
    showToast('Từ chối hợp đồng thành công!', 'success');
    
    setTimeout(() => {
      onRejected();
      onClose();
    }, 1200);
    
  } catch (error) {
    console.error('Error submitting rejection:', error);
    showToast(
      error.message || 'Có lỗi xảy ra khi xử lý từ chối', 
      'error'
    );
  } finally {
    setLoading(false);
    setUploadProgress('');
  }
};
```


### 2. Vẽ Stroke Lên PDF (Sử dụng pdf-lib)

```javascript
const drawStrokeOnPDF = async (page, stroke, pageHeight) => {
  // ═══════════════════════════════════════════════════
  // VẼ FREEHAND (Đường cong)
  // ═══════════════════════════════════════════════════
  if (stroke.type === 'freehand') {
    // Vẽ bằng nhiều đoạn thẳng nối liền
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p1 = stroke.points[i];
      const p2 = stroke.points[i + 1];
      
      page.drawLine({
        start: { 
          x: p1.x, 
          y: pageHeight - p1.y  // Flip Y coordinate
        },
        end: { 
          x: p2.x, 
          y: pageHeight - p2.y 
        },
        thickness: 2,
        color: rgb(1, 0, 0)  // Red
      });
    }
  }
  
  // ═══════════════════════════════════════════════════
  // VẼ LINE (Đường thẳng)
  // ═══════════════════════════════════════════════════
  else if (stroke.type === 'line' && stroke.points.length >= 2) {
    const p1 = stroke.points[0];
    const p2 = stroke.points[1];
    
    page.drawLine({
      start: { 
        x: p1.x, 
        y: pageHeight - p1.y 
      },
      end: { 
        x: p2.x, 
        y: pageHeight - p2.y 
      },
      thickness: 2,
      color: rgb(1, 0, 0)
    });
  }
  
  // ═══════════════════════════════════════════════════
  // VẼ RECTANGLE (Hình chữ nhật)
  // ═══════════════════════════════════════════════════
  else if (stroke.type === 'rectangle' && stroke.points.length >= 2) {
    const p1 = stroke.points[0];
    const p2 = stroke.points[1];
    
    const rectWidth = Math.abs(p2.x - p1.x);
    const rectHeight = Math.abs(p2.y - p1.y);
    
    page.drawRectangle({
      x: Math.min(p1.x, p2.x),
      y: pageHeight - Math.max(p1.y, p2.y),  // Flip Y
      width: rectWidth,
      height: rectHeight,
      borderColor: rgb(1, 0, 0),
      borderWidth: 2
    });
  }
  
  // ═══════════════════════════════════════════════════
  // VẼ TEXT (Văn bản)
  // ═══════════════════════════════════════════════════
  else if (stroke.type === 'text' && stroke.text) {
    const p = stroke.points[0];
    
    page.drawText(stroke.text, {
      x: p.x,
      y: pageHeight - p.y,  // Flip Y
      size: 14,
      color: rgb(1, 0, 0)
    });
  }
};
```

### 3. Document Types

| Type | Constant | Mô tả |
|------|----------|-------|
| 1 | FILE_ORIGINAL | File gốc |
| 2 | FILE_SIGNED | File đã ký |
| 3 | FILE_ATTACHMENT | File đính kèm |
| **9** | **FILE_REJECTION_ANNOTATED** | **File rejection đã chú thích** |

### 4. Contract Status

| Status | Constant | Mô tả |
|--------|----------|-------|
| 0 | DRAFT | Nháp |
| 10 | CREATED | Đã tạo |
| 20 | PROCESSING | Đang xử lý |
| 30 | SIGNED | Hoàn thành |
| **31** | **REJECTED** | **Từ chối** |
| 32 | CANCEL | Hủy bỏ |
| 40 | LIQUIDATED | Thanh lý |

---

## VII. Hệ Tọa Độ

### 1. Sự Khác Biệt Giữa Canvas và PDF

#### **Canvas Coordinate System** (HTML5 Canvas)

```
(0,0) ────────────────► X
  │
  │
  │
  ▼
  Y
```

- **Gốc tọa độ**: Góc trên bên trái
- **Trục X**: Tăng sang phải
- **Trục Y**: Tăng xuống dưới

#### **PDF Coordinate System** (pdf-lib)

```
  Y
  ▲
  │
  │
  │
(0,0) ────────────────► X
```

- **Gốc tọa độ**: Góc dưới bên trái
- **Trục X**: Tăng sang phải
- **Trục Y**: Tăng lên trên

### 2. Chuyển Đổi Tọa Độ

**Công thức**:
```javascript
// Canvas → PDF
pdfY = pageHeight - canvasY

// PDF → Canvas
canvasY = pageHeight - pdfY
```

**Ví dụ**:

```
Page height = 842px (A4)

Canvas point: (100, 200)
→ PDF point: (100, 842 - 200) = (100, 642)

Canvas point: (100, 700)
→ PDF point: (100, 842 - 700) = (100, 142)
```

**Minh họa**:

```
CANVAS:                      PDF:
(0,0) ──────► X              Y ▲
  │                            │
  │ (100, 200) ●               │ (100, 642) ●
  │                            │
  │                            │
  │                            │
  │ (100, 700) ●               │ (100, 142) ●
  ▼                            │
  Y                          (0,0) ──────► X
```

### 3. Scale Factor

**Canvas hiển thị** có thể zoom in/out:

```javascript
// Canvas size
const canvasWidth = 595 * pdfScale;   // A4 width
const canvasHeight = 842 * pdfScale;  // A4 height

// Khi vẽ lên canvas
const displayX = x * pdfScale;
const displayY = y * pdfScale;

// Khi lưu vào PDF (không scale)
const pdfX = x;  // Giữ nguyên
const pdfY = pageHeight - y;  // Chỉ flip Y
```

**Ví dụ**:

```
pdfScale = 1.0 (100%):
Canvas: 595 x 842
Point: (100, 200) → Display: (100, 200)

pdfScale = 1.5 (150%):
Canvas: 892.5 x 1263
Point: (100, 200) → Display: (150, 300)

Nhưng khi lưu vào PDF:
→ Luôn dùng (100, 642) - không scale!
```

---

## VIII. Tổng Kết

### 1. Luồng Hoạt Động Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│  1. User click "Từ chối"                                │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. Mở RejectReviewDialog                               │
│     - Load PDF bằng react-pdf                           │
│     - Tạo canvas overlay cho mỗi trang                  │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. User vẽ chú thích trên PDF                          │
│     - Chọn tool (line, freehand, rectangle, text)      │
│     - Vẽ trên canvas bằng HTML5 Canvas API             │
│     - Strokes được lưu trong state                      │
│     - Có thể undo/redo                                  │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. User nhập lý do từ chối                             │
│     - Textarea input                                    │
│     - Validate: không được để trống                     │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. User click "Xác nhận từ chối"                       │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. Load PDF gốc từ presignedUrl                        │
│     - Fetch PDF bytes                                   │
│     - Load bằng pdf-lib                                 │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  7. Vẽ tất cả strokes lên PDF                           │
│     - Loop qua từng trang                               │
│     - Loop qua từng stroke của trang                    │
│     - Convert canvas coords → PDF coords                │
│     - Vẽ bằng pdf-lib API                               │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  8. Export PDF đã chú thích                             │
│     - pdfDoc.save() → bytes                             │
│     - Convert bytes → Blob → File                       │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  9. Upload lên MinIO                                    │
│     - contractService.uploadDocument(file)              │
│     - Nhận về path và fileName                          │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  10. Tạo document record                                │
│      - contractService.createDocument()                 │
│      - type = 9 (rejection annotated)                   │
│      - status = 1 (active)                              │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  11. Thay đổi contract status                           │
│      - contractService.changeContractStatus()           │
│      - status = 31 (REJECTED)                           │
│      - reason = lý do từ chối                           │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  12. Thành công                                         │
│      - Hiển thị toast success                           │
│      - Gọi onRejected() callback                        │
│      - Đóng dialog                                      │
└─────────────────────────────────────────────────────────┘
```

### 2. Thư Viện và Công Nghệ

| Công nghệ | Loại | Mục đích | Ghi chú |
|-----------|------|----------|---------|
| **pdf-lib** | External Library | Chỉnh sửa PDF | ⭐ Quan trọng nhất |
| **react-pdf** | External Library | Hiển thị PDF | Render PDF pages |
| **HTML5 Canvas** | Browser API | Vẽ overlay | Built-in, không cần cài |
| **React Hooks** | React Built-in | State management | useState, useEffect, useRef |
| **Fetch API** | Browser API | Load PDF bytes | Built-in, không cần cài |
| **contractService** | Internal API | Backend calls | Tự viết |

### 3. Các Điểm Quan Trọng

✅ **Canvas overlay trong suốt** nằm trên PDF để vẽ

✅ **Mỗi trang có 1 canvas riêng** để vẽ độc lập

✅ **Strokes được lưu theo trang** (page number)

✅ **Hệ tọa độ khác nhau**: Canvas (Y xuống) vs PDF (Y lên)

✅ **Phải flip Y coordinate** khi chuyển từ Canvas sang PDF

✅ **Scale factor** chỉ áp dụng cho Canvas, không áp dụng cho PDF

✅ **Undo/Redo stack** để quản lý history

✅ **Type 9** cho document rejection annotated

✅ **Status 31** cho contract rejected

### 4. Công Thức Quan Trọng

```javascript
// 1. Lấy vị trí chuột trên canvas
const pos = {
  x: (e.clientX - rect.left) / pdfScale,
  y: (e.clientY - rect.top) / pdfScale
};

// 2. Vẽ lên canvas (có scale)
const displayX = x * pdfScale;
const displayY = y * pdfScale;

// 3. Vẽ lên PDF (không scale, flip Y)
const pdfX = x;
const pdfY = pageHeight - y;

// 4. Canvas size
const canvasWidth = 595 * pdfScale;   // A4 width
const canvasHeight = 842 * pdfScale;  // A4 height
```

### 5. Best Practices

✅ **Validate lý do từ chối** trước khi submit

✅ **Hiển thị progress** cho user biết đang xử lý

✅ **Handle errors** và hiển thị toast message

✅ **Clear state** khi đóng dialog

✅ **Disable buttons** khi đang loading

✅ **Keyboard shortcuts** (Ctrl+Z, Ctrl+Y) cho undo/redo

✅ **Auto-detect active page** khi scroll

✅ **Smooth scroll** khi chuyển trang

---

**📅 Ngày tạo**: 2025-01-06  
**📝 Version**: 1.0  
**👨‍💻 Tác giả**: Kiro AI Assistant

