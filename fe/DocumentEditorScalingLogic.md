# Logic Scaling trong DocumentEditor

## Tổng quan

DocumentEditor quản lý 2 hệ tọa độ khác nhau để đảm bảo components luôn hiển thị đúng vị trí trên PDF bất kể kích thước màn hình:

1. **Tọa độ chuẩn hóa (Normalized Coordinates)** - scale = 1.0
2. **Tọa độ hiển thị (Display Coordinates)** - scale = currentScale

## Các hệ tọa độ

### 1. Tọa độ chuẩn hóa (Normalized - scale=1.0)
- Là tọa độ gốc trên PDF với kích thước thực 100%
- Được lưu trong database: `boxX`, `boxY`, `boxW`, `boxH`
- Không phụ thuộc vào kích thước màn hình hay zoom level
- Đây là "source of truth" cho vị trí component

### 2. Tọa độ hiển thị (Scaled)
- Là tọa độ pixel thực tế trên màn hình
- Được lưu trong `component.properties`: `x`, `y`, `width`, `height`
- Phụ thuộc vào `currentScale` (tỷ lệ zoom của PDF)
- Dùng để render component lên màn hình

## Quy trình xử lý dữ liệu

### 1. Load từ Database → DocumentComponents

**Vị trí code:** useEffect với dependency `[fieldsData, currentScale, lockedFieldIds]`

```javascript
// Database trả về tọa độ chuẩn hóa (scale=1.0)
const field = {
    boxX: 400,    // Tọa độ thực trên PDF
    boxY: 200,
    boxW: 100,
    boxH: 30
};

// Nhân với currentScale để có tọa độ hiển thị
const scaledX = (field.boxX || 0) * currentScale;  // 400 * 0.7 = 280px
const scaledY = (field.boxY || 0) * currentScale;  // 200 * 0.7 = 140px
const scaledW = (field.boxW || 100) * currentScale; // 100 * 0.7 = 70px
const scaledH = (field.boxH || 30) * currentScale;  // 30 * 0.7 = 21px

// Lưu vào component.properties để render
component.properties = {
    x: scaledX,
    y: scaledY,
    width: scaledW,
    height: scaledH
};
```

**Lưu ý quan trọng:**
- Tọa độ chuẩn hóa được lưu vào `normalizedFieldsRef.current` để dùng cho re-scaling
- Chỉ load một lần duy nhất khi component mount (kiểm tra bằng `hasLoadedFieldsRef`)

### 2. Re-scaling khi currentScale thay đổi

**Vị trí code:** useEffect với dependency `[currentScale]`

Khi người dùng zoom hoặc resize màn hình, `currentScale` thay đổi:

```javascript
// Lấy tọa độ chuẩn hóa từ ref
const normalizedField = normalizedFieldsRef.current.find(nf => nf.id === component.fieldId);

// Tính lại tọa độ hiển thị với scale mới
const scaledX = normalizedField.boxX * currentScale;
const scaledY = normalizedField.boxY * currentScale;
const scaledW = normalizedField.boxW * currentScale;
const scaledH = normalizedField.boxH * currentScale;

// Cập nhật component.properties
component.properties = {
    ...component.properties,
    x: scaledX,
    y: scaledY,
    width: scaledW,
    height: scaledH
};
```

**Tối ưu hóa:**
- Chỉ re-scale khi thực sự cần thiết (kiểm tra tolerance 0.1px)
- Chỉ re-scale components có `fieldId` (từ database)

### 3. Lưu về Database

**Vị trí code:** useEffect với dependency `[documentComponents, contractId, documentId, currentPage, currentScale, onFieldsChange]`

```javascript
// Component.properties chứa tọa độ hiển thị (đã scale)
const component = {
    properties: {
        x: 280,      // Tọa độ trên màn hình (scale=0.7)
        y: 140,
        width: 70,
        height: 21
    }
};

// Chia cho currentScale để có tọa độ chuẩn hóa
const normalizedX = (component.properties.x || 0) / currentScale;  // 280 / 0.7 = 400px
const normalizedY = (component.properties.y || 0) / currentScale;  // 140 / 0.7 = 200px
const normalizedW = (component.properties.width || 100) / currentScale; // 70 / 0.7 = 100px
const normalizedH = (component.properties.height || 30) / currentScale; // 21 / 0.7 = 30px

// Gửi tọa độ chuẩn hóa về database
const field = {
    boxX: normalizedX,
    boxY: normalizedY,
    boxW: normalizedW,
    boxH: normalizedH
};
```

## Ví dụ cụ thể

### Scenario: Màn hình nhỏ (scale = 0.7)

**PDF thực tế:** width = 800px (scale = 1.0)  
**PDF hiển thị:** width = 560px (scale = 0.7)

