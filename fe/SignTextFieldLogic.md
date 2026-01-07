# Logic Điền Text Lên PDF và Convert Text Thành ImageBase64 Khi Ký

## Mục lục
- [I. Tổng Quan](#i-tổng-quan)
- [II. Thư Viện Sử Dụng](#ii-thư-viện-sử-dụng)
- [III. Flow Điền Text Trên PDF](#iii-flow-điền-text-trên-pdf)
- [IV. Convert Text Thành ImageBase64](#iv-convert-text-thành-imagebase64)
- [V. Quy Trình Ký](#v-quy-trình-ký)
- [VI. Tổng Kết](#vi-tổng-kết)

---

## I. Tổng Quan

### 1. Mục Đích

Khi ký hợp đồng, user cần:
1. **Điền text** vào các ô text fields trực tiếp trên PDF (inline editing)
2. **Convert text thành image** để ký số
3. **Ký tất cả fields** theo thứ tự: text fields trước, signature fields sau

### 2. Các Loại Field

| Type | Constant | Mô tả | Xử lý |
|------|----------|-------|-------|
| 1 | TEXT | Ô text thông thường | Convert text → image → ký |
| 4 | CONTRACT_NO | Ô số hợp đồng | Convert text → image → ký |
| 3 | DIGITAL_SIGN | Ô ký số | Ký trực tiếp (có thể có ảnh đóng dấu) |

### 3. Components Liên Quan

**File chính**:
- `src/components/contract_coordinate/ContractDetail.js` - Hiển thị PDF và inline editing
- `src/components/contract_coordinate/SignDialog.js` - Dialog ký và convert text
- `src/components/document/PDFViewer.js` - Render PDF với text input

---

## II. Thư Viện Sử Dụng

### 1. Thư Viện Bên Ngoài

#### **HTML5 Canvas API** (Built-in)

**Mục đích**: Convert text thành image

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
```

**Chức năng**:
- Tạo canvas element
- Render text lên canvas
- Export canvas thành base64 image

**Không cần cài đặt** - Built-in browser API


#### **React Hooks** (Built-in)

```javascript
import React, { useState, useEffect } from 'react';
```

**Không cần cài đặt** - Built-in React

### 2. API Services (Tự Viết)

```javascript
import contractService from '../../api/contractService';
```

**Các API sử dụng**:
- `certificate(recipientId, certData)` - Ký field (text hoặc signature)
- `approvalProcess(recipientId)` - Phê duyệt sau khi ký xong

### 3. Tổng Kết Thư Viện

| Thư viện | Loại | Mục đích | Cần cài đặt |
|----------|------|----------|-------------|
| **HTML5 Canvas** | Browser API | Convert text → image | ❌ Không |
| **React** | Built-in | UI Framework | ❌ Không |
| **contractService** | Internal | API calls | ❌ Không |

---

## III. Flow Điền Text Trên PDF

### 1. Hiển Thị Text Fields Trên PDF

**File**: `ContractDetail.js`

#### **A. Load Fields và Tạo Components**

```javascript
// State lưu giá trị text của từng field
const [textFieldValues, setTextFieldValues] = useState({});

// Load fields từ API
useEffect(() => {
  const loadContractData = async () => {
    // ... load contract, documents, fields
    
    // Khởi tạo giá trị text fields từ API
    const initialTextValues = {};
    fields.forEach(field => {
      if (field.type === 1 || field.type === 4) {
        initialTextValues[field.id] = field.value || '';
      }
    });
    setTextFieldValues(initialTextValues);
  };
  
  loadContractData();
}, [contractId]);

// Convert fields thành components để hiển thị trên PDF
const components = fields.map(field => {
  // Text fields (type 1, 4) không bị locked để có thể click
  const isTextFieldClickable = type === 'sign' && 
                                (field.type === 1 || field.type === 4) && 
                                field.recipientId === recipientId;
  
  return {
    id: `highlight-${field.id}`,
    type: (field.type === 2 || field.type === 3) ? 'signature' : 'text',
    page: field.page || 1,
    properties: {
      x: field.boxX || 0,
      y: field.boxY || 0,
      width: field.boxW || 100,
      height: field.boxH || 30,
      // Hiển thị value từ state
      fieldName: textFieldValues[field.id] || field.value || '',
      // Label để hiển thị khi chưa có value
      label: field.name || (field.type === 4 ? 'Số hợp đồng' : 'Nội dung')
    },
    name: field.name || '',
    highlight: true,
    locked: !isTextFieldClickable // Text field có thể click
  };
});
```

**Minh họa**:

```
PDF Document
┌─────────────────────────────────────┐
│                                     │
│  ┌──────────────────────────────┐   │
│  │ [Số hợp đồng]                │   │ ← Contract number field (type 4)
│  │ Nhấp để điền                 │   │   Chưa có value
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ HD-2025-001                  │   │ ← Text field (type 1)
│  └──────────────────────────────┘   │   Đã có value
│                                     │
│  ┌──────────────────────────────┐   │
│  │ [CHỮ KÝ SỐ]                 │   │ ← Signature field (type 3)
│  └──────────────────────────────┘   │   Locked, không edit được
│                                     │
└─────────────────────────────────────┘
```

#### **B. Handle Click để Edit**

```javascript
// State tracking component đang edit
const [editingComponentId, setEditingComponentId] = useState(null);

const handleComponentClick = (component) => {
  // Chỉ xử lý khi ở chế độ sign
  if (type !== 'sign') return;
  
  // Tìm field tương ứng
  const fieldId = component.id.replace('highlight-', '');
  const field = fields.find(f => f.id === parseInt(fieldId));
  
  if (!field) return;
  
  // Chỉ cho phép edit text fields (type 1, 4) thuộc về recipient hiện tại
  if ((field.type === 1 || field.type === 4) && 
      field.recipientId === recipientId) {
    // Bật chế độ editing
    setEditingComponentId(component.id);
  }
};
```

### 2. Inline Text Input

**File**: `PDFViewer.js`

```javascript
<div className="component-content">
  {component.type === 'text' && 
   editingComponentId === component.id && 
   onTextFieldChange ? (
    // ═══════════════════════════════════════════════════
    // INLINE EDITING MODE
    // ═══════════════════════════════════════════════════
    <input
      type="text"
      className="component-inline-input"
      value={component.properties?.fieldName || ''}
      onChange={(e) => {
        e.stopPropagation();
        if (onTextFieldChange) {
          onTextFieldChange(component.id, e.target.value);
        }
      }}
      onBlur={(e) => {
        e.stopPropagation();
        if (onTextFieldBlur) {
          onTextFieldBlur();
        }
      }}
      onKeyDown={(e) => {
        // Enter hoặc Escape để thoát edit mode
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.target.blur();
        }
        e.stopPropagation();
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      placeholder={component.properties?.label || 'Nhập nội dung'}
      autoFocus
      style={{
        width: '100%',
        height: '100%',
        border: '2px solid #4CAF50',
        padding: '4px',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        outline: 'none',
        background: 'white'
      }}
    />
  ) : (
    // ═══════════════════════════════════════════════════
    // DISPLAY MODE
    // ═══════════════════════════════════════════════════
    component.type === 'text' ? (
      component.properties?.fieldName 
        ? component.properties.fieldName
        : <span style={{ color: '#999', fontStyle: 'italic' }}>
            {component.properties?.label || 'Nhấp để điền'}
          </span>
    ) : `[${component.name}]`
  )}
</div>
```

**Minh họa**:

```
DISPLAY MODE (chưa click):
┌──────────────────────────────┐
│ Nhấp để điền                 │ ← Placeholder text
└──────────────────────────────┘

EDITING MODE (đang click):
┌──────────────────────────────┐
│ HD-2025-001|                 │ ← Input với cursor
└──────────────────────────────┘
  ↑ Border xanh lá (editing)

DISPLAY MODE (đã điền):
┌──────────────────────────────┐
│ HD-2025-001                  │ ← Hiển thị value
└──────────────────────────────┘
```

### 3. Update Text Value

**File**: `ContractDetail.js`

```javascript
const handleTextFieldChange = (componentId, value) => {
  // Extract field ID từ component ID
  const fieldId = componentId.replace('highlight-', '');
  
  // Cập nhật state
  setTextFieldValues(prev => ({
    ...prev,
    [fieldId]: value
  }));
};

const handleTextFieldBlur = () => {
  // Tắt chế độ editing
  setEditingComponentId(null);
};
```

**Flow**:

```
1. User click vào text field
   ↓
2. handleComponentClick() được gọi
   ↓
3. setEditingComponentId(component.id)
   ↓
4. PDFViewer render input element
   ↓
5. User nhập text
   ↓
6. onChange → handleTextFieldChange()
   ↓
7. setTextFieldValues({ [fieldId]: value })
   ↓
8. User nhấn Enter hoặc click ra ngoài
   ↓
9. onBlur → handleTextFieldBlur()
   ↓
10. setEditingComponentId(null)
   ↓
11. PDFViewer render display mode với value mới
```

---

## IV. Convert Text Thành ImageBase64

### 1. Hàm Convert

**File**: `SignDialog.js`

```javascript
// Helper function to convert text to image base64
const convertTextToImageBase64 = (text, field) => {
  return new Promise((resolve, reject) => {
    try {
      // ═══════════════════════════════════════════════════
      // BƯỚC 1: TẠO CANVAS
      // ═══════════════════════════════════════════════════
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // ═══════════════════════════════════════════════════
      // BƯỚC 2: LẤY THÔNG TIN FONT TỪ FIELD
      // ═══════════════════════════════════════════════════
      const fontSize = field.fontSize || 13;
      const fontFamily = field.font || 'Times New Roman';
      const boxW = field.boxW || 200;
      const boxH = field.boxH || 30;
      
      // ═══════════════════════════════════════════════════
      // BƯỚC 3: SET CANVAS SIZE
      // ═══════════════════════════════════════════════════
      canvas.width = boxW;
      canvas.height = boxH;
      
      // ═══════════════════════════════════════════════════
      // BƯỚC 4: VẼ BACKGROUND (WHITE)
      // ═══════════════════════════════════════════════════
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // ═══════════════════════════════════════════════════
      // BƯỚC 5: SET TEXT STYLE
      // ═══════════════════════════════════════════════════
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'middle';  // Căn giữa theo chiều dọc
      ctx.textAlign = 'left';       // Căn trái
      
      // ═══════════════════════════════════════════════════
      // BƯỚC 6: VẼ TEXT
      // ═══════════════════════════════════════════════════
      const textY = canvas.height / 2;  // Vị trí Y ở giữa canvas
      ctx.fillText(text, 5, textY);     // X = 5px (padding trái)
      
      // ═══════════════════════════════════════════════════
      // BƯỚC 7: CONVERT CANVAS → BASE64
      // ═══════════════════════════════════════════════════
      const dataURL = canvas.toDataURL('image/png');
      // dataURL format: "data:image/png;base64,iVBORw0KGgo..."
      
      // ═══════════════════════════════════════════════════
      // BƯỚC 8: EXTRACT BASE64 (BỎ PREFIX)
      // ═══════════════════════════════════════════════════
      const base64 = extractBase64FromDataURL(dataURL);
      // base64 format: "iVBORw0KGgo..."
      
      resolve(base64);
    } catch (err) {
      console.error('Error converting text to image:', err);
      reject(err);
    }
  });
};

// Helper: Tách base64 thuần từ data URL
function extractBase64FromDataURL(dataURL) {
  if (!dataURL) return null;
  
  // Nếu đã là base64 thuần (không có prefix), trả về luôn
  if (!dataURL.includes(',')) return dataURL;
  
  // Tách phần base64 sau dấu phẩy
  const base64Part = dataURL.split(',')[1];
  return base64Part || null;
}
```


### 2. Minh Họa Quá Trình Convert

```
INPUT:
text = "HD-2025-001"
field = {
  fontSize: 13,
  font: "Times New Roman",
  boxW: 200,
  boxH: 30
}

BƯỚC 1-3: Tạo Canvas
┌────────────────────────────────┐
│                                │ ← Canvas 200x30px
│                                │
└────────────────────────────────┘

BƯỚC 4: Vẽ Background White
┌────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← White background
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└────────────────────────────────┘

BƯỚC 5-6: Vẽ Text
┌────────────────────────────────┐
│ HD-2025-001                    │ ← Text ở giữa, padding 5px
│                                │
└────────────────────────────────┘

BƯỚC 7: Convert to DataURL
"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."

BƯỚC 8: Extract Base64
"iVBORw0KGgoAAAANSUhEUgAA..."

OUTPUT:
base64 = "iVBORw0KGgoAAAANSUhEUgAA..."
```

### 3. Ví Dụ Thực Tế

```javascript
// Field từ database
const field = {
  id: 123,
  type: 4,              // CONTRACT_NO
  name: "Số hợp đồng",
  fontSize: 13,
  font: "Times New Roman",
  boxX: 100,
  boxY: 200,
  boxW: 200,
  boxH: 30,
  page: 1
};

// Text user đã nhập
const text = "HD-2025-001";

// Convert
const imageBase64 = await convertTextToImageBase64(text, field);

// Result
console.log(imageBase64);
// Output: "iVBORw0KGgoAAAANSUhEUgAAAMgAAAAeCAYAAABfk..."
```

---

## V. Quy Trình Ký

### 1. Validation Trước Khi Ký

**File**: `ContractDetail.js`

```javascript
const handleSignClick = () => {
  if (!recipientId) {
    showToast('Không tìm thấy thông tin người ký', 'warning');
    return;
  }

  // Kiểm tra recipient có quyền ký không (signType = 6)
  if (recipient && recipient.signType !== 6) {
    showToast('Người này không có quyền ký số', 'warning');
    return;
  }

  // ═══════════════════════════════════════════════════
  // KIỂM TRA TEXT FIELDS ĐÃ ĐIỀN CHƯA
  // ═══════════════════════════════════════════════════
  const requiredTextFields = fields.filter(field => 
    (field.type === 1 || field.type === 4) && 
    field.recipientId === recipientId
  );

  const unfilledFields = requiredTextFields.filter(field => {
    const value = textFieldValues[field.id] || '';
    
    // Contract number field (type 4) là bắt buộc
    if (field.type === 4 && !value.trim()) {
      return true;
    }
    
    // Text field (type 1) cũng nên được điền
    if (field.type === 1 && !value.trim()) {
      return true;
    }
    
    return false;
  });

  if (unfilledFields.length > 0) {
    const fieldNames = unfilledFields
      .map(f => f.name || (f.type === 4 ? 'Số hợp đồng' : 'Nội dung'))
      .join(', ');
    
    showToast(
      `Vui lòng điền đầy đủ thông tin cho các ô: ${fieldNames}`, 
      'warning', 
      5000
    );
    
    // Focus vào field đầu tiên chưa điền
    if (unfilledFields[0]) {
      setFocusComponentId(`highlight-${unfilledFields[0].id}`);
      if (unfilledFields[0].page) {
        setCurrentPage(unfilledFields[0].page);
      }
    }
    return;
  }

  // Mở SignDialog
  setShowSignDialog(true);
};
```

### 2. Quy Trình Ký Trong SignDialog

**File**: `SignDialog.js`

```javascript
const handleSign = async () => {
  // ═══════════════════════════════════════════════════
  // BƯỚC 1: VALIDATION
  // ═══════════════════════════════════════════════════
  const newErrors = {};

  if (!selectedCertId) {
    newErrors.certId = 'Vui lòng chọn chứng thư số';
  }

  if (!availableFields.length) {
    newErrors.field = 'Không có field nào để ký';
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  try {
    setLoading(true);
    setError(null);

    // ═══════════════════════════════════════════════════
    // BƯỚC 2: TẠO DANH SÁCH FIELDS CẦN XỬ LÝ
    // ═══════════════════════════════════════════════════
    const fieldsToProcess = [];

    // 2.1. Thêm TEXT FIELDS (type 1, 4) trước
    const sortedTextFields = [...textFields].sort(
      (a, b) => (a.ordering || 0) - (b.ordering || 0)
    );
    
    sortedTextFields.forEach(field => {
      const fieldValue = textFieldValues[field.id] || '';
      
      fieldsToProcess.push({
        field: field,
        type: 'text',
        value: fieldValue.trim()
      });
    });

    // 2.2. Thêm SIGNATURE FIELDS (type 3) sau
    const sortedSignatureFields = [...availableFields].sort(
      (a, b) => (a.ordering || 0) - (b.ordering || 0)
    );
    
    sortedSignatureFields.forEach(field => {
      fieldsToProcess.push({
        field: field,
        type: 'signature'
      });
    });

    // ═══════════════════════════════════════════════════
    // BƯỚC 3: GỌI API CHO TỪNG FIELD THEO THỨ TỰ
    // ═══════════════════════════════════════════════════
    for (const item of fieldsToProcess) {
      if (item.type === 'text') {
        // ───────────────────────────────────────────────
        // XỬ LÝ TEXT FIELD
        // ───────────────────────────────────────────────
        try {
          const field = item.field;
          const textValue = item.value;
          
          // 3.1. Convert text → image base64
          const textImageBase64 = await convertTextToImageBase64(
            textValue, 
            field
          );
          
          // 3.2. Tạo request data
          const certData = {
            certId: parseInt(selectedCertId, 10),
            imageBase64: textImageBase64, // Image từ text
            field: {
              id: field.id,
              page: field.page || 1,
              boxX: field.boxX || 0,
              boxY: field.boxY || 0,
              boxW: field.boxW || 100,
              boxH: field.boxH || 30
            },
            width: null,
            height: null,
            isTimestamp: "false",
            type: field.type // type 1 hoặc 4
          };

          // 3.3. Gọi API ký
          const certResponse = await contractService.certificate(
            recipientId, 
            certData
          );
          
          if (certResponse?.code !== 'SUCCESS') {
            throw new Error(
              certResponse?.message || 'Ký text field thất bại'
            );
          }
        } catch (err) {
          console.error('Error signing text field:', err);
          throw new Error(
            err.message || 'Ký text field thất bại. Vui lòng thử lại.'
          );
        }
      } else if (item.type === 'signature') {
        // ───────────────────────────────────────────────
        // XỬ LÝ SIGNATURE FIELD
        // ───────────────────────────────────────────────
        const field = item.field;
        
        // Tách base64 thuần từ data URL (bỏ prefix)
        const base64Only = imageBase64 
          ? extractBase64FromDataURL(imageBase64) 
          : null;
        
        const certData = {
          certId: parseInt(selectedCertId, 10),
          imageBase64: base64Only || null, // Ảnh đóng dấu (optional)
          field: {
            id: field.id,
            page: field.page || 1,
            boxX: field.boxX || 0,
            boxY: field.boxY || 0,
            boxW: field.boxW || 100,
            boxH: field.boxH || 30
          },
          width: null,
          height: null,
          isTimestamp: "false",
          type: 3 // DIGITAL_SIGN
        };

        const response = await contractService.certificate(
          recipientId, 
          certData
        );
        
        if (response?.code !== 'SUCCESS') {
          throw new Error(
            response?.message || 'Ký hợp đồng thất bại'
          );
        }
      }
    }

    // ═══════════════════════════════════════════════════
    // BƯỚC 4: PHÊ DUYỆT LUỒNG
    // ═══════════════════════════════════════════════════
    const approvalRes = await contractService.approvalProcess(recipientId);
    
    if (approvalRes?.code !== 'SUCCESS') {
      throw new Error(
        approvalRes?.message || 'Phê duyệt hợp đồng thất bại'
      );
    }

    // ═══════════════════════════════════════════════════
    // BƯỚC 5: THÀNH CÔNG
    // ═══════════════════════════════════════════════════
    if (onSigned) {
      onSigned({ success: true });
    }
    
    handleClose();
  } catch (err) {
    console.error('Error signing contract:', err);
    setError(
      err.response?.data?.message || 
      err.message || 
      'Có lỗi xảy ra khi ký hợp đồng'
    );
  } finally {
    setLoading(false);
  }
};
```


### 3. Luồng Hoạt Động Chi Tiết

```
┌─────────────────────────────────────────────────────────┐
│  1. User điền text vào các text fields trên PDF         │
│     - Click vào field → inline editing                  │
│     - Nhập text → lưu vào textFieldValues state         │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. User click "Ký hợp đồng"                            │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  3. Validation: Kiểm tra tất cả text fields đã điền     │
│     - Contract number fields (type 4): bắt buộc         │
│     - Text fields (type 1): nên điền                    │
│     - Nếu thiếu → focus vào field đầu tiên              │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. Mở SignDialog                                       │
│     - Bước 1: Chọn ảnh đóng dấu (optional)             │
│     - Bước 2: Chọn chứng thư số                        │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. User click "Xác nhận ký"                            │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  6. Tạo danh sách fields cần xử lý                      │
│     - Text fields (type 1, 4) - sắp xếp theo ordering   │
│     - Signature fields (type 3) - sắp xếp theo ordering │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  7. Loop qua từng field theo thứ tự                     │
└────────────────────┬────────────────────────────────────┘
                     ▼
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  TEXT FIELD      │    │  SIGNATURE FIELD │
└────────┬─────────┘    └────────┬─────────┘
         ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│  8a. Xử lý Text Field:                                  │
│      - Lấy text value từ textFieldValues                │
│      - Convert text → image base64                      │
│      - Gọi API certificate với imageBase64              │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────────────────────────────────────────────┐
│  8b. Xử lý Signature Field:                             │
│      - Lấy ảnh đóng dấu (nếu có)                        │
│      - Gọi API certificate với imageBase64 (optional)   │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  9. Sau khi xử lý hết tất cả fields                     │
│     - Gọi API approvalProcess(recipientId)              │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│  10. Thành công                                         │
│      - Hiển thị toast success                           │
│      - Gọi onSigned() callback                          │
│      - Đóng SignDialog                                  │
│      - Navigate về trang chi tiết                       │
└─────────────────────────────────────────────────────────┘
```

### 4. API Request Format

#### **A. Text Field Request**

```json
{
  "certId": 123,
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "field": {
    "id": 456,
    "page": 1,
    "boxX": 100,
    "boxY": 200,
    "boxW": 200,
    "boxH": 30
  },
  "width": null,
  "height": null,
  "isTimestamp": "false",
  "type": 4
}
```

**Giải thích**:
- `certId`: ID chứng thư số đã chọn
- `imageBase64`: Image được render từ text (không có prefix)
- `field`: Thông tin vị trí field trên PDF
- `type`: 1 (TEXT) hoặc 4 (CONTRACT_NO)

#### **B. Signature Field Request**

```json
{
  "certId": 123,
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "field": {
    "id": 789,
    "page": 1,
    "boxX": 100,
    "boxY": 300,
    "boxW": 150,
    "boxH": 80
  },
  "width": null,
  "height": null,
  "isTimestamp": "false",
  "type": 3
}
```

**Giải thích**:
- `certId`: ID chứng thư số đã chọn
- `imageBase64`: Ảnh đóng dấu (optional, có thể null)
- `field`: Thông tin vị trí field trên PDF
- `type`: 3 (DIGITAL_SIGN)

---

## VI. Tổng Kết

### 1. Các Bước Chính

| Bước | Mô tả | Component | Thư viện |
|------|-------|-----------|----------|
| 1 | Hiển thị text fields trên PDF | ContractDetail.js | React |
| 2 | Inline editing text | PDFViewer.js | HTML input |
| 3 | Lưu text value vào state | ContractDetail.js | React useState |
| 4 | Validation trước khi ký | ContractDetail.js | - |
| 5 | Convert text → image | SignDialog.js | HTML5 Canvas |
| 6 | Ký từng field theo thứ tự | SignDialog.js | contractService API |
| 7 | Phê duyệt luồng | SignDialog.js | contractService API |

### 2. Công Thức Quan Trọng

```javascript
// 1. Tạo canvas với kích thước field
canvas.width = field.boxW;
canvas.height = field.boxH;

// 2. Vẽ background white
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 3. Set font style
ctx.font = `${field.fontSize}px ${field.font}`;
ctx.fillStyle = 'black';
ctx.textBaseline = 'middle';
ctx.textAlign = 'left';

// 4. Vẽ text ở giữa canvas
const textY = canvas.height / 2;
ctx.fillText(text, 5, textY);

// 5. Convert canvas → base64
const dataURL = canvas.toDataURL('image/png');
const base64 = dataURL.split(',')[1];
```

### 3. Thứ Tự Xử Lý Fields

**Quan trọng**: Fields phải được xử lý theo thứ tự:

1. **Text fields trước** (type 1, 4) - sắp xếp theo `ordering`
2. **Signature fields sau** (type 3) - sắp xếp theo `ordering`

**Lý do**: 
- Text fields cần được convert và ký trước
- Signature fields ký sau cùng
- Đảm bảo thứ tự hiển thị đúng trên PDF

### 4. Điểm Quan Trọng

✅ **Inline editing** chỉ hoạt động ở chế độ `type='sign'`

✅ **Text fields** (type 1, 4) không bị locked để có thể click

✅ **Signature fields** (type 3) bị locked, không edit được

✅ **Contract number field** (type 4) là bắt buộc phải điền

✅ **Canvas size** phải khớp với field size (boxW x boxH)

✅ **Text position** ở giữa canvas theo chiều dọc, padding 5px trái

✅ **Base64 format**: Phải bỏ prefix "data:image/png;base64," trước khi gửi API

✅ **Ordering**: Fields được xử lý tuần tự theo ordering

✅ **Approval**: Phải gọi `approvalProcess()` sau khi ký hết tất cả fields

### 5. Best Practices

✅ **Validate đầy đủ** trước khi mở SignDialog

✅ **Focus vào field thiếu** để user dễ điền

✅ **Hiển thị placeholder** rõ ràng cho text fields

✅ **Auto focus** khi vào edit mode

✅ **Enter/Escape** để thoát edit mode nhanh

✅ **Stop propagation** để tránh conflict với drag/drop

✅ **Error handling** cho từng field riêng biệt

✅ **Loading state** để user biết đang xử lý

### 6. Ví Dụ Hoàn Chỉnh

```javascript
// Field từ database
const field = {
  id: 123,
  type: 4,
  name: "Số hợp đồng",
  fontSize: 13,
  font: "Times New Roman",
  boxX: 100,
  boxY: 200,
  boxW: 200,
  boxH: 30,
  page: 1,
  ordering: 1,
  recipientId: 456
};

// User nhập text
textFieldValues[123] = "HD-2025-001";

// Khi ký:
// 1. Convert text → image
const imageBase64 = await convertTextToImageBase64("HD-2025-001", field);
// Result: "iVBORw0KGgoAAAANSUhEUgAA..."

// 2. Gọi API
const certData = {
  certId: 789,
  imageBase64: imageBase64,
  field: {
    id: 123,
    page: 1,
    boxX: 100,
    boxY: 200,
    boxW: 200,
    boxH: 30
  },
  width: null,
  height: null,
  isTimestamp: "false",
  type: 4
};

const response = await contractService.certificate(456, certData);
// Response: { code: "SUCCESS", message: "Ký thành công" }
```

---

**📅 Ngày tạo**: 2025-01-06  
**📝 Version**: 1.0  
**👨‍💻 Tác giả**: Kiro AI Assistant

