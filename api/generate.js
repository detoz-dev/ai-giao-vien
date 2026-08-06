import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Lỗi phương thức' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chưa cấu hình API Key' });

    const genAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng Gemini Pro để có tư duy phân tích sâu sắc nhất
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const { type, input, fileData, fileMimeType } = req.body;
    let prompt = '';

    // ==========================================
    // CẤU HÌNH PROMPT MẶC ĐỊNH CHO TỪNG TÁC VỤ
    // ==========================================

    if (type === 'game') {
        // Prompt ẩn tự động chạy cho tính năng tạo trò chơi
        prompt = `Bạn là một chuyên gia tâm lý giáo dục và phương pháp giảng dạy hiện đại. 
Dựa vào nội dung tài liệu hoặc văn bản được cung cấp bên dưới, hãy thiết kế một trò chơi tương tác trên lớp giúp học sinh củng cố kiến thức trọng tâm một cách hào hứng.

Yêu cầu cấu trúc kết quả trả về bao gồm:
1. Tên trò chơi (Sáng tạo, bắt tai).
2. Mục tiêu bài học đạt được.
3. Luật chơi và cách thức tổ chức chi tiết cho giáo viên.
4. Hệ thống câu hỏi (hoặc thử thách) kèm theo đáp án chính xác.

Nội dung dữ liệu đầu vào từ giáo viên:
${input ? input : "(Không có văn bản nhập tay, vui lòng phân tích trực tiếp từ file đính kèm)"}`;

    } else if (type === 'latex') {
        // Prompt ẩn tự động chạy cho tính năng chuyển đổi LaTeX
        prompt = `Bạn là một chuyên gia toán học và chuyên gia biên tập kỹ thuật tài liệu khoa học. 
Nhiệm vụ của bạn là đọc toàn bộ nội dung tài liệu (hoặc hình ảnh/văn bản) được cung cấp và chuyển đổi hoàn toàn cấu trúc, công thức toán học, câu hỏi thành định dạng mã chuẩn LaTeX sạch sẽ, đúng chuẩn gói lệnh amsmath/amssymb, sẵn sàng để biên dịch.

Quy tắc bắt buộc:
- Chỉ trả về phần mã LaTeX hoàn chỉnh để giáo viên có thể copy trực tiếp vào Overleaf hoặc các trình biên tập TeX.
- Tuyệt đối không thêm các lời chào hỏi, giải thích rườm rà ngoài mã LaTeX.

Nội dung dữ liệu đầu vào từ giáo viên:
${input ? input : "(Không có văn bản nhập tay, vui lòng trích xuất trực tiếp từ file đính kèm)"}`;
    }

    // Đóng gói Prompt và File (nếu có) để gửi lên Gemini Pro
    const parts = [{ text: prompt }];
    
    if (fileData && fileMimeType) {
        parts.push({
            inlineData: {
                data: fileData,
                mimeType: fileMimeType
            }
        });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    
    res.status(200).json({ text: response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Hệ thống đang bận hoặc file quá lớn. Lỗi chi tiết: ' + error.message });
  }
}