#### Bước 1: Load từ database
```javascript
// Database
field.boxX = 400  // Vị trí thực ở giữa PDF (50%)

// Load vào component
scaledX = 400 * 0.7 = 280px  // Vị trí hiển thị trên màn hình
```

#### Bước 2: User kéo component sang phải 70px
```javascript
// Sau khi drag
component.properties.x = 280 + 70 = 350px  // Tọa độ mới trên màn hình
```

#### Bước 3: Lưu về database
```javascript
// Normalize lại
normalizedX = 350 / 0.7 = 500px  // Tọa độ thực trên PDF

// Lưu vào database
field.boxX = 500  // Vị trí thực mới (62.5% của PDF width)
```

#### Bước 4: User zoom to 100% (scale = 1.0)
```javascript
// Re-scale từ normalized coordinates
scaledX = 500 * 1.0 = 500px  // Component hiển thị đúng vị trí 62.5%
```

## Các trường hợp đặc biệt

### 1. Component mới tạo (chưa có fieldId)
- Không có trong `normalizedFieldsRef`
- Không được re-scale khi currentScale thay đổi
- Tọa độ được tính trực tiếp từ `getCenteredPosition()`

### 2. Locked components (từ đối tác trước)
- Vẫn được re-scale khi currentScale thay đổi
- Không thể drag/resize
- Không được lưu về database (filtered out)

### 3. Drag & Drop
- Tọa độ mới được tính relative với page container
- Lưu trực tiếp vào `component.properties` (tọa độ hiển thị)
- Sẽ được normalize khi lưu về database

### 4. Resize
- Kích thước mới được tính từ delta mouse movement
- Lưu trực tiếp vào `component.properties` (kích thước hiển thị)
- Sẽ được normalize khi lưu về database

## Tại sao cần 2 hệ tọa độ?

### Vấn đề nếu chỉ dùng 1 hệ tọa độ:

**Scenario:** Component ở vị trí 50% của PDF width

- **Màn hình lớn (scale=1.0):** PDF width = 800px → Component x = 400px ✓
- **Màn hình nhỏ (scale=0.7):** PDF width = 560px → Component x = 400px ✗ (vượt quá 50%)

### Giải pháp với 2 hệ tọa độ:

- **Database lưu:** x = 400px (tọa độ chuẩn, scale=1.0)
- **Màn hình lớn:** x = 400 * 1.0 = 400px (50% của 800px) ✓
- **Màn hình nhỏ:** x = 400 * 0.7 = 280px (50% của 560px) ✓

## Flow chart tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Source of Truth)                │
│              boxX, boxY, boxW, boxH (scale=1.0)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Load (multiply by currentScale)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  normalizedFieldsRef.current                 │
│         Store normalized coords for re-scaling later         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Scale to display
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              component.properties (Display)                  │
│         x, y, width, height (scale=currentScale)            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Drag       │  │   Resize     │  │  Re-scale    │     │
│  │  (update x,y)│  │ (update w,h) │  │ (on zoom)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Save (divide by currentScale)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Updated)                        │
│              boxX, boxY, boxW, boxH (scale=1.0)             │
└─────────────────────────────────────────────────────────────┘
```

## Best Practices

1. **Luôn normalize trước khi lưu database**
   - Đảm bảo tọa độ không phụ thuộc vào màn hình hiện tại

2. **Luôn scale khi load từ database**
   - Đảm bảo component hiển thị đúng vị trí tương đối

3. **Lưu normalized coordinates vào ref**
   - Cho phép re-scale nhanh khi currentScale thay đổi

4. **Kiểm tra tolerance khi re-scale**
   - Tránh re-render không cần thiết (floating point precision)

5. **Chỉ re-scale components có fieldId**
   - Components mới tạo chưa cần re-scale

## Debugging Tips

### Kiểm tra tọa độ đang sai:
```javascript
console.log('Current scale:', currentScale);
console.log('Display coords:', component.properties.x, component.properties.y);
console.log('Normalized coords:', component.properties.x / currentScale, component.properties.y / currentScale);
console.log('Expected normalized:', normalizedFieldsRef.current.find(nf => nf.id === component.fieldId));
```

### Kiểm tra re-scaling:
```javascript
console.log('Needs rescaling:', Math.abs(comp.properties.x - expectedX) > 0.1);
console.log('Current X:', comp.properties.x);
console.log('Expected X:', normalizedField.boxX * currentScale);
```

### Kiểm tra save:
```javascript
console.log('Saving to DB:');
console.log('Display:', component.properties.x);
console.log('Normalized:', component.properties.x / currentScale);
console.log('Current scale:', currentScale);
```
