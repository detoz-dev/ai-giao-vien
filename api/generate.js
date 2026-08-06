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
        prompt = `Đóng vai trò là một chuyên gia thiết kế tài liệu học thuật và giáo án cao cấp. Hãy phân tích toàn diện tài liệu hoặc tệp tin đính kèm dưới đây để biên soạn thành một báo cáo/hướng dẫn học thuật hoàn chỉnh, chuẩn mực, trình bày dưới định dạng HTML sạch sẽ, tối ưu hóa tuyệt đối cho việc in ấn hoặc xuất bản file PDF.

YÊU CẦU TRÌNH BÀY VÀ ĐỊNH DẠNG KHẮT KHE:
1. Bố cục cấu trúc tài liệu:
   - Tiêu đề chính lớn, in đậm, trang trọng (thẻ <h1>).
   - Phần thông tin metadata tổng quan gồm: Tên dự án/tài liệu, Phiên bản, Ngày cập nhật, Mục tiêu chi tiết của tài liệu (trình bày trong khung hoặc bảng gọn gàng).
   - Hệ thống đề mục phân cấp rõ ràng (sử dụng <h2> cho phần chính, <h3> cho phần phụ, đánh số mục theo chuẩn học thuật như 1, 1.1, 1.2, 2, ...).
2. Bảng biểu chuyên nghiệp (Table):
   - Bắt buộc sử dụng các thẻ HTML <table>, <tr>, <th>, <td>.
   - Bảng phải có đường viền nét mảnh màu xám nhạt (#cbd5e1), khoảng cách đệm (padding) thoáng đãng, màu nền tiêu đề bảng (th) xám nhạt sang trọng (#f1f5f9) để hiển thị thông số, quy trình hoặc danh mục phân công cực kỳ dễ nhìn.
3. Danh sách và Hộp kiểm tra (Checklist):
   - Sử dụng danh sách có thứ tự/không thứ tự rõ ràng.
   - Đối với các phần danh sách kiểm tra công việc, sử dụng ký hiệu ô vuông chuẩn (☐) đầu dòng.
4. Công thức toán học và ký hiệu:
   - Trình bày rõ ràng, trực quan, dùng định dạng ký hiệu ký tự toán học chuẩn mực (ví dụ: $y'(t) = ay(t) + b$).
5. Quy cách kỹ thuật đầu ra:
   - Tuyệt đối KHÔNG trả về mã LaTeX thô hoặc Markdown thuần ('#', '**').
   - Chỉ trả về cấu trúc mã nguồn HTML hoàn chỉnh chứa các thẻ nội dung (như <div>, <h2>, <h3>, <p>, <ul>, <table>...) để hệ thống nhúng trực tiếp vào khung xem trước và xuất file PDF.

Nội dung văn bản bổ sung hoặc tài liệu: ${input || "Phân tích trực tiếp từ tệp đính kèm"}`;

    } else if (type === 'game') {
        let gameTypeDesc = "trò chơi trắc nghiệm kiến thức";
        if (gameType === 'flashcard') gameTypeDesc = "trò chơi lật thẻ ghi nhớ (Flashcard) tương tác";
        else if (gameType === 'crossword') gameTypeDesc = "trò chơi giải mã ô chữ (Crossword) trực quan";
        else if (gameType === 'guessing') gameTypeDesc = "trò chơi đoán từ / từ khóa chuyên môn (Word Guessing)";

        let styleDesc = "Phong cách đơn giản, tinh tế, tối ưu cho môi trường học tập trang nhã (tông màu trắng, xám slate chuyên nghiệp, không rườm rà).";
        if (gameStyle === 'colorful') {
            styleDesc = "Phong cách nhiều màu sắc, sôi động, bắt mắt cho học sinh (sử dụng các hiệu ứng gradient rực rỡ từ Tailwind như bg-gradient-to-r from-purple-500 to-pink-500, màu sắc tươi sáng, hiệu ứng bóng nổi bật, hoạt ảnh sinh động).";
        } else if (gameStyle === 'chalkboard') {
            styleDesc = "Phong cách hoài cổ bảng đen lớp học (tông nền tối xanh đậm/slate-900, chữ viết màu trắng hoặc vàng phấn, viền khung phong cách bảng lớp học chuyên nghiệp).";
        }

        prompt = `Đóng vai trò là một lập trình viên Front-end chuyên nghiệp. Hãy viết một file HTML hoàn chỉnh, độc lập (standalone HTML file bao gồm toàn bộ cấu trúc HTML, CSS sử dụng Tailwind CDN, thư viện Canvas Confetti qua CDN, thư viện Google Font 'Inter' và toàn bộ mã nguồn JavaScript tương tác bên trong) để tạo ra một ${gameTypeDesc} phục vụ giảng dạy. 
Dưới cùng của trò chơi, bắt buộc phải thêm một dòng chữ nhỏ bản quyền: 'Thiết kế bởi DETOZ'.

YÊU CẦU KỸ THUẬT & GIAO DIỆN:
- Phong cách thiết kế giao diện: ${styleDesc}
- Dữ liệu trò chơi: Hãy tự động phân tích sâu nội dung tài liệu đính kèm bên dưới để trích xuất ra các câu hỏi, thuật ngữ hoặc từ khóa chính xác, chất lượng cao liên quan trực tiếp đến chủ đề bài học.

CẤU TRÚC VÀ LOGIC TƯƠNG TÁC CHI TIẾT:
- Đối với Trắc nghiệm (Quiz): Gồm 3 màn hình (Bắt đầu, Chơi, Kết quả) ẩn hiện bằng JS. Có nút bật/tắt Fullscreen, thanh progress bar thể hiện tiến độ câu hỏi, không hiện điểm số khi đang chơi, có nút "Bỏ qua câu này". Khi trả lời đúng: nút đổi màu xanh lá, bắn pháo hoa bằng Canvas Confetti, tự động chuyển câu sau 1 giây. Khi trả lời sai: nút đổi màu đỏ, kích hoạt hiệu ứng rung lắc (class shake), tự động chuyển câu sau 1 giây. Lưu trữ điểm ngầm.
- Đối với Lật thẻ (Flashcard): Giao diện hiển thị các thẻ ghi nhớ (mặt trước là thuật ngữ/câu hỏi, mặt sau là định nghĩa/đáp án chi tiết). Người dùng bấm vào thẻ hoặc nút tương tác để thực hiện hiệu ứng lật thẻ 3D mượt mà, có nút chuyển qua thẻ tiếp theo/quay lại, hiển thị tổng số thẻ.
- Đối với Ô chữ / Đoán từ (Crossword / Guessing): Giao diện bảng ô chữ hoặc ô nhập ký tự đoán từ dựa trên gợi ý (clue) lấy từ tài liệu, có cơ chế kiểm tra đáp án đúng/sai từng từ, tính điểm hoặc báo hoàn thành.

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
