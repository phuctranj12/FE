# Update Implementation - Sử dụng Token thay vì Email

**Ngày cập nhật**: 2025-11-06

---

## ✅ Thay Đổi Chính

### 1. **API mới: `getCustomerByToken`**

**File**: `src/api/customerService.js`

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

**Endpoint**: `GET /customers/get-customer-by-token`
- ✅ Token tự động gửi qua Authorization header
- ✅ Không cần truyền email hay userId
- ✅ Trả về thông tin user đầy đủ (id, email, organizationId, ...)

---

### 2. **Cập nhật DocumentForm.js**

**File**: `src/components/createContract/DocumentForm.js`

#### Trước (OLD):
```javascript
// 1. Lấy email từ sessionStorage
const email = sessionStorage.getItem('email');
if (!email) {
    throw new Error('Không tìm thấy thông tin đăng nhập...');
}

// 2. Gọi API với email
const userResponse = await customerService.getCustomerByEmailInternal(email);
```

#### Sau (NEW):
```javascript
// 1. Gọi API lấy thông tin user từ token
const userResponse = await customerService.getCustomerByToken();
```

**Lợi ích**:
- ✅ Đơn giản hơn (1 bước thay vì 2)
- ✅ An toàn hơn (không cần lưu email trong sessionStorage)
- ✅ Token-based authentication là best practice

---

## 🔄 Luồng Mới

```
User mở trang "Tạo tài liệu"
    ↓
Gọi API: GET /customers/get-customer-by-token
    ├── Headers: Authorization: Bearer {token}
    └── Response: { id, organizationId, organizationName, ... }
    ↓
Lưu currentUser & organizationId
    ↓
Gọi API lấy document types (với organizationId)
    ↓
Gọi API lấy contract refs (với organizationId)
    ↓
Render form
    ↓
User upload PDF
    ↓
Kiểm tra file (getPageSize, checkSignature)
    ↓
Validation & hiển thị thông tin
```

---

## 🔐 Authentication Flow

### Token được xử lý ở đâu?

1. **apiClient.js** (interceptor):
   ```javascript
   // Request interceptor
   apiClient.interceptors.request.use((config) => {
       const token = localStorage.getItem('token'); // hoặc sessionStorage
       if (token) {
           config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
   });
   ```

2. **Backend** extract user info từ token:
   - Decode JWT token
   - Lấy userId từ token payload
   - Query database để lấy thông tin đầy đủ
   - Trả về response

---

## 📊 So Sánh

| Aspect | OLD (Email) | NEW (Token) |
|--------|-------------|-------------|
| **API Call** | `getCustomerByEmailInternal(email)` | `getCustomerByToken()` |
| **Request Param** | `?email=user@example.com` | (None) |
| **Auth Header** | Bearer token | Bearer token |
| **SessionStorage** | Cần lưu `email` | Không cần |
| **Steps** | 2 (lấy email → API call) | 1 (API call) |
| **Security** | Email có thể bị modify | Token-based, secure |

---

## ✅ Checklist

- [x] Thêm API `getCustomerByToken` vào `customerService.js`
- [x] Cập nhật `DocumentForm.js` để sử dụng API mới
- [x] Xóa logic lấy email từ sessionStorage
- [x] Update documentation
- [x] Test không có lỗi lint

---

## 🧪 Testing

### Test Cases:

1. **Token hợp lệ**:
   - ✅ API trả về thông tin user
   - ✅ OrganizationId được lưu
   - ✅ Form hiển thị đúng

2. **Token không hợp lệ hoặc hết hạn**:
   - ❌ API trả về 401 Unauthorized
   - ❌ Hiển thị error message
   - ❌ User cần đăng nhập lại

3. **Không có token**:
   - ❌ API call failed
   - ❌ Hiển thị error: "Đã xảy ra lỗi khi tải dữ liệu"

---

## 📝 API Response Example

```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "organizationId": 5,
    "organizationName": "Công ty ABC",
    "roleId": 2,
    "roleName": "Manager",
    "status": 1
  }
}
```

---

## 🎯 Kết Luận

✅ **Đã hoàn thành**: Chuyển từ email-based sang token-based authentication

🔐 **Security**: Tăng cường bảo mật bằng cách sử dụng JWT token

📦 **Code Quality**: Code đơn giản hơn, ít dependency hơn

🚀 **Ready**: Sẵn sàng để test và deploy

---

**Author**: AI Assistant  
**Date**: 2025-11-06  
**Version**: 2.0 (Updated from 1.0)

