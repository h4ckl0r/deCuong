import { useState, type JSX } from "react";
import {
  Button,
  Input,
  Card,
  Alert,
  Spin,
  Typography,
  Space,
  Row,
  Col,
  Select,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// --- CẤU HÌNH API VÀ PROXY (SỬ DỤNG ĐƯỜNG DẪN TƯƠNG ĐỐI) ---
const BASE_API_PATH: string = "/api-rikkei/students/resultByCourse";
// -----------------------------------------------------------------

interface StudentResult {
  courseId?: number;
  finalResult?: {
    quizzi?: number;
    project?: number;
    interview_point?: number;
    finalScore?: number;
    [key: string]: unknown;
  };
  resultTest?: Array<{
    link?: string | null;
    point?: number;
    testSchedule?: {
      test?: {
        testName?: string;
        type?: string;
      };
    };
  }>;
  [key: string]: unknown;
}

export default function StudentResultLookup(): JSX.Element {
  // Thay đổi giá trị mẫu để dễ kiểm tra
  const [idStudent, setIdStudent] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("102");
  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Giữ Token trong code (vì nó là dữ liệu xác thực)
  const token: string =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJpa2tlaXJkQGdtYWlsLmNvbSIsIm5hbWUiOiJSJkQiLCJpZCI6ODMsInJvbGUiOlt7ImlkIjoxLCJuYW1lIjoiQURNSU4ifSx7ImlkIjoyLCJuYW1lIjoiTUFOQUdFUiJ9LHsiaWQiOjMsIm5hbWUiOiJURUFDSEVSIn0seyJpZCI6NCwibmFtZSI6IlRFQUNIRVJfQVNTSVNUQU5UIn0seyJpZCI6NSwibmFtZSI6IkdVRVNUIn1dLCJ0eXBlIjoidXNlciIsImlhdCI6MTc2Nzc3ODA2MSwiZXhwIjoxNzY3ODY0NDYxfQ.UA8Xb1plz9pKpkEEpNM52TcTPVCpaLW5T322K9SOpSw";

  const handleSubmit = async (): Promise<void> => {
    if (!idStudent) {
      setError("Vui lòng nhập ID học sinh");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // **********************************************
    // SỬA LỖI: GỌI QUA ĐƯỜNG DẪN PROXY TƯƠNG ĐỐI
    const proxyUrl = `${BASE_API_PATH}/${idStudent}/${courseId}`;
    // **********************************************

    try {
      const response = await fetch(
        proxyUrl, // <-- SỬ DỤNG ĐƯỜNG DẪN PROXY
        {
          method: "GET",
          headers: {
            // Giữ lại Authorization và Accept headers
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            // Origin và Referer được thêm tự động bởi VITE PROXY
          },
        }
      );

      if (!response.ok) {
        // Log lỗi chi tiết từ phản hồi API
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${
            response.status
          }. Chi tiết: ${errorText.substring(0, 100)}...`
        );
      }

      const data = (await response.json()) as { resultData: StudentResult };

      if (data && data.resultData) {
        setResult(data.resultData);
        console.log(data.resultData);
      } else {
        throw new Error("Phản hồi API không có trường 'resultData' hợp lệ.");
      }
    } catch (err) {
      setError((err as Error).message || "Không thể kết nối đến API");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (value: string) => {
    setCourseId(value);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* FORM TRA CỨU */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Title level={2} style={{ marginBottom: "8px" }}>
                Tra Cứu Kết Quả Học Sinh
              </Title>
              <Text type="secondary">
                Nhập ID học sinh để xem kết quả khóa học
              </Text>
            </div>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>ID Học Sinh</Text>
                  <Input
                    type="number"
                    size="large"
                    value={idStudent}
                    onChange={(e) => setIdStudent(e.target.value)}
                    placeholder="Nhập ID học sinh..."
                    onPressEnter={handleSubmit}
                  />
                </Space>
              </Col>

              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text strong>Khóa Học</Text>
                  <Select
                    onChange={onChange}
                    style={{ width: "500px", height: "40px" }}
                    options={[
                      {
                        value: "102",
                        label: <span>Phân tích thiết kế hệ thống</span>,
                      },
                      { value: "54", label: <span>ReactJs</span> },
                      {
                        value: "118",
                        label: <span>Agile scrum</span>,
                      },
                    ]}
                  />
                </Space>
              </Col>
            </Row>

            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={handleSubmit}
              loading={loading}
              block
              style={{ height: "48px", fontSize: "16px" }}
            >
              {loading ? "Đang tải..." : "Tra Cứu"}
            </Button>
          </Space>
        </Card>

        {/* HIỂN THỊ LỖI */}
        {error && (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: "24px", borderRadius: "8px" }}
          />
        )}

        {/* LOADING */}
        {loading && (
          <Card style={{ textAlign: "center", borderRadius: "12px" }}>
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </Card>
        )}

        {/* KẾT QUẢ */}
        {result && !loading && (
          <Card
            title={
              <Space>
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: "20px" }}
                />
                <Text strong style={{ fontSize: "18px" }}>
                  Kết Quả
                </Text>
              </Space>
            }
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {/* Bảng điểm */}
            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              {result.finalResult ? (
                <>
                  <Title
                    level={4}
                    style={{ marginBottom: "16px", textAlign: "center" }}
                  >
                    🎓 Kết quả khóa học
                  </Title>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      maxWidth: "500px",
                      margin: "0 auto",
                    }}
                  >
                    {[
                      { label: "Quizzi", value: result.finalResult.quizzi },
                      { label: "Project", value: result.finalResult.project },
                      {
                        label: "Interview",
                        value: result.finalResult.interview_point,
                      },
                      {
                        label: "Final Score",
                        value: result.finalResult.finalScore,
                      },
                    ].map((item) => (
                      <Card
                        key={item.label}
                        style={{
                          textAlign: "center",
                          borderRadius: "10px",
                          background: "#fff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: "14px" }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: "20px",
                            color:
                              (item.value ?? 0) >= 90
                                ? "#16a34a"
                                : (item.value ?? 0) >= 70
                                ? "#eab308"
                                : "#dc2626",
                          }}
                        >
                          {item.value ?? "—"}
                        </Text>
                      </Card>
                    ))}
                  </div>

                  {/* Link Project nếu có */}
                  {result.resultTest?.some((t) => t.link) && (
                    <div style={{ marginTop: "24px", textAlign: "center" }}>
                      <Text strong style={{ fontSize: "16px" }}>
                        🔗 Link Project:
                      </Text>
                      <div style={{ marginTop: "8px" }}>
                        {result.resultTest
                          ?.filter((t) => t.link)
                          .map((t, idx) => (
                            <div key={idx}>
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: "#2563eb",
                                  fontWeight: 500,
                                  textDecoration: "none",
                                }}
                              >
                                <LinkOutlined /> {t.link}
                              </a>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Text type="secondary">Không có dữ liệu kết quả</Text>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
