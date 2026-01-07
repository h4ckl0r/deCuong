import { useState, useEffect, type JSX } from "react";
import {
  Button,
  Card,
  Alert,
  Spin,
  Typography,
  Table,
  Space,
  Tag,
  Modal, // Thêm Modal
  Form, // Thêm Form
  Input, // Thêm Input
  Select, // Thêm Select
  type TableProps,
  notification, // Thêm notification để hiển thị thông báo thành công
} from "antd";
import {
  UserOutlined,
  ReloadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select; // Dùng cho Select Role
// const [form] = Form.useForm(); // Khai báo hook Form

// --- CẤU HÌNH API VÀ PROXY ---
const BASE_API_PATH: string = "/api-rikkei/users";
const AUTH_TOKEN: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhaXRxQHJpa2tlaWFjYWRlbXkuY29tIiwibmFtZSI6IlRy4buLbmggUXXhu5FjIEhhaSIsImlkIjoxNywicm9sZSI6W3siaWQiOjMsIm5hbWUiOiJURUFDSEVSIn1dLCJ0eXBlIjoidXNlciIsImlhdCI6MTc2NDkyNzAzNywiZXhwIjoxNzY1MDEzNDM3fQ.7te8UTAEmvA3ENWtGSUe93fSNSDrfayHTbvO18mRVsA";
// -----------------------------------------------------------------

// --- INTERFACE ---

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  gender: number;
  status: string;
  roles: Role[];
  [key: string]: unknown;
}

interface ApiResponse {
  message: string;
  data: User[];
}

// ** INTERFACE MỚI: Dữ liệu POST lên API để tạo người dùng **
interface NewUserPayload {
  fullName: string;
  email: string;
  password?: string; // Mật khẩu có thể là tùy chọn hoặc bắt buộc tùy theo API
  phone: string;
  address: string;
  gender: number; // 0, 1, 2
  roles: number[]; // Mảng ID vai trò
}

// --- COMPONENT CHÍNH ---

export default function UsersDataFetcher(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // State cho Modal
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State cho form submit

  const [form] = Form.useForm<NewUserPayload>();

  // Dữ liệu mẫu cho Select Role (cần thay đổi nếu API có endpoint lấy roles)
  const availableRoles: Role[] = [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "MANAGER" },
    { id: 3, name: "TEACHER" },
    { id: 4, name: "TEACHER_ASSISTANT" },
  ];

  // --- HÀM TẢI DỮ LIỆU ---
  const fetchData = async (): Promise<void> => {
    // ... (Giữ nguyên logic cũ) ...
    setLoading(true);
    setError(null);
    setUsers([]);

    try {
      const proxyUrl = BASE_API_PATH;

      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Lỗi HTTP: ${response.status}. Chi tiết: ${errorText.substring(
            0,
            100
          )}...`
        );
      }

      const apiResponse = (await response.json()) as ApiResponse;

      if (apiResponse && Array.isArray(apiResponse.data)) {
        setUsers(apiResponse.data);
      } else {
        throw new Error(
          "Phản hồi API không chứa mảng người dùng trong trường 'data'."
        );
      }
    } catch (err) {
      setError((err as Error).message || "Không thể tải dữ liệu người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM TẠO NHÂN VIÊN MỚI (POST) ---
  const handleCreateUser = async (values: NewUserPayload): Promise<void> => {
    setIsSubmitting(true);
    try {
      // API POST thường có cùng endpoint với GET, hoặc là /users
      const proxyUrl = BASE_API_PATH;

      // ** API này yêu cầu ID vai trò là một mảng số (number[]) **
      const payload: NewUserPayload = {
        ...values,
        gender: Number(values.gender), // Đảm bảo gender là số
      };

      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Hiển thị lỗi từ server
        throw new Error(
          result.message || `Lỗi khi tạo người dùng: Status ${response.status}`
        );
      }

      // 1. Hiển thị thông báo thành công
      notification.success({
        message: "Thành công",
        description: result.message || "Đã thêm nhân viên mới thành công!",
        placement: "topRight",
      });

      // 2. Đóng modal và reset form
      setIsModalVisible(false);
      form.resetFields();

      // 3. Tải lại danh sách người dùng để thấy nhân viên mới
      await fetchData();
    } catch (err) {
      // Hiển thị thông báo lỗi
      notification.error({
        message: "Lỗi",
        description:
          (err as Error).message ||
          "Có lỗi xảy ra trong quá trình tạo nhân viên.",
        placement: "topRight",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Cấu hình cột cho Ant Design Table ---
  const columns: TableProps<User>["columns"] = [
    // ... (Giữ nguyên cấu hình cột) ...
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "Họ Tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò (Roles)",
      dataIndex: "roles",
      key: "roles",
      render: (roles: Role[]) => (
        <Space size={[0, 8]} wrap>
          {roles.map((role) => (
            <Tag color="blue" key={role.id}>
              {role.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
  ];

  return (
    <Card
      title={
        <Title level={4} style={{ marginBottom: 0 }}>
          <UserOutlined /> Danh Sách Người Dùng Rikkeisoft
        </Title>
      }
      extra={
        <Space>
          <Button
            type="default"
            onClick={() => setIsModalVisible(true)} // Mở Modal
            icon={<PlusCircleOutlined />}
          >
            Thêm Nhân viên
          </Button>
          <Button
            type="primary"
            onClick={fetchData}
            loading={loading}
            icon={<ReloadOutlined />}
          >
            Tải lại dữ liệu
          </Button>
        </Space>
      }
      style={{ maxWidth: 1200, margin: "20px auto" }}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        )}

        {error && (
          <Alert
            message="Lỗi Tải Dữ Liệu"
            description={error}
            type="error"
            showIcon
          />
        )}

        {users.length > 0 && !loading && (
          <>
            <Text type="success">
              Đã tải thành công **{users.length}** người dùng.
            </Text>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </>
        )}
      </Space>

      {/* --- MODAL THÊM NHÂN VIÊN MỚI --- */}
      <Modal
        title="Thêm Nhân Viên Mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields(); // Reset form khi đóng
        }}
        footer={null} // Tùy chỉnh footer trong Form
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser} // Gọi hàm tạo mới khi submit
          autoComplete="off"
        >
          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: "Vui lòng nhập Họ và Tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Vui lòng nhập Email hợp lệ!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            initialValue={0}
            rules={[{ required: true, message: "Vui lòng chọn Giới tính!" }]}
          >
            <Select>
              <Option value={0}>Nam</Option>
              <Option value={1}>Nữ</Option>
              <Option value={2}>Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="roles"
            label="Vai trò (Roles)"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một vai trò!" },
            ]}
          >
            <Select mode="multiple" placeholder="Chọn các vai trò">
              {availableRoles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Tạo Nhân Viên
            </Button>
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
              style={{ marginLeft: 8 }}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
