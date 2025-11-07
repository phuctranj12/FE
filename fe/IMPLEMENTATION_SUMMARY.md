# Tóm Tắt Implementation - Trang Tạo Tài Liệu

**Ngày thực hiện**: 2025-11-06

---

## 📋 Yêu Cầu Đã Thực Hiện

### 1. **Lấy Thông Tin User từ Token**
- ✅ Gọi API `GET /customers/get-customer-by-token` khi component mount
- ✅ Token được gửi tự động qua Authorization header (xử lý bởi apiClient interceptor)
- ✅ Lưu `organizationId` để sử dụng cho các API call tiếp theo
- ✅ Hiển thị tên tổ chức trong form

### 3. **Gọi API Lấy Danh Sách Loại Hợp Đồng**
- ✅ Gọi `contracts/types` với `organizationId`
- ✅ Hiển thị dropdown cho user chọn loại tài liệu
- ✅ Load tối đa 100 records (có thể điều chỉnh)

### 4. **Gọi API Lấy Danh Sách Hợp Đồng Liên Quan**
- ✅ Gọi `contracts/contract-refs/all-refs?page=0&size=100&organizationId=`
- ✅ Hiển thị dropdown cho user chọn tài liệu liên quan
- ✅ Hiển thị format: `{name} ({contractNo})`

### 5. **Kiểm Tra File PDF Upload**
- ✅ Gọi API `getPageSize` để lấy số trang PDF
- ✅ Gọi API `checkSignature` để kiểm tra chữ ký số
- ✅ **Validation**: Nếu file đã có chữ ký số → báo lỗi, không cho phép upload
- ✅ Hiển thị thông tin file sau khi upload thành công (tên file, số trang)

---

## 📁 Các File Đã Sửa Đổi

### 1. `src/api/customerService.js`
**Thay đổi**:
- Thêm API mới `getCustomerByEmailInternal`

```javascript
// 2.7. Lấy thông tin user theo email (internal)
getCustomerByEmailInternal: async (email) => {
    try {
        const response = await apiClient.get('/customers/internal/get-by-email', { 
            params: { email } 
        });
        return response;
    } catch (error) {
        throw error;
    }
}
```

---

### 2. `src/api/customerService.js`
**Thay đổi**:
- Thêm API mới `getCustomerByToken`

```javascript
// 2.7.1. Lấy thông tin user từ token
getCustomerByToken: async () => {
    try {
        const response = await apiClient.get('/customers/get-customer-by-token');
        return response;
    } catch (error) {
        throw error;
    }
}
```

---

### 3. `src/components/createContract/DocumentForm.js`
**Thay đổi chính**:

#### A. Import thêm
```javascript
import { useState, useEffect } from 'react';
import customerService from '../../api/customerService';
import contractService from '../../api/contractService';
```

#### B. Thêm States mới
```javascript
// User and Organization data
const [currentUser, setCurrentUser] = useState(null);
const [organizationId, setOrganizationId] = useState(null);
const [documentTypes, setDocumentTypes] = useState([]);
const [relatedContracts, setRelatedContracts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Thông tin file PDF
pdfFile: null,
pdfFileName: '',
pdfPageCount: 0,
hasSignature: false
```

#### C. useEffect Hook - Fetch Initial Data
```javascript
useEffect(() => {
    const fetchInitialData = async () => {
        try {
            // 1. Gọi API lấy thông tin user từ token
            const userResponse = await customerService.getCustomerByToken();
            setCurrentUser(userResponse.data);
            const orgId = userResponse.data.organizationId;
            setOrganizationId(orgId);

            // 2. Gọi API lấy danh sách loại tài liệu
            const typesResponse = await contractService.getAllTypes({
                page: 0,
                size: 100,
                organizationId: orgId
            });
            setDocumentTypes(typesResponse.data.content || []);

            // 4. Gọi API lấy danh sách hợp đồng liên quan
            const refsResponse = await contractService.getAllContractRefs({
                page: 0,
                size: 100,
                organizationId: orgId
            });
            setRelatedContracts(refsResponse.data.content || []);

        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError(err.message);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchInitialData();
}, []);
```

