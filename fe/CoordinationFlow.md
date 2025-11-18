# Luồng Điều Phối - eContact

## Mục lục
- [I. Tổng Quan](#i-tổng-quan)
- [II. Điều Phối](#ii-điều-phối)
- [III. Xem Xét](#iii-xem-xét)
- [IV. Ký và Văn Thư](#iv-ký-và-văn-thư)
- [V. Các API Chung](#v-các-api-chung)
- [VI. Sơ Đồ Luồng Điều Phối](#vi-sơ-đồ-luồng-điều-phối)
- [VII. Sơ Đồ Luồng Xem Xét](#vii-sơ-đồ-luồng-xem-xét)
- [VIII. Sơ Đồ Luồng Ký](#viii-sơ-đồ-luồng-ký)
- [IX. Lưu Ý Quan Trọng](#ix-lưu-ý-quan-trọng)
- [X. Checklist Điều Phối](#x-checklist-điều-phối)
- [XI. Checklist Xem Xét](#xi-checklist-xem-xét)
- [XII. Checklist Ký](#xii-checklist-ký)

---

## I. Tổng Quan

Luồng điều phối bao gồm các bước xử lý hợp đồng:
1. **Điều phối**: Phân công người xử lý tiếp theo
2. **Xem xét**: Xem xét và phê duyệt hợp đồng
3. **Ký**: Ký số hợp đồng
4. **Văn thư**: Hoàn tất thủ tục

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

## IV. Ký và Văn Thư

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

**API: Ký hợp đồng**
```
POST /contracts/recipients/{recipientId}/sign
Content-Type: application/json
```

**Đầu vào**: 
- `recipientId` (path): ID của người đang ký
- Body:

```json
{
    "certId": 1,
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
    "isTimestamp": "false",
    "type": 3
}
```

**Tham số**:
| Tham số | Kiểu dữ liệu | Mô tả |
|---------|--------------|-------|
| `certId` | int | ID của chứng thư số |
| `imageBase64` | string/null | Ảnh chữ ký dạng base64 (nếu có) |
| `field` | object | Thông tin field cần ký |
| `field.id` | int | ID của field |
| `field.page` | int | Số trang |
| `field.boxX` | float | Tọa độ X |
| `field.boxY` | float | Tọa độ Y |
| `field.boxW` | float | Chiều rộng |
| `field.boxH` | float | Chiều cao |
| `width` | int/null | Chiều rộng ảnh chữ ký |
| `height` | int/null | Chiều cao ảnh chữ ký |
| `isTimestamp` | string | Có đóng dấu thời gian hay không ("true"/"false") |
| `type` | int | Loại ký (3 = Ký số) |

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
│  └─ POST /contracts/recipients/{recipientId}/review        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              HOÀN TẤT XEM XÉT                                │
└─────────────────────────────────────────────────────────────┘
```

---

## VIII. Sơ Đồ Luồng Ký

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
│  └─ POST /contracts/recipients/{recipientId}/sign          │
│  Body: { certId, field, type, ... }                        │
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

## IX. Lưu Ý Quan Trọng

### 1. Trạng Thái Recipient

| Value | Mô tả |
|-------|-------|
| `0` | Chưa xử lý |
| `1` | Đang xử lý |
| `2` | Đã xử lý |

### 2. Vai Trò (Role)

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

## X. Checklist Điều Phối

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

## XI. Checklist Xem Xét

- [ ] Lấy thông tin hợp đồng
- [ ] Lấy thông tin participant
- [ ] Lấy thông tin field
- [ ] Lấy thông tin recipient
- [ ] Gọi API xem xét
- [ ] Kiểm tra kết quả và cập nhật UI

---

## XII. Checklist Ký

- [ ] Lấy thông tin hợp đồng
- [ ] Lấy thông tin participant
- [ ] Lấy thông tin field
- [ ] Lấy thông tin recipient
- [ ] Lấy danh sách chứng thư số (cert)
- [ ] Chọn chứng thư số và field cần ký
- [ ] Gọi API ký với đầy đủ thông tin:
  - [ ] certId
  - [ ] field (id, page, boxX, boxY, boxW, boxH)
  - [ ] type = 3 (ký số)
  - [ ] isTimestamp
- [ ] Gọi API phê duyệt (nếu cần)
- [ ] Kiểm tra kết quả và cập nhật UI

---

**📅 Ngày tạo**: 2025-11-16
**📝 Version**: 1.0

