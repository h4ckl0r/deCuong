import { useState, useEffect, type JSX } from "react";
import {
  Button,
  Card,
  Alert,
  Spin,
  Typography,
  Space,
  Descriptions,
  Tag,
  Divider,
  Collapse, // Dùng để ẩn/hiện danh sách câu hỏi
} from "antd";
import {
  ReadOutlined,
  ReloadOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// --- CẤU HÌNH API VÀ PROXY ---
const TEST_ID: number = 177;
const BASE_API_PATH: string = `/api-rikkei/tests/${TEST_ID}`;

// **************************** TOKEN XÁC THỰC ****************************
const AUTH_TOKEN: string =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJpa2tlaXJkQGdtYWlsLmNvbSIsIm5hbWUiOiJSJkQiLCJpZCI6ODMsInJvbGUiOlt7ImlkIjoxLCJuYW1lIjoiQURNSU4ifSx7ImlkIjoyLCJuYW1lIjoiTUFOQUdFUiJ9LHsiaWQiOjMsIm5hbWUiOiJURUFDSEVSIn0seyJpZCI6NCwibmFtZSI6IlRFQUNIRVJfQVNTSVNUQU5UIn0seyJpZCI6NSwibmFtZSI6IkdVRVNUIn1dLCJ0eXBlIjoidXNlciIsImlhdCI6MTc2NzcxMTUwOSwiZXhwIjoxNzY3Nzk3OTA5fQ.SLtOovKSuTGOcv3x0De9RbfuEmdwh_ONa-rZD1cR1o0";
// **************************************************************************

// --- INTERFACE (KHAI BÁO KIỂU DỮ LIỆU MỚI) ---

interface OptionTest {
  id: number;
  content: string;
  isCorrect: boolean;
  created_at: string;
}

interface QuestionTest {
  id: number;
  content: string;
  type: string; // Vd: "MỘT LỰA CHỌN"
  status: boolean;
  point: number;
  difficulty: number;
  optionTests: OptionTest[];
}

interface TestDetails {
  id: number;
  testName: string;
  status: boolean; // Đã đổi từ string sang boolean
  time: number;
  type: string;
  created_at: string;
  questionTests: QuestionTest[]; // Dữ liệu câu hỏi chi tiết
  // Thêm các trường khác nếu có
  [key: string]: unknown;
}

// Interface cho phản hồi API (Có trường 'data' bao bọc)
interface ApiResponse {
  data: TestDetails;
  message?: string;
}

// --- COMPONENT CHÍNH ---

export default function TestDetailsFetcher(): JSX.Element {
  const [apiResponse, setApiResponse] = useState<TestDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTestDetails = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setApiResponse(null);

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

      const result = (await response.json()) as ApiResponse;

      if (result && result.data && result.data.id) {
        setApiResponse(result.data);
      } else {
        throw new Error(`Phản hồi API không có trường 'data' hợp lệ.`);
      }
    } catch (err) {
      setError(
        (err as Error).message || "Không thể tải chi tiết bài kiểm tra."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDetails();
  }, []);

  // --- RENDERING OPTIONS (HIỂN THỊ ĐÁP ÁN) ---
  const renderOptions = (options: OptionTest[]): JSX.Element => (
    <Space direction="vertical" style={{ width: "100%" }}>
      {options.map((option) => (
        <Card
          key={option.id}
          size="small"
          style={{
            borderColor: option.isCorrect ? "#52c41a" : "#f5222d",
            background: option.isCorrect ? "#f6ffed" : "#fff1f0",
          }}
        >
          <Space>
            {option.isCorrect ? (
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
            ) : (
              <CloseCircleOutlined style={{ color: "#f5222d" }} />
            )}
            <Text style={{ fontWeight: option.isCorrect ? "bold" : "normal" }}>
              {option.content}
            </Text>
          </Space>
        </Card>
      ))}
    </Space>
  );

  return (
    <Card
      title={
        <Title level={4} style={{ marginBottom: 0 }}>
          <ReadOutlined /> Chi Tiết Bài Kiểm Tra (ID: {TEST_ID})
        </Title>
      }
      extra={
        <Button
          type="primary"
          onClick={fetchTestDetails}
          loading={loading}
          icon={<ReloadOutlined />}
        >
          Tải lại
        </Button>
      }
      style={{ maxWidth: 1000, margin: "20px auto" }}
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

        {apiResponse && !loading && (
          <>
            <Title level={3}>{apiResponse.testName}</Title>

            {/* Thông tin chung */}
            <Descriptions
              bordered
              column={2}
              size="middle"
              title="Thông tin chung"
            >
              <Descriptions.Item label="ID Bài kiểm tra">
                {apiResponse.id}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian làm bài">
                {apiResponse.time} phút
              </Descriptions.Item>
              <Descriptions.Item label="Loại bài thi">
                <Tag color="geekblue">{apiResponse.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={apiResponse.status ? "green" : "red"}>
                  {apiResponse.status ? "HOẠT ĐỘNG" : "TẠM DỪNG"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={2}>
                {new Date(apiResponse.created_at).toLocaleString("vi-VN")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={4} style={{ marginTop: 0 }}>
              <QuestionCircleOutlined /> Danh Sách Câu Hỏi (
              {apiResponse.questionTests.length} câu)
            </Title>

            {/* Danh sách Câu hỏi (Sử dụng Collapse) */}
            <Collapse accordion>
              {apiResponse.questionTests.map((question, index) => (
                <Panel
                  header={
                    <Space>
                      <Text strong>
                        {index + 1}. {question.content}
                      </Text>
                      <Tag color="cyan">{question.type}</Tag>
                      <Tag color="gold">{question.point} điểm</Tag>
                    </Space>
                  }
                  key={question.id}
                >
                  <Descriptions
                    column={1}
                    size="small"
                    bordered
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions.Item label="Nội dung">
                      {question.content}
                    </Descriptions.Item>
                    <Descriptions.Item label="Điểm">
                      {question.point}
                    </Descriptions.Item>
                    <Descriptions.Item label="Độ khó">
                      {question.difficulty}
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5} style={{ marginTop: 0 }}>
                    Đáp án:
                  </Title>
                  {renderOptions(question.optionTests)}
                </Panel>
              ))}
            </Collapse>
          </>
        )}
      </Space>
    </Card>
  );
}
