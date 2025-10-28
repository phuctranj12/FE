# eContact API Documentation

## Tổng quan

Hệ thống eContact là một microservices architecture với các service chính:
- **ec-auth-srv**: Service xác thực và phân quyền
- **ec-customer-srv**: Service quản lý thông tin khách hàng, vai trò, tổ chức
- **ec-gateway-srv**: API Gateway (Port 8080)
- **ec-discovery-srv**: Service discovery (Eureka)
- **ec-contract-srv**: Service quản lý hợp đồng
- **ec-notification-srv**: Service thông báo

### Base URL
```
http://localhost:8080/api
```

### Response Format chung
Tất cả API trả về format Response chuẩn:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {} // hoặc [] tùy theo API
}
```

### Headers chung
- **Content-Type**: `application/json`
- **Authorization**: `Bearer {token}` (cho các API yêu cầu xác thực)

---

## 1. Authentication API (`/auth`)

Các API này **KHÔNG yêu cầu** JWT token.

### 1.1. Đăng nhập
**Endpoint**: `POST /auth/login`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "string (required, example: user@example.com)",
  "password": "string (required)"
}
```

**Validation**:
- `email`: Not null
- `password`: Not null

**Response Success**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "access_token": "string (JWT token)"
  }
}
```

**Response Error (Email không tồn tại)**:
```json
{
  "code": "ERR_400",
  "message": "Email không hợp lệ",
  "data": null
}
```

**Response Error (Mật khẩu sai)**:
```json
{
  "code": "ERR_400",
  "message": "Mật khẩu không hợp lệ",
  "data": null
}
```

**Mô tả**: Đăng nhập hệ thống và trả về JWT access token.

---

### 1.2. Đăng ký
**Endpoint**: `POST /auth/register`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "string (required, not blank)",
  "email": "string (required, valid email)",
  "password": "string (optional)",
  "phone": "string (required, pattern: ^(0|\\+84)(\\d{9})$)",
  "birthday": "string (optional)",
  "gender": "string (optional)",
  "organizationId": "integer (optional)",
  "status": "integer (optional)",
  "taxCode": "string (required)",
  "roleId": "integer (optional)"
}
```

**Validation**:
- `name`: Not blank
- `email`: Not blank, valid email format
- `phone`: Not blank, must match pattern `^(0|\+84)(\d{9})$`
- `taxCode`: Not null

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "message": "Đăng ký tài khoản thành công"
  }
}
```

**Mô tả**: Frontend sử dụng API này để đăng ký tài khoản mới.

**Lưu ý**: 
- Validation của API này KHÁC với API Create Customer (2.1)
- Ở đây `organizationId`, `status`, `roleId` là **OPTIONAL**
- API Create Customer (2.1) yêu cầu các field này là **REQUIRED**

---

### 1.3. Đăng xuất
**Endpoint**: `POST /auth/logout`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body**: Không có

**Response Success**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "message": "Đăng xuất thành công"
  }
}
```

**Response Error (Token không hợp lệ)**:
```json
{
  "code": "ERR_401",
  "message": "Authentication failed",
  "data": null
}
```

**Mô tả**: Đăng xuất và đưa token vào blacklist. Token sẽ không thể sử dụng được nữa sau khi logout.

---

## 2. Customer API (`/customers`)

Tất cả API này **YÊU CẦU** JWT token trong header.

**Headers chung**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

### 2.1. Tạo mới user
**Endpoint**: `POST /customers/create-customer`

**Request Body**:
```json
{
  "name": "string (required, not blank)",
  "email": "string (required, valid email format, not blank)",
  "password": "string (optional)",
  "phone": "string (required, pattern: ^(0|\\+84)(\\d{9})$, not blank)",
  "birthday": "string (optional, format: yyyy-MM-dd)",
  "gender": "string (optional)",
  "organizationId": "integer (required, not null)",
  "status": "integer (required, not null)",
  "taxCode": "string (required, not null)",
  "roleId": "integer (required, not null)"
}
```

