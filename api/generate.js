import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Lỗi phương thức' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chưa cấu hình API Key' });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Nhận thêm dữ liệu file từ web gửi lên
    const { type, input, fileData, fileMimeType } = req.body;
    let prompt = '';

    if (type === 'game') {
        prompt = `Đóng vai một chuyên gia sư phạm. Dựa vào nội dung bài giảng (hoặc file tài liệu đính kèm) sau đây, hãy thiết kế một trò chơi trên lớp (ví dụ: giải ô chữ, trắc nghiệm leo tháp, đuổi hình bắt chữ...) để học sinh củng cố kiến thức. Hãy mô tả thật chi tiết luật chơi, hệ thống tính điểm, bộ câu hỏi và đáp án: \n\n${input}`;
    } else if (type === 'latex') {
        prompt = `Đóng vai một chuyên gia toán học. Dựa vào nội dung (hoặc file tài liệu đính kèm) sau đây, hãy chuyển đổi sang định dạng mã chuẩn LaTeX. Chỉ trả về mã LaTeX để copy, tuyệt đối không giải thích hay thêm văn bản nào khác:\n\n${input}`;
    }

    // Đóng gói dữ liệu gửi cho Gemini
    const parts = [{ text: prompt }];
    
    // Nếu có file được tải lên, đính kèm file đó vào cùng câu lệnh
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
    res.status(500).json({ error: 'Hệ thống đang bận hoặc file quá lớn. Lỗi: ' + error.message });
  }
}
