# Luồng Tạo Hợp Đồng - eContact

## Mục lục
- [I. Constants và Enums](#i-constants-và-enums)
- [II. Luồng Tạo Hợp Đồng Đơn Lẻ](#ii-luồng-tạo-hợp-đồng-đơn-lẻ)
- [III. Các Màn Hình Quản Lý](#iii-các-màn-hình-quản-lý)
- [IV. Các Chức Năng Khác](#iv-các-chức-năng-khác)

---

## I. Constants và Enums

### 1. Document Type (Loại Tài Liệu)
| Value | Description |
|-------|-------------|
| `1` | File gốc |
| `2` | File view (chỉ xem) |
| `3` | File đính kèm |

### 2. Status (Trạng Thái)
| Value | Description |
|-------|-------------|
| `0` | Inactive |
| `1` | Active |

### 3. Participant Type (Loại Tổ Chức Tham Gia)
| Value | Description |
|-------|-------------|
| `1` | Tổ chức của tôi |
| `2` | Đối tác |
| `3` | Cá nhân |

### 4. Recipient Type (Vai Trò Người Xử Lý)
| Value | Description |
|-------|-------------|
| `1` | Điều phối |
| `2` | Xem xét |
| `3` | Ký |
| `4` | Văn thư |

### 5. Contract Status (Trạng Thái Hợp Đồng)
| Value | Constant | Description |
|-------|----------|-------------|
| `0` | DRAFT | Nháp |
| `10` | CREATED | Đã tạo |
| `20` | PROCESSING | Đang xử lý |
| `30` | SIGNED | Hoàn thành |
| `40` | LIQUIDATED | Thanh lý |
| `31` | REJECTED | Từ chối |
| `32` | CANCEL | Hủy bỏ |
| `1` | ABOUT_EXPIRE | Sắp hết hạn |
| `2` | EXPIRE | Hết hạn |
| `35` | SCAN | Lưu trữ |

### 6. Field Type (Loại Trường Dữ Liệu)
| Value | Constant | Description |
|-------|----------|-------------|
| `1` | TEXT | Ô text |
| `2` | IMAGE_SIGN | Ô ký ảnh |
| `3` | DIGITAL_SIGN | Ô ký số |
| `4` | CONTRACT_NO | Ô số hợp đồng |
| `5` | MONEY | Ô tiền |

---

## II. Luồng Tạo Hợp Đồng Đơn Lẻ

### BƯỚC 1: Thông Tin Tài Liệu

#### 1.1. Lấy Thông Tin Ban Đầu

**API 1: Lấy thông tin chi tiết người dùng hiện tại**
```
GET /customers/{customerId}
```
**Mục đích**: Lấy `id` user và `organizationId`

**API 2: Lấy danh sách loại tài liệu**
```
GET /contracts/types
Query params: { page, size, textSearch, organizationId }
```

**API 3: Lấy tất cả hợp đồng liên quan theo tổ chức**
```
GET /contracts/contract-by-organization
Body: {
  page: 0,
  size: 10,
  textSearch: "",
  status: null,
  organizationId: <current_organization_id>
}
```

---

#### 1.2. Kiểm Tra File PDF

**API 4: Kiểm tra số lượng trang PDF**
```
GET /contracts/documents/get-page-size
Content-Type: multipart/form-data
Body: { file: <multipart_file> }
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "fileName": "document.pdf",
    "numberOfPages": "15"
  }
}
```

**API 5: Kiểm tra chữ ký số trong tài liệu**
```
GET /contracts/documents/check-signature
Content-Type: multipart/form-data
Body: { file: <multipart_file> }
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "hasSignature": false
  }
}
```

**⚠️ Validation**:
- Nếu `hasSignature = true`: **BÁO LỖI** - "Tài liệu đã có chữ ký số, vui lòng chọn file khác"
- Nếu `hasSignature = false`: **OK** - Cho phép tiếp tục

---

#### 1.3. Kiểm Tra Mã Hợp Đồng

**API 6: Kiểm tra mã contract_no (Số tài liệu)**
```
GET /contracts/check-code-unique
Query params: { code: <contract_no> }
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "isExist": "false"
  }
}
```

**⚠️ Validation**:
- Nếu `isExist = true`: **BÁO LỖI** - "Mã hợp đồng đã tồn tại"
- Nếu `isExist = false`: **OK** - Cho phép tiếp tục

---

#### 1.4. Tạo Hợp Đồng

**API 7: Tạo hợp đồng**
```
POST /contracts/create-contract
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Tên hợp đồng",
  "contractNo": "123456",
  "signTime": "2025-10-25T07:56:04.343Z",
  "note": "Ghi chú",
  "contractRefs": [
    {
      "refId": 1
    }
  ],
  "typeId": 1,
  "isTemplate": false,
  "templateContractId": null,
  "contractExpireTime": "2025-10-25T07:56:04.343Z"
}
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "id": 2,
    "name": "Tên hợp đồng",
    "contractNo": "123456",
    "signTime": "2025-10-25T07:56:04.343",
    "status": 0,
    "organizationId": 1,
    "createdAt": "2025-11-02T16:19:10.548"
  }
}
```

**📝 Lưu lại**: `contractId` = `data.id` (sử dụng cho các bước tiếp theo)

---

#### 1.5. Upload Tài Liệu

**API 8: Upload file PDF lên MinIO**
```
POST /contracts/documents/upload-document
Content-Type: multipart/form-data
Body: { file: <multipart_file> }
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "path": "1762076662853_document.pdf",
    "fileName": "document.pdf"
  }
}
```

**📝 Lưu lại**: 
- `path` (dùng cho API tiếp theo)
- `fileName` (dùng cho API tiếp theo)

**API 9: Lưu thông tin tài liệu vào DB**
```
POST /contracts/documents/create-document
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Hợp đồng 1",
  "type": 1,
  "contractId": 2,
  "fileName": "document.pdf",
  "path": "1762076662853_document.pdf",
  "status": 1
}
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "id": 3,
    "name": "Hợp đồng 1",
    "type": 1,
    "contractId": 2,
    "fileName": "document.pdf",
    "path": "1762076662853_document.pdf",
    "status": 1
  }
}
```

**📝 Lưu lại**: `documentId` = `data.id` (dùng cho bước 3)

---

#### 1.6. Upload File Đính Kèm (Nếu Có)

Lặp lại **API 8 và API 9** cho mỗi file đính kèm với:
- `type = 3` (File đính kèm)

---

### BƯỚC 2: Xác Định Đối Tượng Ký

#### 2.1. Lấy Thông Tin Tổ Chức

**API: Lấy chi tiết tổ chức**
```
GET /customers/organizations/{organizationId}
```
**Mục đích**: Lấy tên tổ chức để hiển thị

---

#### 2.2. Gợi Ý Tên (Tại các input)

**API: Gợi ý tên người dùng**
```
GET /customers/suggest-list-customer
Query params: { textSearch: <keyword> }
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": [
    {
      "name": "Nguyễn Văn A"
    }
  ]
}
```

---

#### 2.3. Lưu Thông Tin Người Xử Lý

**API: Lưu participants và recipients**
```
POST /contracts/participants/create-participant/{contractId}
Content-Type: application/json
```

**Request Body**:
```json
[
  {
    "name": "Trung tâm công nghệ thông tin MobiFone",
    "type": 1,
    "ordering": 1,
    "status": 1,
    "contractId": 2,
    "recipients": [
      {
        "name": "Phạm Văn Tú",
        "email": "phamvantu.work@gmail.com",
        "phone": "",
        "cardId": "0123456789",
        "role": 3,
        "ordering": 1,
        "status": 0,
        "signType": 6
      }
    ]
  },
  {
    "name": "Tổ chức đối tác",
    "type": 2,
    "ordering": 2,
    "status": 1,
    "contractId": 2,
    "recipients": [
      {
        "name": "Nguyễn Văn B",
        "email": "nguyenvanb@example.com",
        "phone": "",
        "cardId": "0122345678",
        "role": 3,
        "ordering": 1,
        "status": 0,
        "signType": 6
      }
    ]
  }
]
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": [
    {
      "id": 9,
      "name": "Trung tâm công nghệ thông tin MobiFone",
      "type": 1,
      "ordering": 1,
      "status": 1,
      "recipients": [
        {
          "id": 9,
          "name": "Phạm Văn Tú",
          "email": "phamvantu.work@gmail.com",
          "role": 3,
          "ordering": 1,
          "status": 0,
          "participantId": 9
        }
      ]
    }
  ]
}
```

**📝 Lưu lại**: 
- `participantId` = `data[].id`
- `recipientId` = `data[].recipients[].id`
(Dùng khi quay lại bước 2 để chỉnh sửa)

---

**📌 Quy Tắc Ordering**:

1. **Ordering của Participant**: 
   - Truyền theo thứ tự: `1, 2, 3, ...`

2. **Ordering của Recipient**: 
   - **Với mỗi participant khác nhau**: Mỗi role bắt đầu từ `1`
   - **Ví dụ 1**: Participant có 2 recipients (1 điều phối, 1 ký)
     - Cả 2 đều có `ordering = 1`
   - **Ví dụ 2**: Participant có 2 recipients cùng role (cùng ký)
     - Recipient 1: `ordering = 1`
     - Recipient 2: `ordering = 2`

---

**🔄 Khi Quay Lại Bước 2 để Chỉnh Sửa**:

Truyền thêm field `id` trong request body:
```json
[
  {
    "id": 9,
    "name": "Trung tâm công nghệ thông tin MobiFone",
    "type": 1,
    "recipients": [
      {
        "id": 9,
        "name": "Phạm Văn Tú",
        "email": "phamvantu.work@gmail.com",
        ...
      }
    ]
  }
]
```

---

### BƯỚC 3: Thiết Kế Tài Liệu

**📝 Note**: Không cần gọi API gì ở bước này. Chỉ cần UI kéo thả để thiết kế vị trí các field.

---

### BƯỚC 4: Xác Nhận và Hoàn Tất

#### 4.1. Tạo Fields

**API: Tạo các field trên tài liệu**
```
POST /contracts/fields/create
Content-Type: application/json
```

**Request Body**:
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
    "type": 4,
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
    "boxW": "135",
    "boxH": "28",
    "contractId": 2,
    "documentId": 3,
    "type": 1,
    "recipientId": 10,
    "status": 0
  }
]
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Số hợp đồng",
      "type": 4,
      "contractId": 2,
      "documentId": 3,
      "recipientId": 9,
      ...
    }
  ]
}
```

---

#### 4.2. Thay Đổi Trạng Thái Hợp Đồng

**API: Chuyển trạng thái hợp đồng sang "Đã tạo"**
```
PUT /contracts/change-status/{contractId}
Query params: { status: 10 }
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": "Cập nhật trạng thái hợp đồng thành công"
}
```

**✅ Hoàn tất**: Hợp đồng đã được tạo thành công với status = `10` (CREATED)

---

## III. Các Màn Hình Quản Lý

### 1. Màn Tài Liệu Đã Tạo

**API: Lấy danh sách hợp đồng mình đã tạo**
```
GET /contracts/my-contracts
```

**Request Body**:
```json
{
  "status": 0,
  "textSearch": "keyword",
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "page": 0,
  "size": 10,
  "organizationId": null
}
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 2,
        "name": "Hợp đồng test",
        "contractNo": "123456",
        "status": 10,
        "signTime": "2025-10-25T07:56:04.343",
        "createdAt": "2025-11-02T16:19:10.548"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