**Validation**:
- `name`: @NotBlank - Tên không được để trống
- `email`: @Email, @NotBlank - Email không hợp lệ / Email không được để trống
- `phone`: @Pattern(^(0|\\+84)(\\d{9})$), @NotBlank - Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 0 hoặc +84)
- `organizationId`: @NotNull
- `status`: @NotNull
- `taxCode`: @NotNull
- `roleId`: @NotNull

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "phone": "string",
    "birthday": "string",
    "gender": "string",
    "status": "integer",
    "taxCode": "string",
    "organizationId": "integer",
    "roles": [
      {
        "id": "integer",
        "name": "string",
        "permissions": [
          {
            "id": "integer",
            "name": "string"
          }
        ]
      }
    ]
  }
}
```

---

### 2.2. Cập nhật thông tin user
**Endpoint**: `PUT /customers/update-customer/{customerId}`

**Path Parameters**:
- `customerId`: integer (required)

**Request Body**: Tương tự như 2.1 (cùng validation rules)

**Response**: Tương tự như 2.1

**Response Error (User không tồn tại)**:
```json
{
  "code": "ERR_404",
  "message": "Không tìm thấy khách hàng",
  "data": null
}
```

**Mô tả**: Cập nhật dữ liệu user theo ID.

---

### 2.3. Xóa user
**Endpoint**: `DELETE /customers/delete-customer/{customerId}`

**Path Parameters**:
- `customerId`: integer (required)

**Request Body**: Không có

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": "success message"
}
```

---

### 2.4. Xem chi tiết user
**Endpoint**: `GET /customers/{customerId}`

**Path Parameters**:
- `customerId`: integer (required)

**Request Body**: Không có

**Response**: Tương tự như 2.1

**Mô tả**: Lấy thông tin chi tiết của một user theo ID.

---

### 2.5. Danh sách user
**Endpoint**: `GET /customers/get-all-customer`

**Query Parameters**:
- `page`: integer (default: 0, optional)
- `size`: integer (default: 10, optional)
- `textSearch`: string (optional)
- `organizationId`: integer (optional)

**Example**: `http://localhost:8080/api/customers/get-all-customer?page=0&size=10&textSearch=john&organizationId=1`

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "content": [
      {
        "id": "integer",
        "name": "string",
        "email": "string",
        // ... tương tự CustomerResponseDTO
      }
    ],
    "totalElements": "integer",
    "totalPages": "integer",
    "size": "integer",
    "number": "integer"
  }
}
```

**Mô tả**: Lấy danh sách user có phân trang và tìm kiếm.

---

### 2.6. Lấy thông tin user theo email
**Endpoint**: `GET /customers/get-by-email`

**Query Parameters**:
- `email`: string (required)

**Example**: `http://localhost:8080/api/customers/get-by-email?email=user@example.com`

**Response**: Tương tự như 2.1

---

### 2.7. Đăng ký user (Internal)
**Endpoint**: `POST /customers/register`

**Request Body**: Tương tự như 2.1

**Response**: Tương tự như 2.1

**Mô tả**: API nội bộ dùng để call service từ auth-service. Frontend KHÔNG sử dụng API này.

---

### 2.8. Đổi mật khẩu
**Endpoint**: `PUT /customers/change-password/{customerId}`

**Path Parameters**:
- `customerId`: integer (required)

**Request Body**:
```json
{
  "oldPassword": "string (required)",
  "newPassword": "string (required)",
  "confirmPassword": "string (required)"
}
```

**Validation**:
- Tất cả các field bắt buộc phải có
- `confirmPassword` phải khớp với `newPassword`
- `oldPassword` phải đúng với mật khẩu hiện tại

**Response Success**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": "success message"
}
```

**Response Error (nếu mật khẩu cũ sai)**:
```json
{
  "code": "ERR_400",
  "message": "Mật khẩu cũ không đúng",
  "data": null
}
```

**Response Error (nếu confirm không khớp)**:
```json
{
  "code": "ERR_400",
  "message": "Mật khẩu xác nhận không khớp",
  "data": null
}
```

---

## 3. Role API (`/customers/roles`)

Tất cả API này **YÊU CẦU** JWT token.

**Headers chung**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

### 3.1. Tạo mới vai trò
**Endpoint**: `POST /customers/roles/create`

**Request Body**:
```json
{
  "name": "string (required)",
  "permissionIds": [
    "integer (optional)"
  ]
}
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "id": "integer",
    "name": "string",
    "permissions": [
      {
        "id": "integer",
        "name": "string"
      }
    ]
  }
}
```

---

### 3.2. Cập nhật vai trò
**Endpoint**: `PUT /customers/roles/update/{roleId}`

**Path Parameters**:
- `roleId`: integer (required)

**Request Body**: Tương tự như 3.1

**Response**: Tương tự như 3.1

---

### 3.3. Xóa vai trò
**Endpoint**: `DELETE /customers/roles/delete/{roleId}`

**Path Parameters**:
- `roleId`: integer (required)

**Request Body**: Không có

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": "success message"
}
```

