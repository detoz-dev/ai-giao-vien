import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Lỗi phương thức' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Chưa cấu hình API Key' });

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const { type, input, fileData, fileMimeType } = req.body;
    let prompt = '';

    if (type === 'latex') {
        prompt = `Đóng vai là một chuyên gia thiết kế tài liệu học thuật và giáo án cao cấp. Hãy phân tích tài liệu/tệp tin đính kèm dưới đây và biên soạn thành một báo cáo/hướng dẫn học thuật hoàn chỉnh trình bày dưới dạng mã HTML sạch sẽ.

Yêu cầu định dạng và phong cách trình bày (giống hệt các tài liệu hướng dẫn kỹ thuật chuyên nghiệp, dễ nhìn, tối ưu cho in ấn):
- Bố cục gồm: Tiêu đề lớn in đậm, phần thông tin Meta (Phiên bản, Ngày cập nhật, Mục tiêu tài liệu), các phần nội dung đánh số rõ ràng (1, 1.1, 2, ...).
- Bảng biểu (Table): Phải sử dụng thẻ HTML <table>, <tr>, <th>, <td> với đường viền gọn gàng, padding thoáng đãng để trình bày các danh mục, thông số hoặc bảng điểm.
- Danh sách & Checklist: Sử dụng các gạch đầu dòng rõ ràng hoặc ký hiệu ô vuông (☐) cho các phần danh sách cần kiểm tra.
- Công thức toán học (nếu có): Trình bày rõ ràng, dễ đọc.
- Tuyệt đối không trả về mã LaTeX thô hay Markdown thuần. Hãy trả về toàn bộ cấu trúc các thẻ HTML nội dung (như <div>, <h2>, <h3>, <p>, <ul>, <table>...) để hệ thống hiển thị trực quan và xuất file PDF chuẩn xác.

Nội dung văn bản bổ sung hoặc tài liệu: ${input || "Phân tích trực tiếp từ tệp đính kèm"}`;

    } else if (type === 'game') {
        prompt = `Đóng vai một lập trình viên Front-end xuất sắc. Hãy viết một file HTML hoàn chỉnh, độc lập (standalone HTML file bao gồm toàn bộ mã HTML, CSS của Tailwind CDN, thư viện Canvas Confetti và JavaScript bên trong) để tạo ra một trò chơi trắc nghiệm giáo dục giao diện hiện đại phục vụ giảng dạy dựa trên tài liệu đính kèm. Dưới cùng của trò chơi, hãy thêm một dòng chữ nhỏ: 'Thiết kế bởi DETOZ'.

Yêu cầu kỹ thuật & Thư viện:
- Sử dụng Tailwind CSS qua CDN.
- Sử dụng thư viện Canvas Confetti qua CDN để tạo hiệu ứng pháo hoa.
- Sử dụng font chữ 'Inter' từ Google Fonts.
- Viết CSS thuần trong thẻ <style> để tạo animation shake (rung lắc) khi trả lời sai.

Cấu trúc giao diện game gồm 3 phần (ẩn/hiện bằng JavaScript):
1. Màn hình Bắt đầu: Tiêu đề trò chơi, lời giới thiệu và nút "Bắt đầu ngay".
2. Màn hình Chơi: 
   - Nút bật/tắt toàn màn hình (Fullscreen) ở góc phải.
   - Tiến độ câu hỏi (VD: Câu 1/10) kèm thanh progress bar. Không hiện điểm số khi đang chơi.
   - Nút "Bỏ qua câu này" để chuyển ngay câu tiếp theo không tính điểm.
3. Màn hình Kết quả: Thông báo chúc mừng, tổng điểm (VD: 8/10) và nút "Chơi lại từ đầu".

Logic JavaScript:
- Mảng câu hỏi Object gồm: { q: "Câu hỏi", a: ["Đáp án 1", "Đáp án 2",...], c: index_đáp_án_đúng }.
- Trả lời đúng: Nút đổi xanh lá, bắn pháo hoa, tự động chuyển câu sau 1 giây.
- Trả lời sai: Nút đổi đỏ, rung lắc, tự động chuyển câu sau 1 giây.

BẮT BUỘC: Phải trả về toàn bộ mã nguồn HTML hợp lệ từ <!DOCTYPE html> cho đến </html> để người dùng lưu lại thành file .html và mở chạy ngoại tuyến được ngay.

Nội dung tài liệu đính kèm để tạo 10 câu hỏi trắc nghiệm: ${input || "Không có"}`;
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

    // Cơ chế ưu tiên Pro, tự động chuyển sang 3.6 Flash nếu quá tải/hết token
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