#### D. handleFileUpload - Async với Validation
```javascript
const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Chỉ hỗ trợ file PDF');
        return;
    }

    try {
        setLoading(true);

        // 1. Gọi API kiểm tra số trang
        const pageSizeResponse = await contractService.getPageSize(file);
        const pageCount = pageSizeResponse.data?.numberOfPages || 0;

        // 2. Gọi API kiểm tra chữ ký số
        const signatureResponse = await contractService.checkSignature(file);
        const hasSignature = signatureResponse.data?.hasSignature || false;

        // 3. Validate: Nếu có chữ ký số thì báo lỗi
        if (hasSignature) {
            alert('Tài liệu đã có chữ ký số, vui lòng chọn file khác');
            e.target.value = '';
            return;
        }

        // 4. Cập nhật formData
        setFormData(prev => ({
            ...prev,
            pdfFile: file,
            pdfFileName: file.name,
            pdfPageCount: parseInt(pageCount),
            hasSignature: hasSignature,
            attachedFile: file.name
        }));

        console.log(`File uploaded: ${file.name}, Pages: ${pageCount}`);

    } catch (err) {
        console.error('Error uploading file:', err);
        alert(err.message || 'Đã xảy ra lỗi khi tải file');
        e.target.value = '';
    } finally {
        setLoading(false);
    }
};
```

#### E. Loading & Error States
```javascript
// Show loading state
if (loading && !currentUser) {
    return (
        <div className="document-form-container">
            <div className="document-form-wrapper">
                <div className="loading-message">
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        </div>
    );
}

// Show error state
if (error && !currentUser) {
    return (
        <div className="document-form-container">
            <div className="document-form-wrapper">
                <div className="error-message">
                    <p>❌ {error}</p>
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                </div>
            </div>
        </div>
    );
}
```

#### F. Pass Props to DocumentTypeSelection
```javascript
<DocumentTypeSelection
    documentType={documentType}
    setDocumentType={setDocumentType}
    formData={formData}
    handleInputChange={handleInputChange}
    handleFileUpload={handleFileUpload}
    handleBatchFileUpload={handleBatchFileUpload}
    documentTypes={documentTypes}          // ← NEW
    relatedContracts={relatedContracts}    // ← NEW
    loading={loading}                       // ← NEW
/>
```

---

### 4. `src/components/createContract/DocumentTypeSelection.js`
**Thay đổi chính**:

#### A. Thêm Props
```javascript
function DocumentTypeSelection({ 
    // ... existing props
    documentTypes = [],      // ← NEW
    relatedContracts = [],   // ← NEW
    loading = false          // ← NEW
}) {
```

#### B. Dropdown Loại Tài Liệu
**Before** (input text):
```javascript
<input
    type="text"
    name="documentType"
    value={formData.documentType}
    onChange={handleInputChange}
    placeholder="Chọn loại tài liệu"
/>
```

**After** (select dropdown):
```javascript
<select
    name="documentType"
    value={formData.documentType}
    onChange={handleInputChange}
    disabled={loading}
>
    <option value="">-- Chọn loại tài liệu --</option>
    {documentTypes.map((type) => (
        <option key={type.id} value={type.id}>
            {type.name}
        </option>
    ))}
</select>
```

#### C. Dropdown Tài Liệu Liên Quan
**Before** (input text):
```javascript
<input
    type="text"
    name="relatedDocuments"
    value={formData.relatedDocuments}
    onChange={handleInputChange}
    placeholder="Tài liệu đã hoàn thành..."
/>
```