---

### 3.4. Danh sách vai trò
**Endpoint**: `GET /customers/roles/get-all`

**Query Parameters**:
- `textSearch`: string (default: "", optional)
- `page`: integer (default: 0, optional)
- `size`: integer (default: 10, optional)

**Example**: `http://localhost:8080/api/customers/roles/get-all?textSearch=admin&page=0&size=10`

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "content": [
      {
        "id": "integer",
        "name": "string",
        "permissions": [
          {
            "id": "integer",
            "name": "string"
          }
        ]
      }
    ],
    "totalElements": "integer",
    "totalPages": "integer",
    "size": "integer",
    "number": "integer"
  }
}
```

**Mô tả**: Danh sách vai trò có phân trang và tìm kiếm.

---

### 3.5. Thông tin chi tiết vai trò
**Endpoint**: `GET /customers/roles/{roleId}`

**Path Parameters**:
- `roleId`: integer (required)

**Request Body**: Không có

**Response**: Tương tự như 3.1

---

## 4. Organization API (`/customers/organizations`)

Tất cả API này **YÊU CẦU** JWT token.

**Headers chung**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

### 4.1. Tạo mới tổ chức
**Endpoint**: `POST /customers/organizations/create`

**Request Body**:
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "taxCode": "string (required)",
  "code": "string (required)",
  "parentId": "integer (optional)"
}
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "status": "integer",
    "taxCode": "string",
    "code": "string",
    "children": [] // Set<OrganizationResponseDTO>
  }
}
```

---

### 4.2. Xóa tổ chức
**Endpoint**: `DELETE /customers/organizations/delete/{organizationId}`

**Path Parameters**:
- `organizationId`: integer (required)

**Request Body**: Không có

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": "success message"
}
```

---

### 4.3. Cập nhật tổ chức
**Endpoint**: `PUT /customers/organizations/update/{organizationId}`

**Path Parameters**:
- `organizationId`: integer (required)

**Request Body**: Tương tự như 4.1

**Response**: Tương tự như 4.1

---

### 4.4. Lấy danh sách tất cả tổ chức
**Endpoint**: `GET /customers/organizations/get-all`

**Query Parameters**:
- `textSearch`: string (default: "", optional)
- `page`: integer (default: 0, optional)
- `size`: integer (default: 10, optional)

**Example**: `http://localhost:8080/api/customers/organizations/get-all?textSearch=company&page=0&size=10`

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "content": [
      {
        "id": "integer",
        "name": "string",
        "email": "string",
        "status": "integer",
        "taxCode": "string",
        "code": "string",
        "children": []
      }
    ],
    "totalElements": "integer",
    "totalPages": "integer",
    "size": "integer",
    "number": "integer"
  }
}
```

**Mô tả**: Lấy danh sách tổ chức có phân trang và tìm kiếm.

---

### 4.5. Xem chi tiết tổ chức
**Endpoint**: `GET /customers/organizations/{organizationId}`

**Path Parameters**:
- `organizationId`: integer (required)

**Request Body**: Không có

**Response**: Tương tự như 4.1

---

## 5. Permission API (`/customers/permissions`)

Tất cả API này **YÊU CẦU** JWT token.

**Headers chung**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

### 5.1. Danh sách phân quyền
**Endpoint**: `GET /customers/permissions/get-all`

**Query Parameters**:
- `page`: integer (default: 0, required)
- `size`: integer (default: 10, required)
- `textSearch`: string (optional)

**Example**: `http://localhost:8080/api/customers/permissions/get-all?page=0&size=10&textSearch=read`

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "content": [
      {
        "id": "integer",
        "name": "string"
      }
    ],
    "totalElements": "integer",
    "totalPages": "integer",
    "size": "integer",
    "number": "integer"
  }
}
```

**Mô tả**: Lấy danh sách phân quyền có phân trang và tìm kiếm.

---

## 6. Notification Service

**Status**: Service đã được tạo nhưng chưa có endpoint API cụ thể.
Service này sử dụng để gửi email và thông báo qua template.

**Configuration**:
- Port: 8085
- Context Path: `/notifications`
- Email: Gmail SMTP

**Các entity**:
- Message (mailTemplate, noticeTemplate)
- Notice (contractId, noticeContent, noticeUrl, email)
- Email

---

## 7. Contract Service

**Status**: Service đã được tạo nhưng chưa có endpoint API cụ thể.
Service này quản lý các hợp đồng.

**Configuration**:
- Port: 8083
- Context Path: `/contracts`

---

## 8. Gateway API

API Gateway test endpoint.

### 8.1. Hello World
**Endpoint**: `GET /xin-chao`

**Headers**: Không yêu cầu

**Request Body**: Không có

**Response**:
```
Hello, World!
```

**Mô tả**: Endpoint test của Gateway Service.

**Full URL**: `http://localhost:8080/api/xin-chao`

