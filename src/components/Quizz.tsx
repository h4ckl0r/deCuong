import { useState, useEffect } from "react";
import {
  Clock,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// --- CẤU HÌNH API VÀ TOKEN ---
const TEST_ID: number = 177;

// Lấy URL từ biến môi trường. Nếu không có thì mặc định là chuỗi rỗng
const API_URL = "";

// Ghép chuỗi để tạo thành đường dẫn đầy đủ
// Kết quả sẽ là: http://localhost:8080/api-rikkei/tests/177
const BASE_API_PATH: string = `${API_URL}/api-rikkei/tests/${TEST_ID}`;

// Lấy Token từ file .env
const AUTH_TOKEN: string = import.meta.env.VITE_AUTH_TOKEN || "";
// --- INTERFACES ---
interface OptionTest {
  id: number;
  content: string;
  isCorrect: boolean;
}

interface QuestionTest {
  id: number;
  content: string;
  type: string;
  point: number;
  difficulty: number;
  optionTests: OptionTest[];
}

interface TestDetails {
  id: number;
  testName: string;
  status: boolean;
  time: number;
  type: string;
  created_at: string;
  questionTests: QuestionTest[];
}

interface ApiResponse {
  data: TestDetails;
  message?: string;
}

export default function Quizz() {
  const [testData, setTestData] = useState<TestDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const fetchTestDetails = async () => {
    setLoading(true);
    setError(null);
    setTestData(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setShowWarning(false);

    try {
      const response = await fetch(BASE_API_PATH, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const result = (await response.json()) as ApiResponse;

      if (result?.data) {
        setTestData(result.data);
        const maxScore = result.data.questionTests.reduce(
          (acc, curr) => acc + curr.point,
          0
        );
        setTotalScore(maxScore);
      } else {
        throw new Error("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDetails();
  }, []);

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (isSubmitted) return;
    setUserAnswers({ ...userAnswers, [questionId]: optionId });
    setShowWarning(false);
  };

  const handleSubmit = () => {
    if (!testData) return;

    // const answeredCount = Object.keys(userAnswers).length;
    // if (answeredCount < testData.questionTests.length) {
    //   setShowWarning(true);
    //   return;
    // }

    let currentScore = 0;
    testData.questionTests.forEach((question) => {
      const userSelectedOptionId = userAnswers[question.id];
      const correctOption = question.optionTests.find((opt) => opt.isCorrect);
      if (correctOption && userSelectedOptionId === correctOption.id) {
        currentScore += question.point;
      }
    });

    setScore(currentScore);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải bài kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={fetchTestDetails}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!testData) return null;

  const passScore = totalScore / 2;
  const isPassed = score >= passScore;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-4 border-indigo-600">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            {testData.testName}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 font-medium">
                {testData.time} phút
              </span>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <span className="text-gray-700 font-medium">
                {testData.questionTests.length} câu hỏi
              </span>
            </div>
            <div className="bg-indigo-100 px-4 py-2 rounded-lg">
              <span className="text-indigo-700 font-medium">
                {testData.type}
              </span>
            </div>
          </div>

          {/* Kết quả */}
          {isSubmitted && (
            <div
              className={`rounded-xl p-6 mb-4 ${
                isPassed
                  ? "bg-green-50 border-2 border-green-300"
                  : "bg-yellow-50 border-2 border-yellow-300"
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                {isPassed ? (
                  <CheckCircle className="w-16 h-16 text-green-600" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-yellow-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">
                Điểm số:{" "}
                <span
                  className={isPassed ? "text-green-600" : "text-yellow-600"}
                >
                  {score}/{totalScore}
                </span>
              </h2>
              <p className="text-center text-gray-700 mb-4">
                {isPassed
                  ? "🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc!"
                  : "💪 Cố gắng hơn lần sau nhé!"}
              </p>
              <button
                onClick={fetchTestDetails}
                className="flex items-center gap-2 mx-auto bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
                Làm lại bài thi
              </button>
            </div>
          )}

          {/* Warning */}
          {showWarning && !isSubmitted && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">
                Bạn chưa trả lời hết các câu hỏi!
              </p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {testData.questionTests.map((question, index) => {
            const userAnswerId = userAnswers[question.id];
            const correctOption = question.optionTests.find((o) => o.isCorrect);
            const isCorrect = isSubmitted && userAnswerId === correctOption?.id;

            return (
              <div
                key={question.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all ${
                  isSubmitted
                    ? isCorrect
                      ? "border-2 border-green-400"
                      : "border-2 border-red-400"
                    : "border border-gray-200 hover:shadow-xl"
                }`}
              >
                <div
                  className={`p-6 ${
                    isSubmitted
                      ? isCorrect
                        ? "bg-green-50"
                        : "bg-red-50"
                      : "bg-gradient-to-r from-indigo-50 to-purple-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {question.content}
                      </h3>
                      <div className="flex gap-2 items-center">
                        <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                          {question.point} điểm
                        </span>
                        <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                          Độ khó: {question.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {question.optionTests.map((option) => {
                    const isSelected = userAnswerId === option.id;
                    const showCorrect = isSubmitted && option.isCorrect;
                    const showWrong =
                      isSubmitted && isSelected && !option.isCorrect;

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleSelectOption(question.id, option.id)
                        }
                        disabled={isSubmitted}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSubmitted
                            ? showCorrect
                              ? "bg-green-50 border-green-400"
                              : showWrong
                              ? "bg-red-50 border-red-400"
                              : "bg-gray-50 border-gray-200"
                            : isSelected
                            ? "bg-indigo-50 border-indigo-400 shadow-md"
                            : "bg-white border-gray-300 hover:border-indigo-300 hover:shadow-md"
                        } ${
                          isSubmitted ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSubmitted
                                ? showCorrect
                                  ? "border-green-500 bg-green-500"
                                  : showWrong
                                  ? "border-red-500 bg-red-500"
                                  : "border-gray-300"
                                : isSelected
                                ? "border-indigo-500 bg-indigo-500"
                                : "border-gray-400"
                            }`}
                          >
                            {(isSelected || showCorrect || showWrong) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span
                            className={`flex-1 ${
                              showCorrect
                                ? "text-green-700 font-semibold"
                                : showWrong
                                ? "text-red-700 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {option.content}
                          </span>
                          {showCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {showWrong && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!isSubmitted && (
          <div className="mt-8 text-center pb-8">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Send className="w-6 h-6" />
              Nộp Bài
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