---

### 2. Màn Tài Liệu Nhận

**API: Lấy danh sách hợp đồng mình tham gia xử lý**
```
GET /contracts/my-process
```

**Request Body**: (Tương tự màn 1)

**📝 Note**: 
- `status = 1`: Chờ xử lý
- `status = 2`: Đã xử lý

---

### 3. Màn Tài Liệu Của Tổ Chức

**API: Lấy danh sách hợp đồng theo tổ chức**
```
GET /contracts/contract-by-organization
```

**Request Body**:
```json
{
  "status": 0,
  "textSearch": "keyword",
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "page": 0,
  "size": 10,
  "organizationId": 1
}
```

**⚠️ Note**: `organizationId` là **BẮT BUỘC** phải truyền

---

## IV. Các Chức Năng Khác

### 1. Xem Luồng Ký

**API: Lấy thông tin luồng ký của hợp đồng**
```
GET /contracts/bpmn-flow/{contractId}
```

**Response**:
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": {
    "createdBy": {
      "id": 1,
      "name": "Phạm Văn Tú",
      "email": "phamvantu.work@gmail.com"
    },
    "createdAt": "2025-10-26T20:04:02.686034",
    "reasonCancel": null,
    "cancelDate": null,
    "recipients": [
      {
        "id": 9,
        "name": "Phạm Văn Tú 11",
        "email": "phamvantu.work@gmail.com",
        "role": 3,
        "ordering": 1,
        "status": 0,
        "participantName": "Trung tâm công nghệ thông tin MobiFone",
        "participantType": 1,
        "userInOrganization": "Công ty Phú Hòa",
        "recipientHistory": false
      }
    ],
    "contractStatus": 10
  }
}
```

**📊 Hiển Thị**:
- Người tạo và thời gian tạo
- Danh sách người xử lý theo thứ tự
- Trạng thái từng người xử lý
- Trạng thái hợp đồng

---

### 2. Tải Lên File Đính Kèm

Sử dụng **API 8 và API 9** với `type = 3`

---

### 3. Xem Tài Liệu Liên Quan

Lấy từ field `contractRefs` trong **Contract Detail API**

---

### 4. Gia Hạn Hợp Đồng

**API: Cập nhật hợp đồng**
```
PUT /contracts/update-contract/{contractId}
```

**Request Body**: (Tương tự API tạo hợp đồng)

---

### 5. Hủy Hợp Đồng

**API: Thay đổi trạng thái hợp đồng**
```
PUT /contracts/change-status/{contractId}
Query params: { status: 32 }
```

---

### 6. Chia Sẻ Hợp Đồng

**⚠️ Điều kiện**: Chỉ cho phép chia sẻ hợp đồng có `status = 30` (Hoàn thành)

**API 1: Tạo chia sẻ hợp đồng**
```
POST /contracts/shares
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": ["user1@example.com", "user2@example.com"],
  "contractId": 2
}
```

**API 2: Lấy danh sách hợp đồng đã chia sẻ**
```
GET /contracts/shares
```

**Request Body**:
```json
{
  "textSearch": "keyword",
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "page": 0,
  "size": 10
}
```

---

## V. Tổng Kết Luồng

### Sơ Đồ Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                     BẮT ĐẦU TẠO HỢP ĐỒNG                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: THÔNG TIN TÀI LIỆU                                 │
│  ├─ Lấy thông tin user, organization                        │
│  ├─ Lấy danh sách loại tài liệu                             │
│  ├─ Kiểm tra file PDF (số trang, chữ ký số)                 │
│  ├─ Kiểm tra mã hợp đồng unique                             │
│  ├─ Tạo hợp đồng (status = 0)                               │
│  ├─ Upload file PDF lên MinIO                               │
│  ├─ Lưu thông tin document (type = 1)                       │
│  └─ Upload file đính kèm (type = 3) - nếu có                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: XÁC ĐỊNH ĐỐI TƯỢNG KÝ                             │
│  ├─ Lấy thông tin tổ chức                                   │
│  ├─ Thêm participants (ordering: 1, 2, 3,...)              │
│  └─ Thêm recipients cho mỗi participant                     │
│     ├─ Điều phối (role = 1)                                 │
│     ├─ Xem xét (role = 2)                                   │
│     ├─ Ký (role = 3)                                        │
│     └─ Văn thư (role = 4)                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: THIẾT KẾ TÀI LIỆU                                  │
│  └─ UI kéo thả các field (không gọi API)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: XÁC NHẬN VÀ HOÀN TẤT                               │
│  ├─ Tạo fields (vị trí, kích thước, type)                   │
│  └─ Thay đổi status hợp đồng = 10 (CREATED)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   HỢP ĐỒNG ĐÃ ĐƯỢC TẠO                       │
└─────────────────────────────────────────────────────────────┘
```

