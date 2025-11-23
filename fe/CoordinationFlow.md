# Luồng Điều Phối - eContact

## Mục lục
- [I. Tổng Quan](#i-tổng-quan)
- [II. Điều Phối](#ii-điều-phối)
- [III. Xem Xét](#iii-xem-xét)
- [IV. Từ Chối](#iv-từ-chối)
- [V. Ký và Văn Thư](#v-ký-và-văn-thư)
- [VI. Các API Chung](#vi-các-api-chung)
- [VII. Sơ Đồ Luồng Điều Phối](#vii-sơ-đồ-luồng-điều-phối)
- [VIII. Sơ Đồ Luồng Xem Xét](#viii-sơ-đồ-luồng-xem-xét)
- [IX. Sơ Đồ Luồng Từ Chối](#ix-sơ-đồ-luồng-từ-chối)
- [X. Sơ Đồ Luồng Ký](#x-sơ-đồ-luồng-ký)
- [XI. Lưu Ý Quan Trọng](#xi-lưu-ý-quan-trọng)
- [XII. Checklist Điều Phối](#xii-checklist-điều-phối)
- [XIII. Checklist Xem Xét](#xiii-checklist-xem-xét)
- [XIV. Checklist Từ Chối](#xiv-checklist-từ-chối)
- [XV. Checklist Ký](#xv-checklist-ký)

---

## I. Tổng Quan

Luồng điều phối bao gồm các bước xử lý hợp đồng:
1. **Điều phối**: Phân công người xử lý tiếp theo
2. **Xem xét**: Xem xét và phê duyệt hợp đồng
3. **Từ chối**: Từ chối hợp đồng với lý do và chú thích PDF (nếu có)
4. **Ký**: Ký số hợp đồng bằng chứng thư số
5. **Văn thư**: Hoàn tất thủ tục

---

## II. Điều Phối

### BƯỚC 1: Lấy Thông Tin Hợp Đồng

#### 1.1. Lấy Thông Tin Hợp Đồng Theo ID

**API: Lấy thông tin hợp đồng theo id**
```
GET /contracts/{contractId}
```

**Đầu vào**: 
- `contractId` (path): ID của hợp đồng

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": {
        "id": 2,
        "name": "Hợp đồng test",
        "contractNo": "123456",
        "status": 20,
        ...
    }
}
```

---

### BƯỚC 2: Lấy Thông Tin Participant và Recipient

#### 2.1. Lấy Thông Tin Participant Theo Recipient ID

**API: Lấy thông tin participant (tổ chức điều phối) theo id của recipient**
```
GET /contracts/participants/by-recipient/{recipientId}
```

**Đầu vào**: 
- `recipientId` (path): ID của recipient

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": {
        "id": 1,
        "name": "Tổ chức PTIT",
        "type": 1,
        "ordering": 1,
        "status": 1,
        "taxCode": null,
        "contractId": 2,
        "recipients": [
            {
                "id": 1,
                "name": "Phạm Văn Tú",
                "email": "phamvantu.work@gmail.com",
                "phone": "",
                "role": 3,
                "username": null,
                "password": null,
                "ordering": 1,
                "status": 0,
                "fromAt": null,
                "dueAt": null,
                "signAt": null,
                "processAt": null,
                "signType": 6,
                "reasonReject": null,
                "cardId": null,
                "delegateTo": null,
                "signStart": null,
                "signEnd": null,
                "participantId": 1,
                "fields": [
                    {
                        "id": 1,
                        "name": "Số tài liệu",
                        "type": 4,
                        "value": null,
                        "font": null,
                        "fontSize": 0,
                        "page": 1,
                        "boxX": 163.0,
                        "boxY": 207.0,
                        "boxW": 150.0,
                        "boxH": 30.0,
                        "status": 0,
                        "contractId": 2,
                        "documentId": 2,
                        "recipientId": 1,
                        "recipient": {
                            "id": 1,
                            "name": "Phạm Văn Tú",
                            "email": "phamvantu.work@gmail.com",
                            "phone": "",
                            "role": 3,
                            "username": null,
                            "ordering": 1,
                            "status": 0,
                            "fromAt": null,
                            "dueAt": null,
                            "signAt": null,
                            "processAt": null,
                            "signType": 6,
                            "notifyType": null,
                            "remind": null,
                            "remindDate": null,
                            "remindMessage": null,
                            "reasonReject": null,
                            "cardId": null
                        },
                        "typeImageSignature": null,
                        "actionInContract": false,
                        "ordering": 0
                    }
                ]
            }
        ]
    }
}
```

---

#### 2.2. Lấy Thông Tin Tất Cả Participant Của Hợp Đồng

**API: Lấy thông tin tất cả participant của hợp đồng**
```
GET /contracts/{contractId}/participants
```

**Đầu vào**: 
- `contractId` (path): ID của hợp đồng

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": [
        {
            "id": 2,
            "name": "Tổ chức PTIT",
            "type": 1,
            "ordering": 1,
            "status": 1,
            "taxCode": null,
            "contractId": 3,
            "recipients": [
                {
                    "id": 2,
                    "name": "Phạm Văn Tú",
                    "email": "phamvantu.work@gmail.com",
                    "phone": "",
                    "role": 3,
                    "username": null,
                    "password": null,
                    "ordering": 1,
                    "status": 0,
                    "fromAt": null,
                    "dueAt": null,
                    "signAt": null,
                    "processAt": null,
                    "signType": 6,
                    "reasonReject": null,
                    "cardId": null,
                    "delegateTo": null,
                    "signStart": null,
                    "signEnd": null,
                    "participantId": 2,
                    "fields": [
                        {
                            "id": 2,
                            "name": "Số tài liệu",
                            "type": 4,
                            "value": null,
                            "font": null,
                            "fontSize": 0,
                            "page": 1,
                            "boxX": 114.0,
                            "boxY": 159.0,
                            "boxW": 150.0,
                            "boxH": 30.0,
                            "status": 0,
                            "contractId": 3,
                            "documentId": 3,
                            "recipientId": 2,
                            "recipient": {
                                "id": 2,
                                "name": "Phạm Văn Tú",
                                "email": "phamvantu.work@gmail.com",
                                "phone": "",
                                "role": 3,
                                "username": null,
                                "ordering": 1,
                                "status": 0,
                                "fromAt": null,
                                "dueAt": null,
                                "signAt": null,
                                "processAt": null,
                                "signType": 6,
                                "notifyType": null,
                                "remind": null,
                                "remindDate": null,
                                "remindMessage": null,
                                "reasonReject": null,
                                "cardId": null
                            },
                            "typeImageSignature": null,
                            "actionInContract": false,
                            "ordering": 0
                        }
                    ]
                }
            ]
        }
    ]
}
```

---

### BƯỚC 3: Lấy Thông Tin Field

#### 3.1. Lấy Thông Tin Tất Cả Field Của Hợp Đồng

**API: Lấy thông tin tất cả field của hợp đồng**
```
GET /contracts/{contractId}/fields
```

**Đầu vào**: 
- `contractId` (path): ID của hợp đồng

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": [
        {
            "id": 1,
            "name": "Số tài liệu",
            "type": 4,
            "value": null,
            "font": null,
            "fontSize": 0,
            "page": 1,
            "boxX": 163.0,
            "boxY": 207.0,
            "boxW": 150.0,
            "boxH": 30.0,
            "status": 0,
            "contractId": 2,
            "documentId": 2,
            "recipientId": 1,
            "recipient": {
                "id": 1,
                "name": "Phạm Văn Tú",
                "email": "phamvantu.work@gmail.com",
                "phone": "",
                "role": 3,
                "username": null,
                "ordering": 1,
                "status": 0,
                "fromAt": null,
                "dueAt": null,
                "signAt": null,
                "processAt": null,
                "signType": 6,
                "notifyType": null,
                "remind": null,
                "remindDate": null,
                "remindMessage": null,
                "reasonReject": null,
                "cardId": null
            },
            "typeImageSignature": null,
            "actionInContract": false,
            "ordering": 0
        }
    ]
}
```

---

### BƯỚC 4: Tạo Participant Mới

**API: Tạo participant**
```
POST /contracts/participants/create-participant/{contractId}
Content-Type: application/json
```

**Đầu vào**: 
- `contractId` (path): ID của hợp đồng
- Body: Giống bước 2 tạo hợp đồng (xem CreateContractFlow.md)

**Mô tả**: Truyền các tổ chức tham gia hợp đồng. Cấu trúc request body giống như khi tạo hợp đồng mới.

---

### BƯỚC 5: Tạo Field

**API: Tạo field**
```
POST /contracts/fields/create
Content-Type: application/json
```

**Đầu vào - ra**: Giống bước 3 tạo hợp đồng (xem CreateContractFlow.md)

**Mô tả**: Tạo các field trên tài liệu với vị trí, kích thước và loại field.

---

### BƯỚC 6: Gọi API Điều Phối

**API: Điều phối hợp đồng**
```
POST /contracts/participants/{participantId}/recipients/{recipientId}/coordinate
Content-Type: application/json
```

**Đầu vào**: 
- `participantId` (path): ID của tổ chức đang xử lý trong luồng ký
- `recipientId` (path): ID của người đang tham gia xử lý hợp đồng
- Body: Collection<RecipientDTO>

**Request Body**:
```json
[
    {
        "id": 915197,
        "name": "phamvantu",
        "email": "phamvantu.work@gmail.com",
        "phone": "",
        "role": 1,
        "username": null,
        "password": null,
        "ordering": 1,
        "status": 1,
        "fields": null,
        "fromAt": null,
        "dueAt": null,
        "signAt": null,
        "processAt": null,
        "signType": null,
        "reasonReject": null,
        "cardId": "",
        "image_height_signature": 66,
        "image_width_signature": 180
    },
    {
        "id": 915198,
        "name": "LÊ HỮU ANH TÚ",
        "email": "tutupham5@gmail.com",
        "phone": "",
        "role": 3,
        "username": "tutupham5@gmail.com",
        "password": "23445649",
        "ordering": 1,
        "status": 0,
        "fields": null,
        "fromAt": null,
        "dueAt": null,
        "signAt": null,
        "processAt": null,
        "signType": 6,
        "reasonReject": null,
        "cardId": "0123456788"
    }
]
```

**📝 Lưu ý**:
- Phần tử đầu tiên trong mảng là người điều phối (lấy từ API ở bước 2.1)
- Các phần tử còn lại là những người tham gia tiếp theo trong luồng xử lý

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": {
        "id": 1,
        "name": "Tổ chức PTIT",
        "type": 1,
        "ordering": 1,
        "status": 1,
        "taxCode": null,
        "contractId": 2,
        "recipients": [
            {
                "id": 1,
                "name": "phamvantu",
                "email": "phamvantu.work@gmail.com",
                "phone": "",
                "role": 1,
                "username": null,
                "password": null,
                "ordering": 1,
                "status": 2,
                "fromAt": null,
                "dueAt": null,
                "signAt": null,
                "processAt": "2025-11-16T18:20:40.3058609",
                "signType": null,
                "reasonReject": null,
                "cardId": "",
                "delegateTo": null,
                "signStart": null,
                "signEnd": null,
                "participantId": 1,
                "fields": []
            }
        ]
    }
}
```

**📝 Lưu ý**:
- Sau khi điều phối, `status` của recipient điều phối sẽ chuyển thành `2` (Đã xử lý)
- `processAt` sẽ được cập nhật với thời gian xử lý

---

## III. Xem Xét

### BƯỚC 1: Lấy Thông Tin Cần Thiết

Các API lấy thông tin contract, field, participant, recipient tương tự như phần [Điều Phối](#ii-điều-phối).

---

### BƯỚC 2: Gọi API Xem Xét

**API: Xem xét hợp đồng**
```
POST /contracts/recipients/{recipientId}/review
```

**Đầu vào**: 
- `recipientId` (path): ID của người đang tham gia xử lý hợp đồng

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": {
        "id": 16,
        "name": "Phạm Văn Tú",
        "email": "phamvantu.work@gmail.com",
        "phone": "",
        "role": 2,
        "username": null,
        "password": null,
        "ordering": 1,
        "status": 2,
        "fromAt": null,
        "dueAt": null,
        "signAt": null,
        "processAt": "2025-11-16T20:48:15.7870609",
        "signType": 6,
        "reasonReject": null,
        "cardId": "0100686209-199",
        "delegateTo": null,
        "signStart": "2025-11-14T01:20:20.198536",
        "signEnd": "2025-11-14T01:20:20.199304",
        "participantId": 16,
        "fields": [
            {
                "id": 3,
                "name": "CHỮ KÝ SỐ - Chữ ký có con dấu và thông tin",
                "type": 3,
                "value": null,
                "font": null,
                "fontSize": 0,
                "page": 1,
                "boxX": 20.0,
                "boxY": 91.0,
                "boxW": 100.0,
                "boxH": 30.0,
                "status": 1,
                "contractId": 7,
                "documentId": 7,
                "recipientId": 16,
                "recipient": {
                    "id": 16,
                    "name": "Phạm Văn Tú",
                    "email": "phamvantu.work@gmail.com",
                    "phone": "",
                    "role": 2,
                    "username": null,
                    "ordering": 1,
                    "status": 2,
                    "fromAt": null,
                    "dueAt": null,
                    "signAt": null,
                    "processAt": "2025/11/16 08:48:15",
                    "signType": 6,
                    "notifyType": null,
                    "remind": null,
                    "remindDate": null,
                    "remindMessage": null,
                    "reasonReject": null,
                    "cardId": "0100686209-199"
                },
                "typeImageSignature": null,
                "actionInContract": false,
                "ordering": 0
            }
        ]
    }
}
```

**📝 Lưu ý**:
- Sau khi xem xét, `status` của recipient sẽ chuyển thành `2` (Đã xử lý)
- `processAt` sẽ được cập nhật với thời gian xử lý

---

## IV. Từ Chối

### BƯỚC 1: Lấy Thông Tin Cần Thiết

Các API lấy thông tin contract, field, participant, recipient tương tự như phần [Điều Phối](#ii-điều-phối).

---

### BƯỚC 2: Xem Xét Với Tùy Chọn Từ Chối

**Giao diện**: RejectReviewDialog (fullscreen modal)

Người xem xét có thể:
- Chọn **"Đồng ý"** → Tiếp tục luồng xem xét bình thường
- Chọn **"Không đồng ý"** → Mở RejectReviewDialog để từ chối với lý do chi tiết

---

### BƯỚC 3: Annotate PDF (Tùy Chọn)

**Công cụ annotation có sẵn:**
- **Line**: Vẽ đường thẳng
- **Freehand**: Vẽ tự do
- **Rectangle**: Vẽ hình chữ nhật
- **Text**: Thêm văn bản chú thích
- **Eraser**: Xóa chú thích gần nhất trên trang hiện tại

**Thao tác:**
- Click để chọn công cụ
- Drag để vẽ trên PDF
- Double-click để nhập text
- Ctrl+Z để undo, Ctrl+Y để redo

---

### BƯỚC 4: Nhập Lý Do Từ Chối

**Form validation:**
- **Required field**: Lý do từ chối (textarea)
- **Placeholder**: "Nhập lý do từ chối"
- **Validation error**: "Vui lòng nhập lý do từ chối"

---

### BƯỚC 5: Xử Lý và Upload PDF

**Quy trình:**
1. **Load PDF gốc** từ presigned URL
2. **Merge annotations** lên PDF sử dụng pdf-lib
3. **Export PDF** đã chú thích thành Blob
4. **Upload** lên MinIO storage
5. **Create document record** với type = 3 (DINH_KEM - file đính kèm)

**API Upload Document:**
```
POST /contracts/documents/upload-document
Content-Type: multipart/form-data

Request: file (Blob/File)
Response: { url, fileName, path }
```

**API Create Document Record:**
```
POST /contracts/documents/create-document

Request Body:
{
  "name": "Rejection_{contractName}",
  "contractId": {contractId},
  "type": 3,
  "fileName": "{fileName}",
  "path": "{path}",
  "status": 1
}
```

---

### BƯỚC 6: Từ Chối Hợp Đồng

**API: Thay đổi trạng thái hợp đồng**
```
PUT /contracts/change-status/{contractId}?status=31

Request Body:
{
  "reason": "Lý do từ chối chi tiết từ người dùng"
}
```

**Response Success:**
```json
{
  "code": "SUCCESS",
  "message": "Success",
  "data": "Cập nhật trạng thái hợp đồng thành công"
}
```

**📝 Lưu ý**:
- Contract status sẽ chuyển thành `31` (REJECTED)
- `reasonReject` sẽ được lưu trong contract record
- PDF đã chú thích sẽ được lưu như file đính kèm
- Recipient status vẫn là `2` (Đã xử lý)

---

## V. Ký và Văn Thư

### BƯỚC 1: Lấy Thông Tin Cần Thiết

Các API lấy thông tin contract, participant, recipient, field tương tự như phần [Điều Phối](#ii-điều-phối).

---

### BƯỚC 2: Lấy Cert (Chứng Thư Số)

**API: Lấy danh sách chứng thư số của user đang đăng nhập**
```
GET /contracts/certs/find-cert-user
```

**Đầu vào**: Không có (lấy theo token authentication)

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": [
        {
            "id": 1,
            "subject": "CN=Phạm Văn Tú",
            "serialNumber": "1234567890",
            "issuer": "CA Name",
            "validFrom": "2025-01-01T00:00:00",
            "validTo": "2026-01-01T00:00:00",
            "status": 1
        }
    ]
}
```

**📝 Lưu ý**: 
- API này lấy danh sách chứng thư số của user đang đăng nhập
- Cần lấy `id` (certId) từ response để sử dụng cho API ký

---

### BƯỚC 3: API Ký

**API: Ký hợp đồng bằng chứng thư số**
```
POST /contracts/processes/certificate
Content-Type: application/json
```

**Mô tả**: Thực hiện ký số bằng certificate đã import. Email người ký được lấy từ JWT và tự gán vào request.

**Query Parameters**:
- `recipientId` (required): ID của người đang ký

**Đầu vào**:
- `recipientId` (query param): ID của người đang ký
- Email người ký được tự động lấy từ JWT token
- Body:

```json
{
    "certId": 1,
    "isTimestamp": "false",
    "imageBase64": null,
    "field": {
        "id": 3,
        "page": 1,
        "boxX": 20.0,
        "boxY": 91.0,
        "boxW": 100.0,
        "boxH": 30.0
    },
    "width": null,
    "height": null,
    "type": 3
}
```

**Tham số**:
| Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
|---------|--------------|----------|-------|
| `certId` | integer | ✅ | ID của chứng thư số |
| `isTimestamp` | string | ❌ | Có đóng dấu thời gian hay không ("true"/"false", default: "false") |
| `imageBase64` | string | ❌ | Ảnh chữ ký dạng base64 (nếu có) |
| `field` | object | ✅ | Thông tin field cần ký |
| `width` | number | ❌ | Chiều rộng ảnh chữ ký |
| `height` | number | ❌ | Chiều cao ảnh chữ ký |
| `type` | integer | ❌ | Loại ký (3 = Ký số) |

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": {
        "id": 1,
        "name": "Phạm Văn Tú",
        "email": "phamvantu.work@gmail.com",
        "role": 3,
        "status": 2,
        "signAt": "2025-11-16T20:48:15.7870609",
        "processAt": "2025-11-16T20:48:15.7870609",
        "fields": [
            {
                "id": 3,
                "name": "CHỮ KÝ SỐ - Chữ ký có con dấu và thông tin",
                "type": 3,
                "status": 1,
                "value": "...",
                ...
            }
        ]
    }
}
```

**📝 Lưu ý**:
- Sau khi ký thành công, `status` của recipient sẽ chuyển thành `2` (Đã xử lý)
- `signAt` và `processAt` sẽ được cập nhật với thời gian ký
- Field được ký sẽ có `status = 1` và có `value` chứa thông tin chữ ký

---

### BƯỚC 4: API Phê Duyệt

**API: Phê duyệt hợp đồng**
```
POST /contracts/recipients/{recipientId}/approve
```

**Đầu vào**: 
- `recipientId` (path): ID của người đang phê duyệt

**Đầu ra**:
```json
{
    "code": "SUCCESS",
    "message": "Success",
    "data": {
        "id": 16,
        "name": "Phạm Văn Tú",
        "email": "phamvantu.work@gmail.com",
        "phone": "",
        "role": 2,
        "status": 2,
        "processAt": "2025-11-16T20:48:15.7870609",
        ...
    }
}
```

**Mô tả**: Tương tự như API xem xét, dùng để phê duyệt hợp đồng sau khi đã ký. Sau khi phê duyệt, `status` của recipient sẽ chuyển thành `2` và `processAt` được cập nhật.

---

## V. Các API Chung

### 1. Lấy Thông Tin Hợp Đồng

**API: Lấy thông tin hợp đồng theo ID**
```
GET /contracts/{contractId}
```

---

### 2. Lấy Thông Tin Participant

**API: Lấy participant theo recipient ID**
```
GET /contracts/participants/by-recipient/{recipientId}
```

**API: Lấy tất cả participant của hợp đồng**
```
GET /contracts/{contractId}/participants
```

---

### 3. Lấy Thông Tin Field

**API: Lấy tất cả field của hợp đồng**
```
GET /contracts/{contractId}/fields
```

---

### 4. Lấy Thông Tin Recipient

**API: Lấy thông tin recipient**
```
GET /contracts/recipients/{recipientId}
```

---

## VI. Sơ Đồ Luồng Điều Phối

```
┌─────────────────────────────────────────────────────────────┐
│              BẮT ĐẦU LUỒNG ĐIỀU PHỐI                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: LẤY THÔNG TIN HỢP ĐỒNG                            │
│  └─ GET /contracts/{contractId}                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: LẤY THÔNG TIN PARTICIPANT                         │
│  ├─ GET /contracts/participants/by-recipient/{recipientId} │
│  └─ GET /contracts/{contractId}/participants               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: LẤY THÔNG TIN FIELD                               │
│  └─ GET /contracts/{contractId}/fields                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: TẠO PARTICIPANT MỚI (Nếu cần)                     │
│  └─ POST /contracts/participants/create-participant/{id}   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 5: TẠO FIELD (Nếu cần)                               │
│  └─ POST /contracts/fields/create                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 6: ĐIỀU PHỐI                                         │
│  └─ POST /contracts/participants/{participantId}/         │
│     recipients/{recipientId}/coordinate                    │
│  Body: [người điều phối, người tham gia tiếp theo]        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              HOÀN TẤT ĐIỀU PHỐI                              │
└─────────────────────────────────────────────────────────────┘
```

---

## VII. Sơ Đồ Luồng Xem Xét

```
┌─────────────────────────────────────────────────────────────┐
│              BẮT ĐẦU LUỒNG XEM XÉT                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: LẤY THÔNG TIN CẦN THIẾT                           │
│  ├─ GET /contracts/{contractId}                            │
│  ├─ GET /contracts/{contractId}/participants              │
│  ├─ GET /contracts/{contractId}/fields                    │
│  └─ GET /contracts/recipients/{recipientId}                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: XEM XÉT                                            │
│  ├─ Chọn "Đồng ý" → POST /contracts/recipients/{id}/review │
│  └─ Chọn "Không đồng ý" → RejectReviewDialog               │
└──────────────────────┬─────────────┬────────────────────────┘
                       │             │
                       ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│              HOÀN TẤT XEM XÉT                                │
└─────────────────────────────────────────────────────────────┘
```

---

## VIII. Sơ Đồ Luồng Từ Chối

```
┌─────────────────────────────────────────────────────────────┐
│              BẮT ĐẦU LUỒNG TỪ CHỐI                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: LẤY THÔNG TIN CẦN THIẾT                           │
│  ├─ GET /contracts/{contractId}                            │
│  ├─ GET /contracts/{contractId}/participants              │
│  ├─ GET /contracts/{contractId}/fields                    │
│  └─ GET /contracts/recipients/{recipientId}                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: ANNOTATE PDF (TÙY CHỌN)                           │
│  ├─ Sử dụng AnnotationToolbar                              │
│  ├─ Vẽ chú thích: Line, Freehand, Rectangle, Text         │
│  └─ Undo/Redo: Ctrl+Z, Ctrl+Y                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: NHẬP LÝ DO TỪ CHỐI                               │
│  └─ Required field: Lý do từ chối chi tiết                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: XỬ LÝ PDF & UPLOAD                                │
│  ├─ Load PDF gốc từ presigned URL                          │
│  ├─ Merge annotations với pdf-lib                          │
│  ├─ Upload PDF đã chú thích                                │
│  └─ Create document record (type=3)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 5: TỪ CHỐI HỢP ĐỒNG                                  │
│  └─ PUT /contracts/change-status/{id}?status=31           │
│  Body: { reason: "lý do từ chối" }                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              HOÀN TẤT TỪ CHỐI                                │
└─────────────────────────────────────────────────────────────┘
```

---

## X. Sơ Đồ Luồng Ký

```
┌─────────────────────────────────────────────────────────────┐
│              BẮT ĐẦU LUỒNG KÝ                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: LẤY THÔNG TIN CẦN THIẾT                           │
│  ├─ GET /contracts/{contractId}                            │
│  ├─ GET /contracts/{contractId}/participants              │
│  ├─ GET /contracts/{contractId}/fields                    │
│  └─ GET /contracts/recipients/{recipientId}                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: LẤY CHỨNG THƯ SỐ                                  │
│  └─ GET /contracts/certs/find-cert-user                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: KÝ HỢP ĐỒNG                                        │
│  └─ POST /contracts/processes/certificate                  │
│  Query: recipientId={id}                                   │
│  Body: { certId, field, isTimestamp, ... }                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: PHÊ DUYỆT (Nếu cần)                               │
│  └─ POST /contracts/recipients/{recipientId}/approve       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              HOÀN TẤT KÝ                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## XI. Lưu Ý Quan Trọng

### 1. Trạng Thái Contract

| Value | Mô tả |
|-------|-------|
| `0` | DRAFT (Bản nháp) |
| `10` | CREATED (Tạo) |
| `20` | PROCESSING (Đang xử lý) |
| `30` | SIGNED (Hoàn thành) |
| `31` | REJECTED (Từ chối) |
| `32` | CANCEL (Hủy bỏ) |
| `35` | SCAN (Lưu trữ) |
| `40` | LIQUIDATED (Thanh lý) |
| `1` | ABOUT_EXPIRE (Sắp hết hạn) |
| `2` | EXPIRE (Quá hạn) |

### 2. Trạng Thái Recipient

| Value | Mô tả |
|-------|-------|
| `1` | Điều phối |
| `2` | Xem xét |
| `3` | Ký |
| `4` | Văn thư |

### 3. Loại Field (Type)

| Value | Mô tả |
|-------|-------|
| `1` | TEXT - Ô text |
| `2` | IMAGE_SIGN - Ô ký ảnh |
| `3` | DIGITAL_SIGN - Ô ký số |
| `4` | CONTRACT_NO - Ô số hợp đồng |
| `5` | MONEY - Ô tiền |

### 4. Sign Type

| Value | Mô tả |
|-------|-------|
| `6` | Ký số (mặc định) |

### 5. Quy Trình Điều Phối

1. Người điều phối (role = 1) sẽ phân công người xử lý tiếp theo
2. Trong request body của API điều phối:
   - Phần tử đầu tiên: Người điều phối (status = 1, role = 1)
   - Các phần tử còn lại: Người tham gia tiếp theo (status = 0, role tương ứng)
3. Sau khi điều phối thành công:
   - Người điều phối: `status` chuyển thành `2`, `processAt` được cập nhật
   - Người tham gia mới: `status = 0` (chờ xử lý)

---

## XII. Checklist Điều Phối

- [ ] Lấy thông tin hợp đồng theo ID
- [ ] Lấy thông tin participant theo recipient ID
- [ ] Lấy thông tin tất cả participant của hợp đồng
- [ ] Lấy thông tin tất cả field của hợp đồng (Bước 3)
- [ ] Tạo participant mới (nếu cần) (Bước 4)
- [ ] Tạo field mới (nếu cần) (Bước 5)
- [ ] Chuẩn bị dữ liệu điều phối (Bước 6):
  - [ ] Lấy thông tin người điều phối từ API
  - [ ] Chuẩn bị danh sách người tham gia tiếp theo
- [ ] Gọi API điều phối với đúng participantId và recipientId
- [ ] Kiểm tra kết quả và cập nhật UI

---

## XIII. Checklist Xem Xét

- [ ] Lấy thông tin hợp đồng
- [ ] Lấy thông tin participant
- [ ] Lấy thông tin field
- [ ] Lấy thông tin recipient
- [ ] Gọi API xem xét
- [ ] Kiểm tra kết quả và cập nhật UI

---

## XIV. Checklist Từ Chối

- [ ] Lấy thông tin hợp đồng theo ID
- [ ] Lấy thông tin participant và recipient
- [ ] Lấy thông tin fields của hợp đồng
- [ ] Mở RejectReviewDialog khi chọn "Không đồng ý"
- [ ] Annotate PDF với các công cụ vẽ (tùy chọn):
  - [ ] Line tool
  - [ ] Freehand tool
  - [ ] Rectangle tool
  - [ ] Text tool
  - [ ] Eraser tool
  - [ ] Undo/Redo (Ctrl+Z, Ctrl+Y)
- [ ] Nhập lý do từ chối (required field)
- [ ] Xử lý PDF và upload:
  - [ ] Load PDF gốc từ presigned URL
  - [ ] Merge annotations sử dụng pdf-lib
  - [ ] Export PDF đã chú thích
  - [ ] Upload lên MinIO storage
  - [ ] Create document record với type=3
- [ ] Từ chối hợp đồng:
  - [ ] Gọi API changeContractStatus với status=31
  - [ ] Truyền reason trong body
  - [ ] Xử lý response và cập nhật UI
- [ ] Kiểm tra kết quả và đóng dialog

---

## XV. Checklist Ký

- [ ] Lấy thông tin hợp đồng
- [ ] Lấy thông tin participant
- [ ] Lấy thông tin field
- [ ] Lấy thông tin recipient
- [ ] Lấy danh sách chứng thư số (cert)
- [ ] Chọn chứng thư số và field cần ký
- [ ] Gọi API certificate với đầy đủ thông tin:
  - [ ] recipientId (query parameter)
  - [ ] certId
  - [ ] field (id, page, boxX, boxY, boxW, boxH)
  - [ ] isTimestamp ("true"/"false")
  - [ ] imageBase64 (optional)
  - [ ] width/height (optional)
  - [ ] type = 3 (ký số)
- [ ] Gọi API phê duyệt (nếu cần)
- [ ] Kiểm tra kết quả và cập nhật UI

---

**📅 Ngày tạo**: 2025-11-16
**📅 Ngày cập nhật**: 2025-11-21
**📝 Version**: 1.2 - Sửa API ký sang certificate

