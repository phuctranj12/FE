# Logic Tạo, Vẽ và Drag Component trong Document Editor

## Mục lục
- [I. Tổng Quan](#i-tổng-quan)
- [II. Hệ Thống Tọa Độ và Scale](#ii-hệ-thống-tọa-độ-và-scale)
- [III. Logic Tạo Component](#iii-logic-tạo-component)
- [IV. Logic Drag & Drop](#iv-logic-drag--drop)
- [V. Logic Resize Component](#v-logic-resize-component)
- [VI. Logic Zoom In/Out](#vi-logic-zoom-inout)
- [VII. Render Component trên PDF](#vii-render-component-trên-pdf)

---

## I. Tổng Quan

### 1. Cấu Trúc Giao Diện

Document Editor được chia thành 3 phần chính:

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCUMENT EDITOR                          │
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │                   │
│  LEFT        │    MAIN CONTENT          │   RIGHT           │
│  SIDEBAR     │    (PDF Viewer)          │   SIDEBAR         │
│              │                          │                   │
│  - TEXT      │  ┌────────────────────┐  │  THUỘC TÍNH:     │
│  - CHỮ KÝ SỐ │  │                    │  │  - Tên trường    │
│              │  │   PDF Document     │  │  - Người xử lý   │
│              │  │                    │  │  - Font, Size    │
│              │  │   [Components]     │  │  - Vị trí (X,Y)  │
│              │  │                    │  │  - Kích thước    │
│              │  └────────────────────┘  │                   │
│              │                          │                   │
└──────────────┴──────────────────────────┴───────────────────┘
```

### 2. Các Loại Component

| Loại | Field Type | Mô tả | Người được gán |
|------|-----------|-------|----------------|
| TEXT | 1 | Ô nhập text | Người ký (role=3) hoặc Văn thư (role=4) |
| IMAGE_SIGN | 2 | Ô ký ảnh | Người ký (role=3) hoặc Văn thư (role=4) |
| DIGITAL_SIGN | 3 | Ô ký số | Người ký (role=3) hoặc Văn thư (role=4) |

---

## II. Hệ Thống Tọa Độ và Scale

### 1. Khái Niệm Cơ Bản


**Tọa độ trong PDF** được tính theo hệ tọa độ 2D:
- **Gốc tọa độ (0,0)**: Góc trên bên trái của mỗi trang PDF
- **Trục X**: Chạy từ trái sang phải (tăng dần)
- **Trục Y**: Chạy từ trên xuống dưới (tăng dần)

```
(0,0) ────────────────────────► X
  │
  │     ┌─────────────────┐
  │     │                 │
  │     │   PDF Page      │
  │     │                 │
  │     │   [Component]   │ ← Component tại (x, y)
  │     │                 │
  │     └─────────────────┘
  ▼
  Y
```

### 2. Scale Factor (Tỷ Lệ Zoom)

**Scale** là tỷ lệ phóng to/thu nhỏ của PDF:
- `scale = 1.0`: Kích thước gốc (100%)
- `scale = 1.5`: Phóng to 150%
- `scale = 0.8`: Thu nhỏ 80%

**Công thức**:
```javascript
scale = zoom / 100
// Ví dụ: zoom = 150% → scale = 1.5
```

### 3. Normalized Coordinates (Tọa độ Chuẩn Hóa)

**Vấn đề**: Khi zoom in/out, tọa độ pixel thay đổi nhưng vị trí tương đối trên PDF không đổi.

**Giải pháp**: Lưu tọa độ ở **scale = 1.0** (chuẩn hóa) vào database.

```javascript
// Khi LOAD từ database (scale = 1.0)
const scaledX = normalizedX * currentScale;
const scaledY = normalizedY * currentScale;

// Khi SAVE vào database
const normalizedX = displayX / currentScale;
const normalizedY = displayY / currentScale;
```

**Ví dụ thực tế**:
```
Component ở vị trí (100, 200) với scale = 1.0

Khi zoom = 150% (scale = 1.5):
- displayX = 100 * 1.5 = 150px
- displayY = 200 * 1.5 = 300px

Khi zoom = 80% (scale = 0.8):
- displayX = 100 * 0.8 = 80px
- displayY = 200 * 0.8 = 160px

→ Lưu vào DB: (100, 200) - không đổi!
```

### 4. Auto-Fit Width

Khi bật `autoFitWidth`, PDF tự động scale để vừa với chiều rộng container:

```javascript
// Tính scale tự động
const containerWidth = 800; // px
const pdfPageWidth = 595;   // px (A4 width at scale=1.0)
const padding = 40;         // px

autoScale = (containerWidth - padding) / pdfPageWidth;
// autoScale = (800 - 40) / 595 ≈ 1.28
```

---

## III. Logic Tạo Component

### 1. Component TEXT (Tự Động Tạo)

**Đặc điểm**: Khi click vào button TEXT, component được tạo ngay lập tức ở giữa màn hình.


**Luồng hoạt động**:

```javascript
// Bước 1: User click vào button "TEXT"
handleComponentSelect(component) {
  if (component.autoCreate) {
    // Bước 2: Tính kích thước default dựa trên PDF page width
    const defaultSize = getDefaultComponentSize();
    // width = 25% của page width
    // height = 10% của page width
    
    // Bước 3: Tính vị trí giữa viewport hiện tại
    const { x, y } = getCenteredPosition(defaultSize.width, defaultSize.height);
    
    // Bước 4: Tạo component mới
    const newComponent = {
      id: Date.now(),              // ID duy nhất
      type: 'text',                // Loại component
      name: 'TEXT',
      page: currentPage,           // Trang hiện tại
      properties: {
        x: x,                      // Vị trí X
        y: y,                      // Vị trí Y
        width: defaultSize.width,  // Chiều rộng = 25% page width
        height: defaultSize.height,// Chiều cao = 10% page width
        signer: '',                // Chưa gán người xử lý
        recipientId: null,
        font: 'Times New Roman',
        size: 13,
        ordering: documentComponents.length + 1
      }
    };
    
    // Bước 5: Thêm vào danh sách components
    setDocumentComponents([...prev, newComponent]);
    
    // Bước 6: Tự động chọn component để edit
    setEditingComponentId(newComponent.id);
  }
}
```

**Hàm tính default size dựa trên PDF**:

```javascript
getDefaultComponentSize() {
  const pdfContainer = pdfViewerContainerRef.current;
  if (!pdfContainer) {
    // Fallback nếu chưa có container
    return { width: 200, height: 80 };
  }

  // Lấy page element hiện tại
  const safePageIndex = Math.max(0, (currentPage || 1) - 1);
  const pageSelector = `[data-page-index="${safePageIndex}"]`;
  const pageElement = pdfContainer.querySelector(pageSelector);
  const targetElement = pageElement?.querySelector('canvas, .page, .react-pdf__Page') || pageElement;
  const pageWidth = targetElement?.clientWidth;

  if (!pageWidth || pageWidth === 0) {
    // Fallback nếu chưa load page
    return { width: 200, height: 80 };
  }

  // Component width = 25% của page width (có thể điều chỉnh tỷ lệ)
  // Component height = 10% của page width (giữ tỷ lệ hợp lý)
  const width = Math.round(pageWidth * 0.25);
  const height = Math.round(pageWidth * 0.10);

  return {
    width: Math.max(width, 50),   // Tối thiểu 50px
    height: Math.max(height, 20)  // Tối thiểu 20px
  };
}
```

**Ví dụ tính toán**:

```
Màn hình Desktop (PDF page width = 800px):
- Component width = 800 * 0.25 = 200px
- Component height = 800 * 0.10 = 80px

Màn hình Laptop nhỏ (PDF page width = 500px):
- Component width = 500 * 0.25 = 125px
- Component height = 500 * 0.10 = 50px

Màn hình Tablet (PDF page width = 600px):
- Component width = 600 * 0.25 = 150px
- Component height = 600 * 0.10 = 60px

→ Component size tự động scale theo kích thước PDF!
```

**Hàm tính vị trí giữa màn hình**:

```javascript
getCenteredPosition(width, height) {
  // Lấy PDF container
  const pdfContainer = pdfViewerContainerRef.current;
  
  // Lấy page element hiện tại
  const pageElement = pdfContainer.querySelector(`[data-page-index="${currentPage - 1}"]`);
  
  // Lấy kích thước page
  const targetWidth = pageElement.clientWidth;
  const targetHeight = pageElement.clientHeight;
  
  // Lấy vị trí scroll hiện tại
  const scrollLeft = pdfContainer.scrollLeft;
  const scrollTop = pdfContainer.scrollTop;
  
  // Tính vị trí giữa viewport
  const viewportCenterX = scrollLeft + (pdfContainer.clientWidth / 2);
  const viewportCenterY = scrollTop + (pdfContainer.clientHeight / 2);
  
  // Tính offset của page trong container
  const pageRect = pageElement.getBoundingClientRect();
  const containerRect = pdfContainer.getBoundingClientRect();
  const pageOffsetLeft = (pageRect.left - containerRect.left) + scrollLeft;
  const pageOffsetTop = (pageRect.top - containerRect.top) + scrollTop;
  
  // Tính vị trí component relative với page
  const x = viewportCenterX - pageOffsetLeft - (width / 2);
  const y = viewportCenterY - pageOffsetTop - (height / 2);
  
  // Đảm bảo không vượt ra ngoài page
  return {
    x: Math.max(0, Math.min(targetWidth - width, x)),
    y: Math.max(0, Math.min(targetHeight - height, y))
  };
}
```

**Minh họa**:

```
┌─────────────────────────────────────┐
│  PDF Container (có scroll)          │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │  Viewport (phần nhìn thấy)   │  │
│  │                               │  │
│  │         ┌─────────┐           │  │
│  │         │  [NEW]  │ ← Component tạo ở giữa
│  │         │  TEXT   │           │  │
│  │         └─────────┘           │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 2. Component CHỮ KÝ SỐ (Chọn Loại Trước)

**Đặc điểm**: Hiển thị dropdown để chọn 1 trong 3 loại chữ ký số.


**Luồng hoạt động**:

```javascript
// Bước 1: User click vào button "CHỮ KÝ SỐ"
handleComponentSelect(component) {
  if (component.hasDropdown) {
    // Hiển thị dropdown với 3 options
    setShowSignatureDropdown(true);
    setSelectedComponent(component);
  }
}

// Bước 3 options trong dropdown:
const signatureOptions = [
  {
    id: 'signature-with-seal-info',
    name: 'Chữ ký có con dấu và thông tin',
    description: 'Con dấu/ chữ ký + Thông tin chữ ký số'
  },
  {
    id: 'signature-seal-only',
    name: 'Chỉ có con dấu/ chữ ký',
    description: 'Con dấu/ chữ ký'
  },
  {
    id: 'signature-info-only',
    name: 'Chỉ có thông tin',
    description: 'Thông tin chữ ký số'
  }
];

// Bước 2: User chọn 1 option
handleSignatureOptionClick(option) {
  // Tính default size dựa trên PDF page width
  const defaultSize = getDefaultComponentSize();
  const { x, y } = getCenteredPosition(defaultSize.width, defaultSize.height);
  
  const newComponent = {
    id: Date.now(),
    type: 'digital-signature',
    name: `CHỮ KÝ SỐ - ${option.name}`,
    signatureType: option.id,
    page: currentPage,
    properties: {
      x: x,
      y: y,
      width: defaultSize.width,   // Scale theo PDF
      height: defaultSize.height, // Scale theo PDF
      ordering: documentComponents.length + 1
    }
  };
  
  setDocumentComponents([...prev, newComponent]);
  setShowSignatureDropdown(false);
}
```

**Minh họa dropdown**:

```
┌──────────────┐
│  CHỮ KÝ SỐ  │ ← Click vào đây
└──────────────┘
       │
       └──────────────────────────────────────┐
                                              │
       ┌──────────────────────────────────────▼───┐
       │  ✍️ Chữ ký có con dấu và thông tin       │
       │  📋 Thông tin chữ ký số                  │
       ├──────────────────────────────────────────┤
       │  ✍️ Chỉ có con dấu/ chữ ký              │
       ├──────────────────────────────────────────┤
       │  📋 Chỉ có thông tin                     │
       └──────────────────────────────────────────┘
```

---

## IV. Logic Drag & Drop

### 1. Tổng Quan

Drag & Drop cho phép di chuyển component trên PDF bằng cách kéo thả chuột.

**3 giai đoạn**:
1. **Mouse Down**: Bắt đầu kéo
2. **Mouse Move**: Di chuyển component
3. **Mouse Up**: Kết thúc kéo

### 2. Giai Đoạn 1: Mouse Down (Bắt Đầu Kéo)

**Mục tiêu**: Lưu lại vị trí ban đầu và offset từ chuột đến component.

```javascript
handleMouseDown(e, componentId) {
  e.preventDefault();
  e.stopPropagation();
  
  // Tìm component
  const component = documentComponents.find(c => c.id === componentId);
  if (!component || component.locked) return; // Không kéo được component bị khóa
  
  // Tìm page container chứa component
  const pageContainer = e.target.closest('[data-page-index]');
  const pageRect = pageContainer.getBoundingClientRect();
  
  // Lấy vị trí component
  const componentRect = e.currentTarget.getBoundingClientRect();
  
  // Tính offset từ chuột đến góc trên-trái của component
  const offsetX = e.clientX - componentRect.left;
  const offsetY = e.clientY - componentRect.top;
  
  // Lưu trạng thái
  setDraggedComponent(component);
  setIsDragging(true);
  setDragStart({
    offsetX: offsetX,
    offsetY: offsetY,
    pageRectLeft: pageRect.left,
    pageRectTop: pageRect.top
  });
}
```

**Minh họa**:

```
Page Container
┌─────────────────────────────────────┐
│                                     │
│     Component                       │
│     ┌─────────────┐                 │
│     │   ●         │ ← Mouse click tại (●)
│     │   ↑         │                 │
│     │   offsetY   │                 │
│     │←─→          │                 │
│     │offsetX      │                 │
│     └─────────────┘                 │
│                                     │
└─────────────────────────────────────┘
```


### 3. Giai Đoạn 2: Mouse Move (Di Chuyển)

**Mục tiêu**: Cập nhật vị trí component theo vị trí chuột.

```javascript
handleMouseMove(e) {
  if (!isDragging || !draggedComponent) return;
  
  // Tìm page container (cập nhật mỗi lần move để handle scroll)
  const pageNumber = draggedComponent.properties?.page || currentPage;
  const pageContainer = document.querySelector(`[data-page-index="${pageNumber - 1}"]`);
  
  if (pageContainer) {
    const pageRect = pageContainer.getBoundingClientRect();
    
    // Tính tọa độ mới RELATIVE với page container
    // Công thức: newX = (vị trí chuột - vị trí page) - offset
    const newX = (e.clientX - pageRect.left) - dragStart.offsetX;
    const newY = (e.clientY - pageRect.top) - dragStart.offsetY;
    
    // Cập nhật vị trí component (đảm bảo không âm)
    setDocumentComponents(prev => prev.map(comp => {
      if (comp.id === draggedComponent.id) {
        return {
          ...comp,
          properties: {
            ...comp.properties,
            x: Math.max(0, newX),
            y: Math.max(0, newY),
            page: pageNumber
          }
        };
      }
      return comp;
    }));
    
    // Cập nhật sidebar properties để hiển thị real-time
    if (editingComponentId === draggedComponent.id) {
      setComponentProperties({
        ...componentProperties,
        x: Math.max(0, newX),
        y: Math.max(0, newY)
      });
    }
  }
}
```

**Công thức tính toán**:

```
Vị trí chuột trên màn hình: e.clientX, e.clientY
Vị trí page trên màn hình: pageRect.left, pageRect.top
Offset từ chuột đến component: dragStart.offsetX, dragStart.offsetY

→ Vị trí component relative với page:
  newX = (e.clientX - pageRect.left) - dragStart.offsetX
  newY = (e.clientY - pageRect.top) - dragStart.offsetY
```

**Minh họa**:

```
Screen (Màn hình)
┌─────────────────────────────────────────────┐
│                                             │
│   Page Container                            │
│   ┌─────────────────────────────────────┐   │
│   │ (pageRect.left, pageRect.top)       │   │
│   │                                     │   │
│   │     Component (đang kéo)            │   │
│   │     ┌─────────────┐                 │   │
│   │     │             │                 │   │
│   │     │      ●      │ ← Mouse tại (e.clientX, e.clientY)
│   │     │             │                 │   │
│   │     └─────────────┘                 │   │
│   │     (newX, newY)                    │   │
│   │                                     │   │
│   └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘

Tính toán:
newX = e.clientX - pageRect.left - offsetX
newY = e.clientY - pageRect.top - offsetY
```

### 4. Giai Đoạn 3: Mouse Up (Kết Thúc)

**Mục tiêu**: Dừng kéo và lưu vị trí cuối cùng.

```javascript
handleMouseUp() {
  setIsDragging(false);
  setDraggedComponent(null);
  // Vị trí đã được cập nhật trong handleMouseMove
  // Không cần làm gì thêm
}
```

### 5. Event Listeners

**Quan trọng**: Phải đăng ký event listeners ở document level để handle khi chuột ra ngoài component.

```javascript
useEffect(() => {
  const handleMouseMoveEvent = (e) => {
    if (isDragging) {
      handleMouseMove(e);
    }
  };

  const handleMouseUpEvent = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  if (isDragging) {
    // Đăng ký listeners ở document level
    document.addEventListener('mousemove', handleMouseMoveEvent);
    document.addEventListener('mouseup', handleMouseUpEvent);
    
    return () => {
      // Cleanup khi unmount hoặc kết thúc drag
      document.removeEventListener('mousemove', handleMouseMoveEvent);
      document.removeEventListener('mouseup', handleMouseUpEvent);
    };
  }
}, [isDragging]);
```

**Tại sao phải dùng document level?**

```
Nếu chỉ đăng ký trên component:
┌─────────────────────────────────────┐
│  Page                               │
│  ┌─────────┐                        │
│  │Component│ ← Listeners ở đây      │
│  └─────────┘                        │
│       ↓                             │
│       ● Mouse di chuyển ra ngoài    │
│         → Mất sự kiện!              │
└─────────────────────────────────────┘

Nếu đăng ký trên document:
┌─────────────────────────────────────┐ ← Listeners ở đây
│  Page                               │
│  ┌─────────┐                        │
│  │Component│                        │
│  └─────────┘                        │
│       ↓                             │
│       ● Mouse di chuyển ra ngoài    │
│         → Vẫn nhận được sự kiện!    │
└─────────────────────────────────────┘
```

---

## V. Logic Resize Component

### 1. Tổng Quan

Resize cho phép thay đổi kích thước component bằng cách kéo 4 góc.


**4 góc resize**:

```
Component
┌─────────────────────┐
│ nw              ne  │ ← North-West, North-East
│                     │
│                     │
│                     │
│ sw              se  │ ← South-West, South-East
└─────────────────────┘
```

### 2. Bắt Đầu Resize

```javascript
handleResizeStart(e, componentId, handle) {
  e.preventDefault();
  e.stopPropagation();
  
  const component = documentComponents.find(c => c.id === componentId);
  if (!component || component.locked) return;
  
  // Lưu trạng thái
  setIsResizing(true);
  setResizeHandle(handle); // 'se', 'sw', 'ne', 'nw'
  setDraggedComponent(component);
  setDragStart({
    x: e.clientX,
    y: e.clientY
  });
}
```

### 3. Di Chuyển Resize

```javascript
handleResizeMove(e) {
  if (!isResizing || !draggedComponent || !resizeHandle) return;
  
  // Tính delta (khoảng cách di chuyển)
  const deltaX = e.clientX - dragStart.x;
  const deltaY = e.clientY - dragStart.y;
  
  // Lấy kích thước hiện tại
  const currentComponent = documentComponents.find(c => c.id === draggedComponent.id);
  let newWidth = currentComponent.properties.width;
  let newHeight = currentComponent.properties.height;
  
  // Tính kích thước mới dựa trên handle
  switch (resizeHandle) {
    case 'se': // South-East (góc dưới phải)
      newWidth = currentComponent.properties.width + deltaX;
      newHeight = currentComponent.properties.height + deltaY;
      break;
      
    case 'sw': // South-West (góc dưới trái)
      newWidth = currentComponent.properties.width - deltaX;
      newHeight = currentComponent.properties.height + deltaY;
      break;
      
    case 'ne': // North-East (góc trên phải)
      newWidth = currentComponent.properties.width + deltaX;
      newHeight = currentComponent.properties.height - deltaY;
      break;
      
    case 'nw': // North-West (góc trên trái)
      newWidth = currentComponent.properties.width - deltaX;
      newHeight = currentComponent.properties.height - deltaY;
      break;
  }
  
  // Đảm bảo kích thước tối thiểu
  newWidth = Math.max(50, newWidth);
  newHeight = Math.max(20, newHeight);
  
  // Cập nhật component
  setDocumentComponents(prev => prev.map(comp => 
    comp.id === draggedComponent.id 
      ? { 
          ...comp, 
          properties: { 
            ...comp.properties, 
            width: newWidth, 
            height: newHeight 
          } 
        }
      : comp
  ));
  
  // Cập nhật dragStart cho lần tính toán tiếp theo
  setDragStart({ x: e.clientX, y: e.clientY });
}
```

**Minh họa resize từng góc**:

```
Resize góc SE (South-East):
┌─────────────┐           ┌─────────────────┐
│             │           │                 │
│             │    →      │                 │
│             ●           │                 ●
└─────────────┘           └─────────────────┘
              Kéo sang phải + xuống

Resize góc SW (South-West):
┌─────────────┐       ┌─────────────┐
│             │       │             │
│             │   →   │             │
●             │       ●             │
└─────────────┘       └─────────────┘
Kéo sang trái + xuống

Resize góc NE (North-East):
┌─────────────┐       ┌─────────────────┐
│             ●       │                 ●
│             │   →   │                 │
│             │       │                 │
└─────────────┘       └─────────────────┘
Kéo sang phải + lên

Resize góc NW (North-West):
●─────────────┐       ●─────────────┐
│             │       │             │
│             │   →   │             │
│             │       │             │
└─────────────┘       └─────────────┘
Kéo sang trái + lên
```

### 4. Kết Thúc Resize

```javascript
handleResizeEnd() {
  setIsResizing(false);
  setResizeHandle(null);
  setDraggedComponent(null);
}
```

---

## VI. Logic Zoom In/Out

### 1. Tổng Quan

Zoom thay đổi scale của PDF và tất cả components phải scale theo.

**2 chế độ zoom**:
1. **Manual Zoom**: User chọn zoom level (50%, 100%, 150%...)
2. **Auto-Fit Width**: Tự động scale để PDF vừa với chiều rộng container

### 2. Manual Zoom

```javascript
// State
const [zoom, setZoom] = useState(100); // 100%

// Tính scale
const scale = zoom / 100;
// zoom = 100% → scale = 1.0
// zoom = 150% → scale = 1.5
// zoom = 80% → scale = 0.8
```


### 3. Auto-Fit Width

**Mục tiêu**: PDF tự động scale để vừa với chiều rộng container.

```javascript
// Bước 1: Track container width
const [containerWidth, setContainerWidth] = useState(0);

useEffect(() => {
  if (!autoFitWidth || !containerRef.current) return;
  
  const updateContainerWidth = () => {
    const width = containerRef.current.clientWidth;
    setContainerWidth(width);
  };
  
  // Sử dụng ResizeObserver để theo dõi thay đổi kích thước
  const resizeObserver = new ResizeObserver(updateContainerWidth);
  resizeObserver.observe(containerRef.current);
  
  return () => resizeObserver.disconnect();
}, [autoFitWidth]);

// Bước 2: Tính auto scale
useEffect(() => {
  if (!autoFitWidth || !containerWidth) return;
  
  // Lấy chiều rộng page gốc (scale = 1.0)
  const firstPageWidth = pageWidthsRef.current[1]; // Ví dụ: 595px (A4)
  
  if (firstPageWidth && firstPageWidth > 0) {
    // Tính scale: (container width - padding) / page width
    const padding = 40; // 20px mỗi bên
    const availableWidth = containerWidth - padding;
    const scale = availableWidth / firstPageWidth;
    
    setAutoScale(scale);
  }
}, [containerWidth, autoFitWidth]);
```

**Ví dụ tính toán**:

```
Container width: 800px
Padding: 40px (20px mỗi bên)
Page width (scale=1.0): 595px (A4)

Available width = 800 - 40 = 760px
Auto scale = 760 / 595 ≈ 1.28

→ PDF sẽ được scale lên 128%
```

### 4. Scale Components Theo Zoom

**Vấn đề**: Khi zoom thay đổi, components phải scale theo để giữ vị trí tương đối.

**Giải pháp**: Sử dụng normalized coordinates.

```javascript
// Khi LOAD components từ database
useEffect(() => {
  if (fieldsData && fieldsData.length > 0 && currentScale > 0) {
    // Lưu normalized coordinates (scale = 1.0)
    normalizedFieldsRef.current = fieldsData.map(field => ({
      id: field.id,
      boxX: field.boxX || 0,    // Normalized X
      boxY: field.boxY || 0,    // Normalized Y
      boxW: field.boxW || 100,  // Normalized Width
      boxH: field.boxH || 30    // Normalized Height
    }));
    
    // Scale lên currentScale để hiển thị
    const loadedComponents = fieldsData.map(field => {
      const scaledX = field.boxX * currentScale;
      const scaledY = field.boxY * currentScale;
      const scaledW = field.boxW * currentScale;
      const scaledH = field.boxH * currentScale;
      
      return {
        id: field.id,
        type: getComponentType(field.type),
        properties: {
          x: scaledX,
          y: scaledY,
          width: scaledW,
          height: scaledH,
          // ... other properties
        }
      };
    });
    
    setDocumentComponents(loadedComponents);
  }
}, [fieldsData, currentScale]);
```

**Re-scale khi zoom thay đổi**:

```javascript
// Khi currentScale thay đổi, re-scale tất cả components
useEffect(() => {
  if (normalizedFieldsRef.current.length > 0 && currentScale > 0) {
    setDocumentComponents(prev => {
      return prev.map(component => {
        // Chỉ re-scale components từ database (có fieldId)
        if (!component.fieldId) return component;
        
        // Tìm normalized coordinates
        const normalized = normalizedFieldsRef.current.find(
          nf => nf.id === component.fieldId
        );
        if (!normalized) return component;
        
        // Re-scale từ normalized coordinates
        return {
          ...component,
          properties: {
            ...component.properties,
            x: normalized.boxX * currentScale,
            y: normalized.boxY * currentScale,
            width: normalized.boxW * currentScale,
            height: normalized.boxH * currentScale
          }
        };
      });
    });
  }
}, [currentScale]);
```

**Minh họa**:

```
Database (Normalized, scale = 1.0):
Component A: x=100, y=200, w=150, h=50

Zoom = 100% (scale = 1.0):
Display: x=100, y=200, w=150, h=50

Zoom = 150% (scale = 1.5):
Display: x=150, y=300, w=225, h=75

Zoom = 80% (scale = 0.8):
Display: x=80, y=160, w=120, h=40

┌─────────────────────────────────────┐
│  Scale = 1.0 (100%)                 │
│  ┌──────┐                           │
│  │  A   │                           │
│  └──────┘                           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Scale = 1.5 (150%)                 │
│  ┌──────────┐                       │
│  │    A     │                       │
│  └──────────┘                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Scale = 0.8 (80%)                  │
│  ┌────┐                             │
│  │ A  │                             │
│  └────┘                             │
└─────────────────────────────────────┘
```

### 5. Notify Parent về Scale Changes

```javascript
// Notify parent component khi scale thay đổi
useEffect(() => {
  if (onScaleChange) {
    const currentScale = autoFitWidth ? autoScale : (zoom / 100);
    onScaleChange(currentScale);
  }
}, [autoScale, zoom, autoFitWidth, onScaleChange]);
```

---

## VII. Render Component trên PDF

### 1. Cấu Trúc Render

```javascript
<PDFViewer
  document={{ pdfUrl: pdfUrl }}
  currentPage={currentPage}
  zoom={zoom}
  components={documentComponents}
  onScaleChange={handleScaleChange}
  // ... other props
/>
```


### 2. Render Logic trong PDFViewer

```javascript
// PDFViewer.js
function PDFViewer({ document, components, zoom, autoFitWidth, ... }) {
  // Tính scale hiện tại
  const currentScale = autoFitWidth ? autoScale : (zoom / 100);
  
  return (
    <Document file={pdfUrl}>
      {Array.from({ length: numPages }, (_, i) => {
        const pageNumber = i + 1;
        
        // Lọc components thuộc trang này
        const pageComponents = components.filter(comp => 
          (comp.properties?.page || comp.page) === pageNumber
        );
        
        return (
          <div key={i} data-page-index={i}>
            {/* Render PDF page */}
            <Page
              pageNumber={pageNumber}
              scale={currentScale}
            />
            
            {/* Render components trên page */}
            {pageComponents.map(component => (
              <ComponentOverlay
                key={component.id}
                component={component}
                scale={currentScale}
              />
            ))}
          </div>
        );
      })}
    </Document>
  );
}
```

### 3. Component Overlay

```javascript
function ComponentOverlay({ component, scale }) {
  const isLocked = Boolean(component.locked);
  
  // Lấy thông tin người được gán
  const assignedName = component.assignedRecipientName;
  const assignedRole = component.assignedRecipientRole;
  const badgeLabel = assignedName 
    ? `${assignedName}${assignedRole ? ` - ${assignedRole}` : ''}`
    : '';
  
  // Tính toán vị trí và kích thước
  // NOTE: Trong editor mode, components đã được scale sẵn
  // Trong viewer mode, cần scale thêm
  const isEditorMode = Boolean(onComponentMouseDown);
  const shouldScale = !isEditorMode;
  
  const displayX = shouldScale ? component.properties.x * scale : component.properties.x;
  const displayY = shouldScale ? component.properties.y * scale : component.properties.y;
  const displayWidth = shouldScale ? component.properties.width * scale : component.properties.width;
  const displayHeight = shouldScale ? component.properties.height * scale : component.properties.height;
  const displayFontSize = shouldScale ? component.properties.size * scale : component.properties.size;
  
  return (
    <div
      data-component-id={component.id}
      className={`document-component ${isLocked ? 'locked' : ''}`}
      style={{
        position: 'absolute',
        left: `${displayX}px`,
        top: `${displayY}px`,
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        fontSize: `${displayFontSize}px`,
        fontFamily: component.properties.font,
        cursor: isLocked ? 'not-allowed' : 'grab',
        border: '2px dashed #007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        zIndex: 10
      }}
      onMouseDown={(e) => !isLocked && onComponentMouseDown(e, component.id)}
      onClick={(e) => !isLocked && onComponentClick(component)}
    >
      {/* Badge hiển thị người được gán */}
      {badgeLabel && (
        <div className="component-assignee-badge">
          {badgeLabel}
        </div>
      )}
      
      {/* Locked badge */}
      {isLocked && showLockedBadge && (
        <div className="component-locked-badge">
          🔒 Đã khóa
        </div>
      )}
      
      {/* Resize handles (4 góc) */}
      {!isLocked && (
        <>
          <div 
            className="resize-handle nw" 
            onMouseDown={(e) => onResizeStart(e, component.id, 'nw')}
          />
          <div 
            className="resize-handle ne" 
            onMouseDown={(e) => onResizeStart(e, component.id, 'ne')}
          />
          <div 
            className="resize-handle sw" 
            onMouseDown={(e) => onResizeStart(e, component.id, 'sw')}
          />
          <div 
            className="resize-handle se" 
            onMouseDown={(e) => onResizeStart(e, component.id, 'se')}
          />
        </>
      )}
      
      {/* Delete button */}
      {!isLocked && (
        <button 
          className="component-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveComponent(component.id);
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

### 4. CSS Styling

```css
.document-component {
  position: absolute;
  border: 2px dashed #007bff;
  background-color: rgba(0, 123, 255, 0.1);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.document-component:hover {
  border-color: #0056b3;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
}

.document-component.editing {
  border-color: #28a745;
  border-width: 3px;
  box-shadow: 0 0 12px rgba(40, 167, 69, 0.5);
}

.document-component.dragging {
  opacity: 0.7;
  cursor: grabbing !important;
}

.document-component.locked {
  border-color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  cursor: not-allowed !important;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #007bff;
  border: 1px solid white;
  border-radius: 50%;
  z-index: 20;
}

.resize-handle.nw {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.resize-handle.ne {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.resize-handle.sw {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.resize-handle.se {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

/* Badges */
.component-assignee-badge {
  position: absolute;
  top: -25px;
  left: 0;
  background-color: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 30;
}

.component-locked-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
}

/* Delete button */
.component-delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  z-index: 30;
}

.component-delete-btn:hover {
  background-color: #c82333;
}
```

---

## VIII. Lưu Components vào Database

### 1. Convert sang Fields Format

```javascript
useEffect(() => {
  if (onFieldsChange && contractId && documentId && currentScale > 0) {
    const fields = documentComponents
      .filter(component => {
        // Bỏ qua components bị khóa
        if (component.locked) return false;
        
        // Chỉ include components có recipientId
        const recipientId = component.properties.recipientId || 
                           parseInt(component.properties.signer);
        return recipientId && !isNaN(recipientId);
      })
      .map((component, index) => {
        const fieldType = getFieldType(component.type);
        const recipientId = component.properties.recipientId || 
                           parseInt(component.properties.signer);
        
        // NORMALIZE coordinates về scale = 1.0
        const normalizedX = component.properties.x / currentScale;
        const normalizedY = component.properties.y / currentScale;
        const normalizedW = component.properties.width / currentScale;
        const normalizedH = component.properties.height / currentScale;
        
        return {
          // Include id khi edit (có fieldId)
          ...(component.fieldId && { id: component.fieldId }),
          name: component.properties.fieldName || component.name,
          font: component.properties.font || 'Times New Roman',
          fontSize: component.properties.size || 11,
          // Lưu normalized coordinates (scale = 1.0)
          boxX: normalizedX,
          boxY: normalizedY,
          boxW: normalizedW,
          boxH: normalizedH.toString(),
          page: (component.properties.page || currentPage).toString(),
          ordering: component.properties.ordering || index + 1,
          contractId: contractId,
          documentId: documentId,
          type: fieldType,
          recipientId: recipientId,
          status: 0
        };
      });
    
    if (fields.length > 0) {
      onFieldsChange(fields);
    }
  }
}, [documentComponents, contractId, documentId, currentPage, currentScale]);
```


### 2. API Call để Lưu

```javascript
// Trong parent component (DocumentConfirmation.js)
const handleSaveFields = async () => {
  try {
    const response = await contractService.createFields(fields);
    
    if (response.code === 'SUCCESS') {
      console.log('Fields saved successfully:', response.data);
      // Chuyển sang bước tiếp theo
    }
  } catch (error) {
    console.error('Error saving fields:', error);
  }
};
```

**Request Body Example**:

```json
[
  {
    "name": "Số hợp đồng",
    "font": "Times New Roman",
    "fontSize": 13,
    "boxX": 77.71875,
    "boxY": 78,
    "page": "1",
    "ordering": 1,
    "boxW": 41.421875,
    "boxH": "28",
    "contractId": 2,
    "documentId": 3,
    "type": 1,
    "recipientId": 9,
    "status": 0
  },
  {
    "name": "Ô text nhập liệu",
    "font": "Times New Roman",
    "fontSize": 13,
    "boxX": 62.71875,
    "boxY": 361,
    "page": "1",
    "ordering": 2,
    "boxW": 135,
    "boxH": "28",
    "contractId": 2,
    "documentId": 3,
    "type": 1,
    "recipientId": 10,
    "status": 0
  }
]
```

---

## IX. Các Tính Năng Bổ Sung

### 1. Scroll to Component

Khi click vào component trong danh sách, tự động scroll đến component đó trên PDF.

```javascript
const scrollToComponent = (component) => {
  setTimeout(() => {
    const componentPage = component.properties?.page || currentPage;
    
    // Chuyển đến trang chứa component nếu cần
    if (componentPage !== currentPage) {
      setCurrentPage(componentPage);
      setTimeout(() => performScroll(component, componentPage), 500);
    } else {
      performScroll(component, componentPage);
    }
  }, 150);
};

const performScroll = (component, pageNumber) => {
  // Tìm component element
  const componentElement = document.querySelector(
    `[data-component-id="${component.id}"]`
  );
  if (!componentElement) return;
  
  // Tìm PDF container
  const pdfContainer = pdfViewerContainerRef.current;
  if (!pdfContainer) return;
  
  // Tính toán vị trí scroll để component ở giữa viewport
  const componentRect = componentElement.getBoundingClientRect();
  const containerRect = pdfContainer.getBoundingClientRect();
  
  const componentTopRelativeToContainer = 
    componentRect.top - containerRect.top + pdfContainer.scrollTop;
  const containerHeight = containerRect.height;
  const componentHeight = componentRect.height;
  
  const targetScrollTop = 
    componentTopRelativeToContainer - 
    (containerHeight / 2) + 
    (componentHeight / 2);
  
  // Scroll với animation
  pdfContainer.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: 'smooth'
  });
};
```

### 2. Page Change Detection

Tự động cập nhật currentPage khi user scroll.

```javascript
useEffect(() => {
  const container = containerRef.current;
  if (!container || !numPages) return;
  
  let rafId = null;
  
  const handleScrollNow = () => {
    const containerTop = container.getBoundingClientRect().top;
    let bestPage = 1;
    let bestDist = Infinity;
    
    // Tìm trang gần nhất với top của container
    pageRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerTop);
      if (dist < bestDist) {
        bestDist = dist;
        bestPage = idx + 1;
      }
    });
    
    // Cập nhật currentPage nếu khác
    if (bestPage !== currentPage && typeof onPageChange === 'function') {
      onPageChange(bestPage);
    }
  };
  
  const handleScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      handleScrollNow();
    });
  };
  
  container.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Gọi 1 lần để sync ngay
  
  return () => {
    container.removeEventListener('scroll', handleScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}, [numPages, currentPage, onPageChange]);
```

### 3. Component Validation

Kiểm tra components trước khi next.

```javascript
// Lấy danh sách components chưa gán người xử lý
const unassignedComponents = useMemo(() => {
  return documentComponents.filter(component => {
    if (component.locked) return false;
    const recipientId = component.properties?.recipientId || 
                       parseInt(component.properties?.signer, 10);
    return !recipientId || Number.isNaN(recipientId);
  });
}, [documentComponents]);

const hasUnassignedComponents = unassignedComponents.length > 0;

// Xử lý khi click Next
const handleNextClick = () => {
  if (hasUnassignedComponents) {
    setNextWarning(
      `Vui lòng gán người xử lý cho ${unassignedComponents.length} thành phần trước khi tiếp tục.`
    );
    return;
  }
  
  setNextWarning('');
  if (onNext) {
    onNext();
  }
};
```

### 4. Locked Components

Components từ đối tác trước bị khóa, không thể edit/delete.

```javascript
// Load components với locked status
useEffect(() => {
  if (fieldsData && fieldsData.length > 0) {
    const loadedComponents = fieldsData.map(field => {
      const isLocked = lockedFieldIds?.includes(field.id);
      
      return {
        id: field.id,
        fieldId: field.id,
        type: getComponentType(field.type),
        locked: Boolean(isLocked), // Đánh dấu locked
        properties: {
          // ... properties
        }
      };
    });
    
    setDocumentComponents(loadedComponents);
  }
}, [fieldsData, lockedFieldIds]);

// Cập nhật locked status khi lockedFieldIds thay đổi
useEffect(() => {
  if (!lockedFieldIds) return;
  
  setDocumentComponents(prev => prev.map(component => {
    if (!component.fieldId) return component;
    
    const shouldLock = lockedFieldIds.includes(component.fieldId);
    if (component.locked === shouldLock) return component;
    
    return { ...component, locked: shouldLock };
  }));
}, [lockedFieldIds]);

// Prevent drag/resize/delete locked components
const handleMouseDown = (e, componentId) => {
  const component = documentComponents.find(c => c.id === componentId);
  if (!component || component.locked) return; // Không cho kéo
  
  // ... drag logic
};

const handleRemoveComponent = (componentId) => {
  const target = documentComponents.find(c => c.id === componentId);
  if (target?.locked) return; // Không cho xóa
  
  // ... remove logic
};
```

---

## X. Tổng Kết

### 1. Luồng Hoạt Động Tổng Thể

```
1. User mở Document Editor
   ↓
2. Load PDF và fieldsData từ database
   ↓
3. Convert fieldsData → documentComponents (scale lên currentScale)
   ↓
4. User tạo/drag/resize components
   ↓
5. Components được cập nhật real-time
   ↓
6. User click "Tiếp theo"
   ↓
7. Validate: Tất cả components phải có recipientId
   ↓
8. Convert documentComponents → fields (normalize về scale=1.0)
   ↓
9. Call API để lưu fields vào database
   ↓
10. Chuyển sang bước tiếp theo
```

### 2. Các Khái Niệm Quan Trọng

| Khái niệm | Mô tả |
|-----------|-------|
| **Normalized Coordinates** | Tọa độ ở scale=1.0, lưu vào database |
| **Display Coordinates** | Tọa độ hiển thị = normalized * currentScale |
| **Scale Factor** | Tỷ lệ zoom = zoom / 100 |
| **Auto-Fit Width** | Tự động scale để PDF vừa container |
| **Page-Relative Coordinates** | Tọa độ tính từ góc trên-trái của page |
| **Locked Components** | Components từ đối tác trước, không edit được |

### 3. Công Thức Quan Trọng

```javascript
// Scale
scale = zoom / 100

// Display coordinates
displayX = normalizedX * scale
displayY = normalizedY * scale
displayWidth = normalizedWidth * scale
displayHeight = normalizedHeight * scale

// Normalized coordinates (để lưu DB)
normalizedX = displayX / scale
normalizedY = displayY / scale
normalizedWidth = displayWidth / scale
normalizedHeight = displayHeight / scale

// Auto-fit scale
autoScale = (containerWidth - padding) / pageWidth

// Drag position
newX = (mouseX - pageLeft) - offsetX
newY = (mouseY - pageTop) - offsetY

// Resize (South-East handle)
newWidth = currentWidth + deltaX
newHeight = currentHeight + deltaY
```

### 4. Best Practices

✅ **Luôn normalize coordinates trước khi lưu database**
- Đảm bảo tọa độ không phụ thuộc vào zoom level

✅ **Sử dụng page-relative coordinates**
- Tọa độ tính từ góc trên-trái của page, không phải container

✅ **Đăng ký event listeners ở document level**
- Để handle drag/resize khi chuột ra ngoài component

✅ **Validate components trước khi next**
- Đảm bảo tất cả components có recipientId

✅ **Handle locked components**
- Không cho edit/delete components từ đối tác trước

✅ **Debounce expensive operations**
- Như autocomplete search, re-scale components

✅ **Use requestAnimationFrame cho scroll detection**
- Tối ưu performance khi scroll

---

**📅 Ngày tạo**: 2025-01-06  
**📝 Version**: 1.0  
**👨‍💻 Tác giả**: Kiro AI Assistant