---

## VI. Lưu Ý Quan Trọng

### 1. Validation

✅ **Bước 1**:
- File PDF không được có chữ ký số (`hasSignature = false`)
- Mã hợp đồng phải unique (`isExist = false`)

✅ **Bước 2**:
- Ordering của participant: `1, 2, 3, ...`
- Ordering của recipient: Mỗi role trong cùng participant bắt đầu từ `1`
- `signType` luôn fix cứng = `6`
- Recipient `status` mặc định = `0`

✅ **Bước 4**:
- Field `status` mặc định = `0`
- Phải có đầy đủ thông tin vị trí (boxX, boxY, boxW, boxH)

---

### 2. Trạng Thái

**Hợp đồng**:
- Tạo xong bước 1: `status = 0` (DRAFT)
- Tạo xong bước 4: `status = 10` (CREATED)

**Participant**:
- Luôn = `1` (Active) khi tạo

**Recipient**:
- Luôn = `0` (Chưa xử lý) khi tạo

**Document**:
- Luôn = `1` (Active) khi tạo

**Field**:
- Luôn = `0` khi tạo

---

### 3. Chia Sẻ Hợp Đồng

⚠️ **Điều kiện**: Chỉ cho phép chia sẻ khi `contractStatus = 30` (Hoàn thành)

---

## VII. Checklist Tạo Hợp Đồng

- [ ] Lấy thông tin user và organization
- [ ] Chọn loại tài liệu
- [ ] Upload file PDF và kiểm tra:
  - [ ] Số trang
  - [ ] Không có chữ ký số
- [ ] Nhập mã hợp đồng và kiểm tra unique
- [ ] Điền thông tin hợp đồng (tên, thời gian, ghi chú)
- [ ] Chọn hợp đồng liên quan (nếu có)
- [ ] Upload file đính kèm (nếu có)
- [ ] Tạo hợp đồng (API)
- [ ] Upload document lên MinIO
- [ ] Lưu document vào DB
- [ ] Thêm participants và recipients với ordering đúng
- [ ] Thiết kế vị trí các field trên tài liệu
- [ ] Tạo fields (API)
- [ ] Thay đổi status hợp đồng = 10 (CREATED)

---

**📅 Ngày tạo**: 2025-11-06
**📝 Version**: 1.0

