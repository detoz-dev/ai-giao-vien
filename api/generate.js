import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Lỗi phương thức' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chưa cấu hình API Key' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const { type, input, fileData, fileMimeType, gameType, gameStyle } = req.body;
    let prompt = '';

    if (type === 'latex') {
        prompt = `Đóng vai trò là một hệ thống chuyển đổi tài liệu kỹ thuật chuyên nghiệp. Hãy phân tích tài liệu đính kèm và cấu trúc lại toàn bộ nội dung thành một mã HTML sạch sẽ, bám sát các quy chuẩn trình bày tài liệu kỹ thuật học thuật (giống như các bản hướng dẫn thực hành, tài liệu đồ án, báo cáo kỹ thuật chuẩn in ấn).

QUY TẮC ÁP DỤNG THẺ HTML CỐ ĐỊNH:
1. Header tài liệu: Đặt một dòng tiêu đề nhỏ trên cùng dạng header (ví dụ: TÊN DỰ ÁN - HƯỚNG DẪN THỰC HIỆN).
2. Tiêu đề chính (Title): Dùng thẻ <h1> cho tên tài liệu chính, in đậm, viết hoa, căn giữa hoặc trang trọng.
3. Phần mở đầu (Mục tiêu): Đặt đoạn mô tả mục tiêu vào một khối văn bản rõ ràng.
4. Đề mục lớn (Sections): Sử dụng thẻ <h2> cho các phần đánh số rõ ràng (Ví dụ: "1 Thông tin cố định phải dùng thống nhất", "2 Công đoạn 1...", v.v.).
5. Đề mục nhỏ (Subsections): Sử dụng thẻ <h3> cho các mục con (Ví dụ: "1.1 Bốn session chính thức", v.v.).
6. Bảng biểu (Tables): Bắt buộc dịch toàn bộ dữ liệu dạng bảng thành thẻ <table> chuẩn với các ô <th> và <td> có đường viền đen rõ ràng, padding gọn gàng, không dùng bảng kiểu cách hiện đại màu mè, giống phong cách tài liệu in ấn kỹ thuật truyền thống.
7. Danh sách (Lists): Sử dụng thẻ <ul>/<li> hoặc danh sách kiểm tra bằng ký hiệu ô vuông (☐) nếu có.

TUYỆT ĐỐI KHÔNG dùng các thẻ div định dạng màu mè, không dùng Markdown thuần. Chỉ trả về mã HTML cấu trúc thô bám sát phong cách tài liệu kỹ thuật in ấn.

Nội dung bổ sung hoặc tài liệu: ${input || "Phân tích trực tiếp từ tệp đính kèm"}`;

    } else if (type === 'game') {
        let gameTypeDesc = "trò chơi trắc nghiệm kiến thức";
        if (gameType === 'flashcard') gameTypeDesc = "trò chơi lật thẻ ghi nhớ (Flashcard) tương tác";
        else if (gameType === 'crossword') gameTypeDesc = "trò chơi giải mã ô chữ (Crossword) trực quan";
        else if (gameType === 'guessing') gameTypeDesc = "trò chơi đoán từ / từ khóa chuyên môn (Word Guessing)";

        let styleDesc = "Phong cách đơn giản, tinh tế, tối ưu cho môi trường học tập trang nhã (tông màu trắng, xám slate chuyên nghiệp).";
        if (gameStyle === 'colorful') {
            styleDesc = "Phong cách nhiều màu sắc, sôi động, bắt mắt cho học sinh (sử dụng hiệu ứng gradient rực rỡ từ Tailwind, màu sắc tươi sáng, hiệu ứng bóng nổi bật, hoạt ảnh sinh động).";
        } else if (gameStyle === 'chalkboard') {
            styleDesc = "Phong cách hoài cổ bảng đen lớp học (tông nền tối xanh đậm/slate-900, chữ viết màu trắng hoặc vàng phấn).";
        }

        prompt = `Đóng vai trò là một lập trình viên Front-end chuyên nghiệp. Hãy viết một file HTML hoàn chỉnh, độc lập (standalone HTML file bao gồm toàn bộ cấu trúc HTML, CSS sử dụng Tailwind CDN, thư viện Canvas Confetti qua CDN, Google Font 'Inter' và mã nguồn JavaScript tương tác bên trong) để tạo ra một ${gameTypeDesc} phục vụ giảng dạy. 
Dưới cùng của trò chơi, bắt buộc phải thêm một dòng chữ nhỏ bản quyền: 'Thiết kế bởi DETOZ'.

YÊU CẦU KỸ THUẬT & GIAO DIỆN:
- Phong cách thiết kế giao diện: ${styleDesc}
- Dữ liệu trò chơi: Hãy tự động phân tích sâu nội dung tài liệu đính kèm bên dưới để trích xuất ra các câu hỏi, thuật ngữ hoặc từ khóa chính xác, chất lượng cao liên quan trực tiếp đến chủ đề bài học.

CẤU TRÚC VÀ LOGIC TƯƠNG TÁC CHI TIẾT:
- Đối với Trắc nghiệm (Quiz): Gồm 3 màn hình (Bắt đầu, Chơi, Kết quả) ẩn hiện bằng JS. Có nút bật/tắt Fullscreen, thanh progress bar thể hiện tiến độ, không hiện điểm số khi đang chơi, có nút "Bỏ qua câu này". Trả lời đúng: nút đổi màu xanh lá, bắn pháo hoa bằng Canvas Confetti, tự động chuyển câu sau 1 giây. Trả lời sai: nút đổi màu đỏ, hiệu ứng rung lắc (class shake), tự động chuyển câu sau 1 giây. Lưu trữ điểm ngầm.
- Đối với Lật thẻ (Flashcard): Giao diện thẻ ghi nhớ tương tác 3D lật mặt trước/sau, có nút chuyển thẻ tiếp theo/quay lại, hiển thị tổng số thẻ.
- Đối với Ô chữ / Đoán từ (Crossword / Guessing): Giao diện bảng ô chữ hoặc ô nhập ký tự đoán từ dựa trên gợi ý (clue) từ tài liệu, cơ chế kiểm tra đáp án và tính điểm.

BẮT BUỘC: Phải trả về toàn bộ mã nguồn HTML hợp lệ từ <!DOCTYPE html> cho đến </html> chứa đầy đủ mọi thành phần để người dùng lưu thành file .html độc lập và mở chạy ngoại tuyến ngay lập tức trên mọi trình duyệt.

Nội dung tài liệu đính kèm để phân tích và tạo dữ liệu trò chơi: ${input || "Không có văn bản nhập tay, hãy phân tích trực tiếp file đính kèm"}`;
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
    
    res.status(200).json({ text: textResult });
  } catch (error) {
    res.status(500).json({ error: 'Hệ thống đang quá tải. Lỗi chi tiết: ' + error.message });
  }
}