---

## Error Handling

### Error Response Format
```json
{
  "code": "ERROR_CODE",
  "message": "Error message description",
  "data": null
}
```

### Common Error Codes

**System Errors:**
- `ERR_500`: Lỗi hệ thống, vui lòng đợi trong giây lát
- `ERR_404`: Resource not found
- `ERR_400`: Bad request
- `ERR_401`: Authentication failed (UNAUTHORIZED)
- `ERR_403`: Access denied (FORBIDDEN)

**Authentication Errors:**
- `EMAIL_INVALID`: Email không hợp lệ / không tồn tại
- `EMAIL_EXISTED`: Email đã tồn tại
- `PASSWORD_INVALID`: Mật khẩu không hợp lệ
- `INVALID_OLD_PASSWORD`: Mật khẩu cũ không đúng
- `CONFIRM_PASSWORD_NOT_MATCH`: Mật khẩu xác nhận không khớp
- `OTP_NOT_FOUND`: OTP không tồn tại
- `OTP_USED`: OTP đã được sử dụng
- `OTP_EXPIRED`: OTP đã hết hạn

**Customer Errors:**
- `CUSTOMER_NOT_FOUND`: Không tìm thấy khách hàng
- `CUSTOMER_ALREADY_EXISTS`: Khách hàng đã tồn tại
- `CUSTOMER_EMAIL_EXISTED`: Email đã tồn tại

**Organization Errors:**
- `ORGANIZATION_NOT_FOUND`: Không tìm thấy tổ chức

**Role Errors:**
- `ROLE_NOT_FOUND`: Không tìm thấy vai trò
- `ROLE_ALREADY_EXISTS`: Vai trò đã tồn tại

**Permission Errors:**
- `PERMISSION_NOT_FOUND`: Không tìm thấy quyền

---

## Notes

1. **JWT Token**: 
   - Các API cần token sẽ kiểm tra token trong header `Authorization: Bearer {token}`
   - Token được trả về từ API `/auth/login`
   - Token có thời gian hết hạn: 86400000ms (24 giờ)
   - Sau khi logout, token sẽ bị blacklist trong Redis

2. **Validation**: 
   - Tất cả các field có `@Valid` sẽ được validate
   - Validation errors trả về HTTP 400 Bad Request
   - Message lỗi sẽ mô tả cụ thể field nào không hợp lệ

3. **Pagination**: 
   - Các API list hỗ trợ phân trang với `page` (bắt đầu từ 0) và `size`
   - Response trả về Spring Page object với: `content`, `totalElements`, `totalPages`, `size`, `number`

4. **Search**: 
   - Hầu hết các API list hỗ trợ tìm kiếm qua parameter `textSearch`
   - Search không phân biệt chữ hoa/thường (case-insensitive)
   - Search thực hiện LIKE query trong database

5. **Phone Pattern**: 
   - Số điện thoại phải tuân theo format `^(0|\+84)(\d{9})$`
   - Ví dụ hợp lệ: `0123456789`, `+84123456789`

6. **Email Format**: 
   - Email phải hợp lệ theo chuẩn RFC
   - Phải unique trong hệ thống (không trùng lặp)

7. **Password**: 
   - Được mã hóa bằng BCrypt trước khi lưu database
   - Không trả về trong response (bảo mật)

---

## CORS Configuration

Gateway cho phép requests từ:
- Origin: `http://localhost:5173`
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: *
- Credentials: true

---

## Service Ports Summary

| Service | Port | Context Path |
|---------|------|--------------|
| Gateway | 8080 | `/` (Base: `/api`) |
| Discovery (Eureka) | 8761 | `/` |
| Auth | - | `/auth` |
| Customer | - | `/customers` |
| Notification | 8085 | `/notifications` |
| Contract | 8083 | `/contracts` |

**Note**: Port của Auth và Customer services được quản lý bởi Eureka và Gateway.