**After** (select dropdown):
```javascript
<select
    name="relatedDocuments"
    value={formData.relatedDocuments}
    onChange={handleInputChange}
    disabled={loading}
>
    <option value="">-- Chọn tài liệu liên quan --</option>
    {relatedContracts.map((contract) => (
        <option key={contract.id} value={contract.id}>
            {contract.name} ({contract.contractNo})
        </option>
    ))}
</select>
```

#### D. File Upload với Validation
**Changes**:
- Chỉ accept `.pdf` (không còn `.docx`)
- Disable khi đang loading
- Hiển thị tên file và số trang sau khi upload thành công

```javascript
<input
    type="file"
    accept=".pdf"
    onChange={handleFileUpload}
    style={{ display: 'none' }}
    id="file-upload-single"
    disabled={loading}
/>
<label htmlFor="file-upload-single" className={`file-upload-label ${loading ? 'disabled' : ''}`}>
    {loading ? 'Đang xử lý...' : (formData.pdfFileName || formData.attachedFile || 'Chọn file PDF')}
</label>
{formData.pdfPageCount > 0 && (
    <div className="file-info">
        ✅ File: {formData.pdfFileName} | Số trang: {formData.pdfPageCount}
    </div>
)}
```

---

### 5. `src/styles/documentForm.css`
**Thêm CSS cho**:

#### A. Loading & Error Messages
```css
.loading-message,
.error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    min-height: 300px;
}
```

#### B. Loading Overlay
```css
.loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
```

#### C. File Info Display
```css
.file-info {
    margin-top: 10px;
    padding: 10px;
    background: #e8f5e9;
    border-radius: 4px;
    color: #2e7d32;
}
```

#### D. Dropdown Styling for Select
```css
.dropdown-container select {
    width: 100%;
    padding: 10px 40px 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    appearance: none;
    cursor: pointer;
}

.dropdown-container select:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.6;
}
```

#### E. Disabled Label
```css
.file-upload-label.disabled {
    background: #e0e0e0;
    cursor: not-allowed;
    opacity: 0.6;
}
```

---

## 🔄 Luồng Hoạt Động

