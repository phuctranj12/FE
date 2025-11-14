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

        ### 2.5. Lấy thông tin user từ token
        **Endpoint**: `GET /customers/get-customer-by-token`

        **Headers**:
        ```
        Content-Type: application/json
        Authorization: Bearer {token}
        ```

        **Request Body**: Không có

        **Path Parameters**: Không có

        **Query Parameters**: Không có

        **Example**: `http://localhost:8080/api/customers/get-customer-by-token`

        **Response Success**:
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

        **Response Error (User không tồn tại)**:
        ```json
        {
          "code": "ERR_404",
          "message": "Không tìm thấy khách hàng",
          "data": null
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

        **Mô tả**: Lấy thông tin user hiện tại từ JWT token trong header. Email được extract từ token để tìm user. API này rất hữu ích cho frontend để lấy thông tin user đang đăng nhập mà không cần biết customerId.

        **Lưu ý**: 
        - API này chỉ cần JWT token trong header, không cần truyền thêm parameters nào
        - Token được decode tự động để lấy email của user
        - Nếu email trong token không tồn tại trong database, sẽ trả về lỗi 404

        ---

        ### 2.6. Danh sách user
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

        ### 2.6. Danh sách user
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

        ### 2.7. Lấy thông tin user theo email (Internal)
        **Endpoint**: `GET /customers/internal/get-by-email`

        **Query Parameters**:
        - `email`: string (required)

        **Example**: `http://localhost:8080/api/customers/internal/get-by-email?email=user@example.com`

        **Response**: Tương tự như 2.1

        **Mô tả**: API nội bộ để lấy thông tin user theo email. Được gọi từ Auth Service.

        ---

        ### 2.8. Đăng ký user (Internal)
        **Endpoint**: `POST /customers/internal/register`

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

        ### 2.9. Gợi ý danh sách user
        **Endpoint**: `GET /customers/suggest-list-customer`

        **Query Parameters**:
        - `textSearch`: string (optional)

        **Example**: `http://localhost:8080/api/customers/suggest-list-customer?textSearch=john`

        **Response**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": [
            {
              "name": "string"
            }
          ]
        }
        ```

        **Mô tả**: Gợi ý danh sách user theo từ khóa tìm kiếm.

        ---

        ### 2.10. Lấy user theo customerId (Internal)
        **Endpoint**: `GET /customers/internal/get-by-id`

        **Query Parameters**:
        - `customerId`: integer (required)

        **Response**: Tương tự như 2.1

        **Mô tả**: API nội bộ để lấy thông tin user theo ID. Không dành cho Frontend.

        ---

        ### 2.11. Lấy danh sách user theo tổ chức (Internal)
        **Endpoint**: `GET /customers/internal/get-customer-by-organization`

        **Query Parameters**:
        - `organizationId`: integer (required)

        **Response**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": [
            {
              "id": "integer",
              "name": "string",
              "email": "string"
            }
          ]
        }
        ```

        **Mô tả**: API nội bộ để lấy danh sách user theo tổ chức.

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

        Service quản lý các hợp đồng, tài liệu, chứng thư số và các thông tin liên quan.

        **Configuration**:
        - Port: 8084
        - Context Path: `/api/contracts`

        **Headers chung** (yêu cầu JWT token):
        ```
        Content-Type: application/json
        Authorization: Bearer {token}
        ```

        **Contract Status Constants**:
        - `0`: DRAFT (Bản nháp)
        - `10`: CREATED (Tạo)
        - `20`: PROCESSING (Đang xử lý)
        - `30`: SIGNED (Hoàn thành)
        - `31`: REJECTED (Từ chối)
        - `32`: CANCEL (Hủy bỏ)
        - `35`: SCAN (Lưu trữ)
        - `40`: LIQUIDATED (Thanh lý)
        - `1`: ABOUT_EXPIRE (Sắp hết hạn)
        - `2`: EXPIRE (Quá hạn)

        ---

        ### 7.1. Contract API

        #### 7.1.1. Kiểm tra mã hợp đồng unique
        **Endpoint**: `GET /contracts/check-code-unique`

        **Query Parameters**:
        - `code`: string (required) - Mã hợp đồng cần kiểm tra

        **Example**: `http://localhost:8080/api/contracts/check-code-unique?code=HD001`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": true
        }
        ```

        **Mô tả**: Kiểm tra mã hợp đồng có duy nhất hay không trong hệ thống. Trả về `true` nếu unique (có thể sử dụng), `false` nếu đã tồn tại.

        ---

        #### 7.1.2. Tạo hợp đồng mới
        **Endpoint**: `POST /contracts/create-contract`

        **Request Body**:
        ```json
        {
          "name": "string (required, not null)",
          "contractNo": "string (optional)",
          "signTime": "string (required, format: yyyy-MM-ddTHH:mm:ss)",
          "note": "string (optional)",
          "contractRefs": [
            {
              "refId": "integer (optional) - ID hợp đồng tham chiếu"
            }
          ],
          "typeId": "integer (optional)",
          "isTemplate": "boolean (optional)",
          "templateContractId": "integer (optional)",
          "contractExpireTime": "string (optional, format: yyyy-MM-ddTHH:mm:ss)"
        }
        ```

        **Validation**:
        - `name`: @NotNull - Tên hợp đồng không được null
        - `signTime`: @NotNull - Thời gian ký không được null

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "name": "string",
            "contractNo": "string",
            "signTime": "string (format: yyyy-MM-ddTHH:mm:ss)",
            "note": "string",
            "typeId": "integer",
            "customerId": "integer",
            "isTemplate": "boolean",
            "templateContractId": "integer",
            "status": "integer (0 - DRAFT mặc định khi tạo)",
            "organizationId": "integer",
            "reasonReject": "string",
            "contractExpireTime": "string (format: yyyy-MM-ddTHH:mm:ss)",
            "contractRefs": [
              {
                "id": "integer",
                "contractId": "integer",
                "refId": "integer",
                "refName": "string",
                "path": "string"
              }
            ],
            "participants": [],
            "createdBy": "integer",
            "updatedBy": "integer",
            "createdAt": "string (format: yyyy-MM-ddTHH:mm:ss)",
            "updatedAt": "string (format: yyyy-MM-ddTHH:mm:ss)"
          }
        }
        ```

        **Mô tả**: Tạo một hợp đồng mới trong hệ thống. Người tạo được lấy từ JWT authentication. Hợp đồng được tạo với trạng thái DRAFT (0) mặc định. customerId và organizationId được lấy từ thông tin user đang đăng nhập.

        ---

        #### 7.1.3. Lấy thông tin hợp đồng theo ID
        **Endpoint**: `GET /contracts/{contractId}`

        **Path Parameters**:
        - `contractId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "name": "string",
            "contractNo": "string",
            "signTime": "string",
            "status": "integer",
            "typeId": "integer",
            "note": "string",
            "createdBy": "integer",
            "createdAt": "string",
            "updatedAt": "string",
            "contractExpireTime": "string",
            "isTemplate": "boolean",
            "participants": [],
            "documents": [],
            "fields": []
          }
        }
        ```

        **Response Error (Contract không tồn tại)**:
        ```json
        {
          "code": "ERR_404",
          "message": "Không tìm thấy hợp đồng",
          "data": null
        }
        ```

        ---

        #### 7.1.4. Thay đổi trạng thái hợp đồng
        **Endpoint**: `PUT /contract/{contractId}/change-status/{status}`

        **Path Parameters**:
        - `contractId`: integer (required) - ID của hợp đồng
        - `status`: integer (required) - Trạng thái mới (0, 10, 20, 30, 31, 32, 35, 40)

        **Example**: `http://localhost:8080/api/contract/1/change-status/20`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": "Cập nhật trạng thái hợp đồng thành công"
        }
        ```

        **Mô tả**: Cập nhật trạng thái của một hợp đồng. Các trạng thái hợp lệ: DRAFT(0), CREATED(10), PROCESSING(20), SIGNED(30), REJECTED(31), CANCEL(32), SCAN(35), LIQUIDATED(40).

        ---

        #### 7.1.5. Danh sách hợp đồng mình đã tạo
        **Endpoint**: `GET /contracts/my-contracts`

        **Request Body**:
        ```json
        {
          "page": "integer (optional, default: 0)",
          "size": "integer (optional, default: 10)",
          "textSearch": "string (optional)",
          "status": "integer (optional)",
          "fromDate": "string (optional, format: yyyy-MM-dd)",
          "toDate": "string (optional, format: yyyy-MM-dd)",
          "organizationId": "integer (optional)"
        }
        ```

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "content": [
              {
                "id": "integer",
                "name": "string",
                "contractNo": "string",
                "status": "integer",
                "signTime": "string",
                "createdAt": "string"
              }
            ],
            "totalElements": "integer",
            "totalPages": "integer",
            "size": "integer",
            "number": "integer"
          }
        }
        ```

        **Mô tả**: Lấy danh sách các hợp đồng mà user hiện tại đã tạo, có hỗ trợ phân trang và tìm kiếm.

        ---

        #### 7.1.6. Danh sách hợp đồng mình tham gia xử lý
        **Endpoint**: `GET /contracts/my-process`

        **Request Body**: Tương tự 7.1.5

        **Response**: Tương tự 7.1.5

        **Mô tả**: Lấy danh sách các hợp đồng mà user hiện tại tham gia xử lý (là recipient trong hợp đồng). Status 1 - chờ xử lý, 2 - đã xử lý.

        ---

        #### 7.1.7. Danh sách hợp đồng theo tổ chức
        **Endpoint**: `GET /contracts/contract-by-organization`

        **Request Body**:
        ```json
        {
          "page": "integer (optional, default: 0)",
          "size": "integer (optional, default: 10)",
          "textSearch": "string (optional)",
          "status": "integer (optional)",
          "fromDate": "string (optional)",
          "toDate": "string (optional)",
          "organizationId": "integer (required)"
        }
        ```

        **Response**: Tương tự 7.1.5

        **Mô tả**: Lấy danh sách hợp đồng theo tổ chức, có phân trang và tìm kiếm.

        ---

        #### 7.1.8. Cập nhật hợp đồng
        **Endpoint**: `PUT /contracts/update-contract/{contractId}`

        **Path Parameters**:
        - `contractId`: integer (required)

        **Request Body**: Tương tự 7.1.2

        **Response**: Thông tin hợp đồng đã cập nhật (tương tự 7.1.2)

        **Response Error (Contract không tồn tại)**:
        ```json
        {
          "code": "ERR_404",
          "message": "Không tìm thấy hợp đồng",
          "data": null
        }
        ```

        ---

        #### 7.1.9. Lấy luồng BPMN của hợp đồng
        **Endpoint**: `GET /contracts/bpmn-flow/{contractId}`

        **Path Parameters**:
        - `contractId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/bpmn-flow/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "bpmnFlow": "string (XML content)"
          }
        }
        ```

        **Mô tả**: Lấy thông tin luồng BPMN (Business Process Model and Notation) của một hợp đồng. BPMN flow được dùng để hiển thị quy trình xử lý hợp đồng.

        ---

        ### 7.2. Document API (`/contracts/documents`)

        **Document Type Constants**:
        - `1`: GOC (File gốc)
        - `2`: VIEW (File xem)
        - `3`: DINH_KEM (File đính kèm)

        ---

        #### 7.2.1. Lấy số lượng trang PDF
        **Endpoint**: `GET /contracts/documents/get-page-size`

        **Content-Type**: `multipart/form-data`

        **Request Parameters**:
        - `file`: MultipartFile (required) - File PDF cần kiểm tra

        **Example**: Upload file PDF thông qua form-data

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
    "fileName": "string (tên file PDF)",
    "numberOfPages": "string (số trang của file)"
          }
        }
        ```

        **Response Error (File không phải PDF)**:
        ```json
        {
          "code": "ERR_400",
          "message": "File không đúng định dạng PDF",
          "data": null
        }
        ```

        **Mô tả**: Kiểm tra số lượng trang của tài liệu PDF được tải lên. Hữu ích khi cần validate hoặc hiển thị thông tin về tài liệu.

        ---

        #### 7.2.2. Kiểm tra chữ ký số trong tài liệu
        **Endpoint**: `GET /contracts/documents/check-signature`

        **Content-Type**: `multipart/form-data`

        **Request Parameters**:
        - `file`: MultipartFile (required) - File PDF cần kiểm tra

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "hasSignature": true
          }
        }
        ```

        **Mô tả**: Kiểm tra xem tài liệu PDF có chứa chữ ký số hay không. Trả về `true` nếu có chữ ký số, `false` nếu không có.

        ---

        #### 7.2.3. Tải lên tài liệu
        **Endpoint**: `POST /contracts/documents/upload-document`

        **Content-Type**: `multipart/form-data`

        **Request Parameters**:
        - `file`: MultipartFile (required) - File tài liệu cần upload

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "url": "string (URL đầy đủ đến file trên MinIO)",
            "fileName": "string (tên file đã được lưu)",
            "path": "string (đường dẫn trong bucket)"
          }
        }
        ```

        **Response Error (File quá lớn)**:
        ```json
        {
          "code": "ERR_400",
          "message": "File vượt quá kích thước cho phép",
          "data": null
        }
        ```

        **Mô tả**: Tải lên tài liệu lên hệ thống MinIO storage. Sau khi upload thành công, cần dùng API 7.2.4 để tạo bản ghi trong database.

        **Note**: File được lưu trữ trên MinIO (Object Storage), không lưu trực tiếp trong database.

        ---

        #### 7.2.4. Tạo bản ghi tài liệu
        **Endpoint**: `POST /contracts/documents/create-document`

        **Request Body**:
        ```json
        {
          "name": "string (optional)",
          "type": "integer (required, 1-GOC, 2-VIEW, 3-DINH_KEM)",
          "contractId": "integer (required)",
          "fileName": "string (required)",
          "path": "string (required)",
          "status": "integer (optional)"
        }
        ```

        **Validation**:
        - `type`: Required, phải là 1 (GOC), 2 (VIEW), hoặc 3 (DINH_KEM)
        - `contractId`: Required, hợp đồng phải tồn tại
        - `fileName`: Required, tên file đã upload
        - `path`: Required, đường dẫn file trên MinIO

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "name": "string",
            "type": "integer",
            "contractId": "integer",
            "fileName": "string",
            "path": "string",
            "status": "integer",
            "createdAt": "string"
          }
        }
        ```

        **Mô tả**: Tạo bản ghi tài liệu trong database sau khi đã upload file lên MinIO. Liên kết tài liệu với hợp đồng. Type: GOC(1) - file gốc, VIEW(2) - file xem, DINH_KEM(3) - file đính kèm.

        ---

        #### 7.2.5. Lấy URL truy cập tài liệu
        **Endpoint**: `GET /contracts/documents/get-presigned-url/{docId}`

        **Path Parameters**:
        - `docId`: integer (required) - ID của document

        **Example**: `http://localhost:8080/api/contracts/documents/get-presigned-url/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "url": "string (presigned URL có thời gian hết hạn)"
          }
        }
        ```

        **Response Error (Document không tồn tại)**:
        ```json
        {
          "code": "ERR_404",
          "message": "Không tìm thấy tài liệu",
          "data": null
        }
        ```

        **Mô tả**: Lấy URL truy cập tạm thời (presigned URL) cho tài liệu đã lưu trữ trên MinIO. URL này có thời gian hết hạn để bảo mật. Frontend sử dụng URL này để download hoặc hiển thị tài liệu.

        ---

        #### 7.2.6. Lấy tài liệu theo hợp đồng
        **Endpoint**: `GET /contracts/documents/get-document-by-contract/{contractId}`

        **Path Parameters**:
        - `contractId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/documents/get-document-by-contract/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": [
            {
              "id": "integer",
              "name": "string",
              "type": "integer",
              "fileName": "string",
              "path": "string",
              "status": "integer",
              "createdAt": "string"
            }
          ]
        }
        ```

        **Mô tả**: Lấy danh sách tất cả tài liệu liên quan đến một hợp đồng cụ thể.

        ---

        ### 7.3. Type API (`/contracts/types`)

        #### 7.3.1. Tạo loại hợp đồng mới
        **Endpoint**: `POST /contracts/types`

        **Request Body**:
        ```json
        {
          "name": "string (required)",
          "organizationId": "integer (optional)",
          "status": "integer (optional)"
        }
        ```

        **Validation**:
        - `name`: Required - Tên loại hợp đồng không được null

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "name": "string",
            "organizationId": "integer",
            "status": "integer"
          }
        }
        ```

        **Response Error (Loại hợp đồng đã tồn tại)**:
        ```json
        {
          "code": "ERR_400",
          "message": "Loại hợp đồng đã tồn tại",
          "data": null
        }
        ```

        **Mô tả**: Tạo một loại hợp đồng mới trong hệ thống (ví dụ: Hợp đồng mua bán, Hợp đồng thuê, Hợp đồng dịch vụ, ...).

        ---

        #### 7.3.2. Cập nhật loại hợp đồng
        **Endpoint**: `PUT /contracts/types/{typeId}`

        **Path Parameters**:
        - `typeId`: integer (required)

        **Request Body**: Tương tự 7.3.1

        **Response Success**: Tương tự 7.3.1

        **Response Error (Type không tồn tại)**:
        ```json
        {
          "code": "ERR_404",
          "message": "Không tìm thấy loại hợp đồng",
          "data": null
        }
        ```

        ---

        #### 7.3.3. Xóa loại hợp đồng
        **Endpoint**: `DELETE /contracts/types/{typeId}`

        **Path Parameters**:
        - `typeId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/types/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": "Xóa loại hợp đồng thành công"
        }
        ```

        **Response Error (Type đang được sử dụng)**:
        ```json
        {
          "code": "ERR_400",
          "message": "Không thể xóa loại hợp đồng đang được sử dụng",
          "data": null
        }
        ```

        **Mô tả**: Xóa một loại hợp đồng. Không thể xóa nếu có hợp đồng đang sử dụng loại này.

        ---

        #### 7.3.4. Lấy loại hợp đồng theo ID
        **Endpoint**: `GET /contracts/types/{typeId}`

        **Path Parameters**:
        - `typeId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/types/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "name": "string",
            "organizationId": "integer",
            "status": "integer"
          }
        }
        ```

        ---

        #### 7.3.5. Lấy tất cả loại hợp đồng
        **Endpoint**: `GET /contracts/types`

        **Query Parameters**:
        - `page`: integer (default: 0, optional)
        - `size`: integer (default: 10, optional)
        - `textSearch`: string (optional)
        - `organizationId`: integer (optional)

        **Example**: `http://localhost:8080/api/contracts/types?page=0&size=10&textSearch=mua`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "content": [
              {
                "id": "integer",
                "name": "string",
                "organizationId": "integer",
                "status": "integer"
              }
            ],
            "totalElements": "integer",
            "totalPages": "integer",
            "size": "integer",
            "number": "integer"
          }
        }
        ```

        **Mô tả**: Lấy danh sách tất cả loại hợp đồng có phân trang và tìm kiếm.

        ---

        ### 7.4. Participant API (`/contracts/participants`)

        **Participant Type Constants**:
        - `1`: MY_ORGANIZATION (Tổ chức của tôi)
        - `2`: ORGANIZATION (Tổ chức đối tác)
        - `3`: PERSONAL (Cá nhân)

        ---

        #### 7.4.1. Tạo tổ chức tham gia hợp đồng
        **Endpoint**: `POST /contracts/participants/create-participant/{contractId}`

        **Path Parameters**:
        - `contractId`: integer (required)

        **Request Body**:
        ```json
        [
          {
            "name": "string (optional)",
            "type": "integer (optional, 1-MY_ORGANIZATION, 2-ORGANIZATION, 3-PERSONAL)",
            "ordering": "integer (optional) - Thứ tự xử lý",
            "status": "integer (optional)",
            "taxCode": "string (optional)",
            "recipients": []
          }
        ]
        ```

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": [
            {
              "id": "integer",
              "name": "string",
              "type": "integer",
              "ordering": "integer",
              "status": "integer",
              "taxCode": "string",
              "contractId": "integer",
              "recipients": []
            }
          ]
        }
        ```

        **Mô tả**: Tạo danh sách tổ chức tham gia hợp đồng. Type: 1 - Tổ chức của tôi, 2 - Tổ chức đối tác, 3 - Cá nhân.

        ---

        #### 7.4.2. Lấy thông tin tổ chức tham gia theo ID
        **Endpoint**: `GET /contracts/participants/{participantId}`

        **Path Parameters**:
        - `participantId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/participants/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "name": "string",
            "type": "integer",
            "ordering": "integer",
            "status": "integer",
            "taxCode": "string",
            "contractId": "integer",
            "recipients": []
          }
        }
        ```

        **Mô tả**: Lấy thông tin chi tiết của một tổ chức tham gia hợp đồng dựa trên ID.

        ---

        #### 7.4.3. Lấy danh sách tổ chức tham gia theo hợp đồng
        **Endpoint**: `GET /contracts/participants/by-contract/{contractId}`

        **Path Parameters**:
        - `contractId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/participants/by-contract/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": [
            {
              "id": "integer",
              "name": "string",
              "type": "integer",
              "ordering": "integer",
              "status": "integer",
              "taxCode": "string",
              "contractId": "integer",
              "recipients": []
            }
          ]
        }
        ```

        **Mô tả**: Lấy danh sách các tổ chức tham gia hợp đồng dựa trên ID hợp đồng.

        ---

        ### 7.5. Field API (`/contracts/fields`)

        #### 7.5.1. Thêm trường dữ liệu cho hợp đồng
        **Endpoint**: `POST /contracts/fields/create`

        **Request Body**:
        ```json
        [
          {
            "name": "string (optional)",
            "type": "integer (required)",
            "value": "string (optional)",
            "font": "string (required, max 63 chars)",
            "fontSize": "short (required, min 1)",
            "page": "short (required, min 1)",
            "boxX": "double (optional)",
            "boxY": "double (optional)",
            "boxW": "double (optional)",
            "boxH": "double (optional)",
            "status": "integer (optional)",
            "contractId": "integer (required)",
            "documentId": "integer (required)",
            "recipientId": "integer (optional)",
            "ordering": "integer (optional)"
          }
        ]
        ```

        **Validation**:
        - `font`: @NotBlank, @Length(max = 63) - Font không được để trống và tối đa 63 ký tự
        - `fontSize`: @Min(1) - Font size phải lớn hơn hoặc bằng 1
        - `page`: @Min(1) - Số trang phải lớn hơn hoặc bằng 1

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": [
            {
              "id": "integer",
              "name": "string",
              "type": "integer",
              "value": "string",
              "font": "string",
              "fontSize": "short",
              "page": "short",
              "boxX": "double",
              "boxY": "double",
              "boxW": "double",
              "boxH": "double",
              "status": "integer",
              "contractId": "integer",
              "documentId": "integer",
              "recipientId": "integer",
              "ordering": "integer"
            }
          ]
        }
        ```

        **Mô tả**: Thêm mới danh sách trường dữ liệu cho hợp đồng. Các trường này dùng để định nghĩa vị trí và thuộc tính của các field cần điền trong quá trình ký hợp đồng.

        ---

        ### 7.6. Recipient API (`/contracts/recipients`)

        #### 7.6.1. Lấy thông tin người xử lý theo ID
        **Endpoint**: `GET /contracts/recipients/{recipientId}`

        **Path Parameters**:
        - `recipientId`: integer (required)

        **Example**: `http://localhost:8080/api/contracts/recipients/1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "name": "string",
            "email": "string",
            "phone": "string",
            "role": "integer",
            "username": "string",
            "ordering": "integer",
            "status": "integer",
            "fromAt": "date",
            "dueAt": "date",
            "signAt": "date",
            "processAt": "date",
            "signType": "integer",
            "notifyType": "string",
            "remind": "integer",
            "remindDate": "date",
            "remindMessage": "string",
            "reasonReject": "string",
            "cardId": "string"
          }
        }
        ```

        **Mô tả**: Lấy thông tin người xử lý/người ký theo ID.

        ---

        ### 7.7. Share API (`/contracts/shares`)

        #### 7.7.1. Tạo chia sẻ hợp đồng
        **Endpoint**: `POST /contracts/shares`

        **Request Body**:
        ```json
        {
          "email": ["string (required)"],
          "contractId": "integer (required)"
        }
        ```

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "contractId": "integer",
            "sharedWith": ["string (email)"],
            "createdAt": "string"
          }
        }
        ```

        **Mô tả**: Tạo mới chia sẻ hợp đồng cho người dùng khác. Gửi danh sách email của những người cần được chia sẻ.

        ---

        #### 7.7.2. Lấy danh sách chia sẻ hợp đồng
        **Endpoint**: `GET /contracts/shares`

        **Request Body**:
        ```json
        {
          "page": "integer (optional, default: 0)",
          "size": "integer (optional, default: 10)",
          "textSearch": "string (optional)",
          "status": "integer (optional)",
          "fromDate": "string (optional)",
          "toDate": "string (optional)",
          "organizationId": "integer (optional)"
        }
        ```

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "content": [
              {
                "id": "integer",
                "contractId": "integer",
                "contractName": "string",
                "sharedWith": "string",
                "createdAt": "string"
              }
            ],
            "totalElements": "integer",
            "totalPages": "integer",
            "size": "integer",
            "number": "integer"
          }
        }
        ```

        **Mô tả**: Lấy danh sách chia sẻ hợp đồng với phân trang và tìm kiếm.

        ---

        ### 7.8. Contract Ref API (`/contracts/contract-refs`)

        #### 7.8.1. Lấy tất cả tham chiếu hợp đồng
        **Endpoint**: `GET /contracts/contract-refs/all-refs`

        **Query Parameters**:
        - `page`: integer (default: 0, optional)
        - `size`: integer (default: 10, optional)
        - `textSearch`: string (optional)
        - `organizationId`: integer (optional)

        **Example**: `http://localhost:8080/api/contracts/contract-refs/all-refs?page=0&size=10&textSearch=HD`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "content": [
              {
                "id": "integer",
                "contractId": "integer",
                "refContractId": "integer",
                "refContractName": "string",
                "createdAt": "string"
              }
            ],
            "totalElements": "integer",
            "totalPages": "integer",
            "size": "integer",
            "number": "integer"
          }
        }
        ```

        **Mô tả**: Lấy tất cả tham chiếu hợp đồng trong hệ thống. Tham chiếu hợp đồng dùng để liên kết các hợp đồng có liên quan với nhau.

        ---

        ### 7.9. Certificate API (`/contracts/certs`)

        Certificate API quản lý chứng thư số (.p12) cho việc ký số hợp đồng.

        ---

        #### 7.9.1. Import chứng thư số
        **Endpoint**: `POST /contracts/certs/import-cert`

        **Content-Type**: `multipart/form-data`

        **Request Parameters**:
        - `file`: MultipartFile (required) - File chứng thư số .p12
        - `list_email`: string[] (optional) - Danh sách email người dùng được phép sử dụng chứng thư số này
        - `password`: string (required) - Mật khẩu của file .p12
        - `status`: integer (required) - Trạng thái chứng thư số

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "subject": "string",
            "serialNumber": "string",
            "issuer": "string",
            "validFrom": "date",
            "validTo": "date",
            "status": "integer",
            "createdAt": "string"
          }
        }
        ```

        **Response Error (File không đúng định dạng)**:
        ```json
        {
          "code": "FILE_DONT_TYPE_P12",
          "message": "File không đúng định dạng .p12",
          "data": null
        }
        ```

        **Response Error (Import thất bại)**:
        ```json
        {
          "code": "CREATE_CERT_FAILED",
          "message": "Import chứng thư số thất bại",
          "data": null
        }
        ```

        **Mô tả**: Import chứng thư số từ file .p12 lên hệ thống. File phải có định dạng .p12 và có mật khẩu hợp lệ.

        ---

        #### 7.9.2. Lấy chứng thư số theo user
        **Endpoint**: `GET /contracts/certs/find-cert-user`

        **Example**: `http://localhost:8080/api/contracts/certs/find-cert-user`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": [
            {
              "id": "integer",
              "subject": "string",
              "serialNumber": "string",
              "issuer": "string",
              "validFrom": "date",
              "validTo": "date",
              "status": "integer"
            }
          ]
        }
        ```

        **Mô tả**: Lấy danh sách chứng thư số của user đang đăng nhập. User được lấy từ JWT authentication.

        ---

        #### 7.9.3. Cập nhật thông tin user từ chứng thư số
        **Endpoint**: `POST /contracts/certs/update-user-from-cert`

        **Query Parameters**:
        - `certificateId`: integer (required) - ID của chứng thư số
        - `status`: integer (required) - Trạng thái mới
        - `list_email`: string[] (optional) - Danh sách email người dùng được thêm vào

        **Example**: `http://localhost:8080/api/contracts/certs/update-user-from-cert?certificateId=1&status=1&list_email=user1@example.com&list_email=user2@example.com`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "certificateId": "integer",
            "users": [
              {
                "id": "integer",
                "email": "string",
                "name": "string"
              }
            ]
          }
        }
        ```

        **Mô tả**: Cập nhật thông tin user có quyền sử dụng chứng thư số. Thêm user mới vào chứng thư số.

        ---

        #### 7.9.4. Xóa user khỏi chứng thư số
        **Endpoint**: `DELETE /contracts/certs/remove-user-from-cert`

        **Query Parameters**:
        - `certificateId`: integer (required) - ID của chứng thư số
        - `customerIds`: integer[] (required) - Danh sách ID customer cần xóa

        **Example**: `http://localhost:8080/api/contracts/certs/remove-user-from-cert?certificateId=1&customerIds=1&customerIds=2`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": "Xóa user khỏi chứng thư số thành công"
        }
        ```

        **Mô tả**: Xóa user khỏi danh sách được phép sử dụng chứng thư số.

        ---

        #### 7.9.5. Lấy thông tin chứng thư số
        **Endpoint**: `GET /contracts/certs/cert-information`

        **Query Parameters**:
        - `certificateId`: integer (required) - ID của chứng thư số

        **Example**: `http://localhost:8080/api/contracts/certs/cert-information?certificateId=1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "subject": "string",
            "serialNumber": "string",
            "issuer": "string",
            "validFrom": "date",
            "validTo": "date",
            "status": "integer",
            "publicKey": "string",
            "algorithm": "string",
            "version": "integer"
          }
        }
        ```

        **Mô tả**: Lấy thông tin chi tiết chứng thư số theo ID, bao gồm cả thông tin kỹ thuật của certificate.

        ---

        #### 7.9.6. Lấy chứng thư số theo ID
        **Endpoint**: `GET /contracts/certs/find-cert-by-id`

        **Query Parameters**:
        - `certificateId`: integer (required) - ID của chứng thư số

        **Example**: `http://localhost:8080/api/contracts/certs/find-cert-by-id?certificateId=1`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "id": "integer",
            "subject": "string",
            "serialNumber": "string",
            "issuer": "string",
            "validFrom": "date",
            "validTo": "date",
            "status": "integer",
            "users": [
              {
                "id": "integer",
                "email": "string",
                "name": "string"
              }
            ]
          }
        }
        ```

        **Mô tả**: Lấy chứng thư số theo ID với danh sách user được phép sử dụng.

        ---

        #### 7.9.7. Tìm kiếm chứng thư số
        **Endpoint**: `GET /contracts/certs/find-cert`

        **Query Parameters**:
        - `subject`: string (default: "", optional) - Tìm kiếm theo subject
        - `serial_number`: string (default: "", optional) - Tìm kiếm theo serial number
        - `status`: integer (default: 1, optional) - Lọc theo trạng thái
        - `size`: integer (default: 10, optional) - Số lượng kết quả trên 1 trang
        - `page`: integer (default: 0, optional) - Số trang

        **Example**: `http://localhost:8080/api/contracts/certs/find-cert?subject=VHC&status=1&page=0&size=10`

        **Response Success**:
        ```json
        {
          "code": "SUCCESS",
          "message": "Success",
          "data": {
            "content": [
              {
                "id": "integer",
                "subject": "string",
                "serialNumber": "string",
                "issuer": "string",
                "validFrom": "date",
                "validTo": "date",
                "status": "integer"
              }
            ],
            "totalElements": "integer",
            "totalPages": "integer",
            "size": "integer",
            "number": "integer"
          }
        }
        ```

        **Mô tả**: Tìm kiếm chứng thư số với các tiêu chí lọc và phân trang. Hỗ trợ tìm kiếm theo subject, serial number và status.

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
        | Contract | 8084 | `/api/contracts` |

        **Note**: 
        - Port của Auth và Customer services được quản lý bởi Eureka và Gateway.
        - Các endpoint có prefix `/internal/` là API nội bộ dùng cho giao tiếp giữa các service, không dành cho Frontend.

        **Storage Configuration**:
        - **MinIO**: http://127.0.0.1:9000
          - Bucket: `contracts`
          - Access Key: `minioadmin`
          - Secret Key: `minioadmin`
          - Sử dụng để lưu trữ tài liệu hợp đồng, file PDF

        ---

        ## API Endpoints Summary

        ### Authentication Service (3 endpoints)
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/auth/login` | ❌ | Đăng nhập |
        | POST | `/auth/register` | ❌ | Đăng ký tài khoản |
        | POST | `/auth/logout` | ✅ | Đăng xuất |

        ### Customer Service (12 endpoints)
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/customers/create-customer` | ✅ | Tạo mới user |
        | PUT | `/customers/update-customer/{customerId}` | ✅ | Cập nhật thông tin user |
        | DELETE | `/customers/delete-customer/{customerId}` | ✅ | Xóa user |
        | GET | `/customers/{customerId}` | ✅ | Xem chi tiết user |
        | GET | `/customers/get-customer-by-token` | ✅ | Lấy thông tin user từ token |
        | GET | `/customers/get-all-customer` | ✅ | Danh sách user (phân trang) |
        | GET | `/customers/internal/get-by-email` | ✅ | Lấy user theo email (Internal) |
        | POST | `/customers/internal/register` | ✅ | Đăng ký user (Internal) |
        | PUT | `/customers/change-password/{customerId}` | ✅ | Đổi mật khẩu |
        | GET | `/customers/suggest-list-customer` | ✅ | Gợi ý danh sách user |
        | GET | `/customers/internal/get-by-id` | ✅ | Lấy user theo ID (Internal) |
        | GET | `/customers/internal/get-customer-by-organization` | ✅ | Lấy user theo tổ chức (Internal) |

        ### Role Service (5 endpoints)
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/customers/roles/create` | ✅ | Tạo mới vai trò |
        | PUT | `/customers/roles/update/{roleId}` | ✅ | Cập nhật vai trò |
        | DELETE | `/customers/roles/delete/{roleId}` | ✅ | Xóa vai trò |
        | GET | `/customers/roles/get-all` | ✅ | Danh sách vai trò (phân trang) |
        | GET | `/customers/roles/{roleId}` | ✅ | Chi tiết vai trò |

        ### Organization Service (5 endpoints)
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/customers/organizations/create` | ✅ | Tạo mới tổ chức |
        | DELETE | `/customers/organizations/delete/{organizationId}` | ✅ | Xóa tổ chức |
        | PUT | `/customers/organizations/update/{organizationId}` | ✅ | Cập nhật tổ chức |
        | GET | `/customers/organizations/get-all` | ✅ | Danh sách tổ chức (phân trang) |
        | GET | `/customers/organizations/{organizationId}` | ✅ | Chi tiết tổ chức |

        ### Permission Service (1 endpoint)
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | GET | `/customers/permissions/get-all` | ✅ | Danh sách phân quyền (phân trang) |

        ### Contract Service (36 endpoints)

        **Contract APIs (9 endpoints):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | GET | `/contracts/check-code-unique` | ✅ | Kiểm tra mã hợp đồng unique |
        | POST | `/contracts/create-contract` | ✅ | Tạo hợp đồng mới |
        | GET | `/contracts/{contractId}` | ✅ | Lấy hợp đồng theo ID |
        | PUT | `/contract/{contractId}/change-status/{status}` | ✅ | Thay đổi trạng thái hợp đồng |
        | GET | `/contracts/my-contracts` | ✅ | Danh sách hợp đồng mình tạo |
        | GET | `/contracts/my-process` | ✅ | Danh sách hợp đồng mình xử lý |
        | GET | `/contracts/contract-by-organization` | ✅ | Danh sách hợp đồng theo tổ chức |
        | PUT | `/contracts/update-contract/{contractId}` | ✅ | Cập nhật hợp đồng |
        | GET | `/contracts/bpmn-flow/{contractId}` | ✅ | Lấy luồng BPMN |

        **Document APIs (6 endpoints):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | GET | `/contracts/documents/get-page-size` | ✅ | Lấy số trang PDF |
        | GET | `/contracts/documents/check-signature` | ✅ | Kiểm tra chữ ký số |
        | POST | `/contracts/documents/upload-document` | ✅ | Tải lên tài liệu |
        | POST | `/contracts/documents/create-document` | ✅ | Tạo bản ghi tài liệu |
        | GET | `/contracts/documents/get-presigned-url/{docId}` | ✅ | Lấy URL truy cập tài liệu |
        | GET | `/contracts/documents/get-document-by-contract/{contractId}` | ✅ | Lấy tài liệu theo hợp đồng |

        **Type APIs (5 endpoints):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/contracts/types` | ✅ | Tạo loại hợp đồng |
        | PUT | `/contracts/types/{typeId}` | ✅ | Cập nhật loại hợp đồng |
        | DELETE | `/contracts/types/{typeId}` | ✅ | Xóa loại hợp đồng |
        | GET | `/contracts/types/{typeId}` | ✅ | Lấy loại hợp đồng theo ID |
        | GET | `/contracts/types` | ✅ | Lấy tất cả loại hợp đồng |

        **Participant APIs (3 endpoints):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/contracts/participants/create-participant/{contractId}` | ✅ | Tạo tổ chức tham gia |
        | GET | `/contracts/participants/{participantId}` | ✅ | Lấy tổ chức tham gia theo ID |
        | GET | `/contracts/participants/by-contract/{contractId}` | ✅ | Lấy tổ chức tham gia theo hợp đồng |

        **Field APIs (1 endpoint):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/contracts/fields/create` | ✅ | Thêm trường dữ liệu |

        **Recipient APIs (1 endpoint):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | GET | `/contracts/recipients/{recipientId}` | ✅ | Lấy người xử lý theo ID |

        **Share APIs (2 endpoints):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/contracts/shares` | ✅ | Tạo chia sẻ hợp đồng |
        | GET | `/contracts/shares` | ✅ | Lấy danh sách chia sẻ |

        **Contract Ref APIs (1 endpoint):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | GET | `/contracts/contract-refs/all-refs` | ✅ | Lấy tham chiếu hợp đồng |

        **Certificate APIs (7 endpoints):**
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | POST | `/contracts/certs/import-cert` | ✅ | Import chứng thư số |
        | GET | `/contracts/certs/find-cert-user` | ✅ | Lấy chứng thư số theo user |
        | POST | `/contracts/certs/update-user-from-cert` | ✅ | Cập nhật user từ chứng thư số |
        | DELETE | `/contracts/certs/remove-user-from-cert` | ✅ | Xóa user khỏi chứng thư số |
        | GET | `/contracts/certs/cert-information` | ✅ | Lấy thông tin chứng thư số |
        | GET | `/contracts/certs/find-cert-by-id` | ✅ | Lấy chứng thư số theo ID |
        | GET | `/contracts/certs/find-cert` | ✅ | Tìm kiếm chứng thư số |

        ### Gateway Service (1 endpoint)
        | Method | Endpoint | Auth Required | Description |
        |--------|----------|---------------|-------------|
        | GET | `/xin-chao` | ❌ | Test endpoint |

        ---

        **Tổng cộng: 63 API endpoints**

        **Chi tiết theo service:**
        - Authentication Service: 3 endpoints
        - Customer Service: 12 endpoints
        - Role Service: 5 endpoints
        - Organization Service: 5 endpoints
        - Permission Service: 1 endpoint
        - Contract Service: 36 endpoints
          - Contract APIs: 9 endpoints
          - Document APIs: 6 endpoints
          - Type APIs: 5 endpoints
          - Participant APIs: 3 endpoints
          - Field APIs: 1 endpoint
          - Recipient APIs: 1 endpoint
          - Share APIs: 2 endpoints
          - Contract Ref APIs: 1 endpoint
          - Certificate APIs: 7 endpoints
        - Gateway Service: 1 endpoint

