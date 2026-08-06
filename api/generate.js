import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Lỗi phương thức' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chưa cấu hình API Key' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const { type, input, fileData, fileMimeType, gameType, gameStyle, numQuestions } = req.body;
    let prompt = '';

    if (type === 'latex') {
        prompt = `Đóng vai trò là hệ thống chuyển đổi tài liệu kỹ thuật chuyên nghiệp. Hãy phân tích tài liệu đính kèm và chỉ trả về DUY NHẤT mã HTML sạch sẽ (bắt đầu bằng thẻ chứa nội dung, tuyệt đối không kèm lời dẫn, không kèm markdown \`\`\`html), bám sát quy chuẩn trình bày tài liệu chuẩn in ấn.
Nội dung bổ sung hoặc tài liệu: ${input || "Phân tích trực tiếp từ tệp đính kèm"}`;

    } else if (type === 'differentiation') {
        prompt = `Đóng vai trò là chuyên gia thiết kế giáo án. Hãy phân tích tài liệu đính kèm và biên soạn **Bộ câu hỏi phân hóa năng lực học sinh** (3 cấp độ: Nhận biết/Thông hiểu, Vận dụng, Vận dụng cao). 
BẮT BUỘC: Chỉ trả về mã HTML sạch sẽ, tuyệt đối KHÔNG kèm theo lời dẫn văn bản ở đầu, KHÔNG có markdown \`\`\`html ở đầu hay cuối.
Nội dung tài liệu đính kèm: ${input || "Phân tích trực tiếp từ tệp đính kèm"}`;

    } else if (type === 'homework') {
        prompt = `Đóng vai trò là giáo viên bộ môn. Hãy phân tích tài liệu đính kèm và biên soạn **Phiếu bài tập về nhà & Lời giải chi tiết**.
BẮT BUỘC: Chỉ trả về mã HTML sạch sẽ, tuyệt đối KHÔNG kèm theo lời dẫn văn bản mở đầu, KHÔNG bao bọc trong khối markdown \`\`\`html.
Nội dung tài liệu đính kèm: ${input || "Phân tích trực tiếp từ tệp đính kèm"}`;

    } else if (type === 'game') {
        let gameTypeDesc = "trò chơi trắc nghiệm kiến thức";
        if (gameType === 'flashcard') gameTypeDesc = "trò chơi lật thẻ ghi nhớ (Flashcard) tương tác";
        else if (gameType === 'crossword') gameTypeDesc = "trò chơi giải mã ô chữ (Crossword) trực quan";
        else if (gameType === 'guessing') gameTypeDesc = "trò chơi đoán từ / từ khóa chuyên môn (Word Guessing)";

        let styleDesc = "Phong cách đơn giản, tinh tế (tông màu trắng, xám slate chuyên nghiệp).";
        if (gameStyle === 'colorful') styleDesc = "Phong cách nhiều màu sắc, sôi động từ Tailwind.";
        else if (gameStyle === 'chalkboard') styleDesc = "Phong cách bảng đen lớp học.";

        const totalQ = numQuestions || 10;

        prompt = `Đóng vai trò lập trình viên Front-end. Viết file HTML độc lập hoàn chỉnh tạo ra ${gameTypeDesc} gồm đúng ${totalQ} câu hỏi dựa trên tài liệu đính kèm. 
Phong cách: ${styleDesc}
Dòng cuối trang có chữ: 'Thiết kế bởi DETOZ'.
Chỉ trả về mã HTML hợp lệ từ <!DOCTYPE html> đến </html>, không kèm chữ thừa.`;
    }

    const parts = [{ text: prompt }];
    if (fileData && fileMimeType) {
        parts.push({
            inlineData: {
                data: fileData,
                mimeType: fileMimeType
            }
        });
    }

    let textResult = "";

    try {
        const proModel = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
        const result = await proModel.generateContent(parts);
        textResult = (await result.response).text();
    } catch (proError) {
        const flashModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const result = await flashModel.generateContent(parts);
        textResult = (await result.response).text();
    }

    // --- BỘ LỌC CHUYÊN SÂU: LOẠI BỎ TOÀN BỘ TEXT MỞ ĐẦU VÀ MARKDOWN RÁC ---
    if (type === 'game') {
        const htmlMatch = textResult.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
        if (htmlMatch) textResult = htmlMatch[0];
    } else {
        // Nếu AI lỡ chèn markdown ```html ... ```
        const codeBlockMatch = textResult.match(/```(?:html)?\s*([\s\S]*?)```/i);
        if (codeBlockMatch) {
            textResult = codeBlockMatch[1].trim();
        }
        // Nếu AI chèn text mở đầu dạng "Dưới đây là..." trước thẻ HTML thực tế
        const tagIndex = textResult.indexOf('<');
        if (tagIndex > 0) {
            textResult = textResult.substring(tagIndex);
        }
    }
    
    res.status(200).json({ text: textResult });
  } catch (error) {
    res.status(500).json({ error: 'Hệ thống đang quá tải. Lỗi chi tiết: ' + error.message });
  }
}