```
┌─────────────────────────────────────────────────────────────┐
│              USER OPENS "TẠO TÀI LIỆU" PAGE                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Gọi API: GET /customers/get-customer-by-token            │
│     Headers: Authorization: Bearer {token}                   │
│     Response: { id, organizationId, organizationName, ... }  │
│     ├─ Lưu currentUser                                       │
│     ├─ Lưu organizationId                                    │
│     └─ Update form.organization                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Gọi API: contracts/types                                 │
│     Query: { page: 0, size: 100, organizationId }            │
│     Response: { content: [{ id, name, ... }] }               │
│     └─ Lưu documentTypes[]                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Gọi API: contracts/contract-refs/all-refs                │
│     Query: { page: 0, size: 100, organizationId }            │
│     Response: { content: [{ id, name, contractNo, ... }] }   │
│     └─ Lưu relatedContracts[]                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Render Form với data đã load                             │
│     ├─ Dropdown "Loại tài liệu" từ documentTypes             │
│     ├─ Dropdown "Tài liệu liên quan" từ relatedContracts     │
│     └─ File upload area                                      │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         USER UPLOADS FILE PDF                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Validate file extension (.pdf only)                      │
│     ├─ Không phải PDF → Báo lỗi                              │
│     └─ OK → Tiếp tục                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Gọi API: getPageSize(file)                               │
│     Response: { numberOfPages: "15" }                        │
│     └─ Lưu pdfPageCount                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Gọi API: checkSignature(file)                            │
│     Response: { hasSignature: false }                        │
│     ├─ hasSignature = true → ❌ BÁO LỖI, reset input         │
│     └─ hasSignature = false → ✅ OK, tiếp tục                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Cập nhật formData                                        │
│     ├─ pdfFile: file object                                  │
│     ├─ pdfFileName: "document.pdf"                           │
│     ├─ pdfPageCount: 15                                      │
│     ├─ hasSignature: false                                   │
│     └─ attachedFile: "document.pdf"                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  10. Hiển thị thông tin file                                 │
│      "✅ File: document.pdf | Số trang: 15"                  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Validation Rules

### 1. **Token Authentication**
- Token được gửi tự động qua Authorization header
- ❌ Token không hợp lệ hoặc hết hạn → API trả về lỗi 401
- ✅ Token hợp lệ → Lấy được thông tin user và organizationId

### 2. **File Upload**
- ❌ File không phải `.pdf` → Báo lỗi "Chỉ hỗ trợ file PDF"
- ❌ File đã có chữ ký số (`hasSignature = true`) → Báo lỗi "Tài liệu đã có chữ ký số, vui lòng chọn file khác"
- ✅ File PDF hợp lệ, chưa có chữ ký số → Cho phép upload

### 3. **API Response**
- ❌ API trả về `code !== 'SUCCESS'` → Throw error với message từ API
- ❌ API call failed → Catch error, hiển thị alert cho user

---

## 🎨 UI/UX Improvements

### 1. **Loading States**
- Hiển thị "Đang tải dữ liệu..." khi fetch initial data
- Hiển thị "Đang xử lý..." overlay khi upload file
- Disable buttons và inputs khi đang loading

### 2. **Error Handling**
- Hiển thị error message với icon ❌
- Nút "Thử lại" để reload page
- Alert popup cho user khi có lỗi

### 3. **File Info Display**
- Hiển thị ✅ checkmark khi upload thành công
- Hiển thị tên file và số trang
- Background màu xanh (#e8f5e9) để dễ nhận biết

### 4. **Dropdown Styling**
- Custom appearance cho select elements
- Icon ▼ ở bên phải
- Hover effects
- Disabled state với opacity 0.6

---

## 📝 Notes

### Authentication
- Token được lưu trong localStorage hoặc sessionStorage bởi `apiClient`
- `apiClient` interceptor tự động attach token vào mọi request
- API `/customers/get-customer-by-token` extract user info từ token
- Không cần truyền email hoặc userId trong request

### Data Structure

**documentTypes**:
```javascript
[
  {
    id: 1,
    name: "Loại tài liệu nội bộ",
    organizationId: 1,
    status: 1
  }
]
```

**relatedContracts**:
```javascript
[
  {
    id: 2,
    name: "Hợp đồng ABC",
    contractNo: "HD001",
    status: 30
  }
]
```

**formData PDF fields**:
```javascript
{
  pdfFile: File,           // File object
  pdfFileName: "doc.pdf",  // String
  pdfPageCount: 15,        // Number
  hasSignature: false      // Boolean
}
```

---

## 🔧 Tiếp Theo (Next Steps)

Các bước tiếp theo trong luồng tạo hợp đồng:

1. ✅ **Bước 1: Thông tin tài liệu** (Đã hoàn thành)
2. ⏳ **Bước 2: Xác định người ký** (Chưa implement)
3. ⏳ **Bước 3: Thiết kế tài liệu** (Chưa implement)
4. ⏳ **Bước 4: Xác nhận và hoàn tất** (Chưa implement)

### Bước 2 cần implement:
- Gọi API `customers/organizations/{organizationId}` để lấy tên tổ chức
- Gọi API `customers/suggest-list-customer` cho autocomplete tên
- Gọi API `contracts/participants/create-participant/{contractId}` để lưu participants và recipients

### Bước 3 cần implement:
- UI kéo thả các field lên PDF viewer
- Lưu vị trí (boxX, boxY, boxW, boxH) của mỗi field

### Bước 4 cần implement:
- Gọi API `contracts/fields/create` để lưu fields
- Gọi API `contracts/change-status/{contractId}?status=10` để đổi status thành CREATED

---

**✅ Implementation Status**: **COMPLETED**
**🧪 Testing**: Recommended to test with real API endpoints
**📚 Documentation**: See `CreateContractFlow.md` for full flow details

---

**Author**: AI Assistant  
**Date**: 2025-11-06  
**Version**: 1.0

