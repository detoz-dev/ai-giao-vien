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
    
    const { type, input, fileData, fileMimeType } = req.body;
    let prompt = '';

    if (type === 'latex') {
        prompt = `Đóng vai là một chuyên gia soạn thảo văn bản LaTeX. Hãy chuyển đổi toàn bộ nội dung từ file hoặc văn bản dưới đây sang mã LaTeX hoàn chỉnh (từ \\documentclass đến \\end{document}). Tôi muốn định dạng, phông chữ và cách trình bày mang phong cách chuẩn học thuật, giống với các tài liệu hướng dẫn kỹ thuật chuyên nghiệp.

Cụ thể, hãy thiết lập phần Lời tựa (Preamble) và xử lý nội dung với các yêu cầu LaTeX nghiêm ngặt sau:
- Loại tài liệu & Căn lề: Dùng \\documentclass[a4paper, 12pt]{article} và gói geometry (căn lề chuẩn: trái 3cm, phải 2cm, trên 2cm, dưới 2cm).
- Ngôn ngữ & Phông chữ: Hỗ trợ tiếng Việt chuẩn (\\usepackage[utf8]{inputenc}, \\usepackage[T5]{fontenc}, \\usepackage[vietnamese]{babel}). Bắt buộc sử dụng gói \\usepackage{lmodern} để lấy font chữ Latin Modern (Computer Modern) đặc trưng của LaTeX, tuyệt đối không dùng Times New Roman.
- Header & Footer: Dùng gói fancyhdr. Thiết lập Header có dòng chữ lề trái là "[TÊN DỰ ÁN/TÀI LIỆU CỦA BẠN - tự điền]" và lề phải là tên phần hiện tại (\\leftmark); Footer chứa số trang ở giữa. Bật đường gạch ngang dưới Header.
- Định dạng tiêu đề: Dùng gói titlesec để thiết lập các Heading (1, 2, 3) và Heading phụ (1.1, 1.2) in đậm, kích thước hợp lý và có khoảng cách giãn dòng chuẩn.
- Bảng biểu: Sử dụng môi trường tabularx để các bảng tự động căn chỉnh và xuống dòng vừa vặn với trang giấy (\\textwidth), kết hợp kẻ bảng rõ ràng.
- Cấu trúc File/Folder & Code: Dùng môi trường verbatim để biểu diễn các cấu trúc cây thư mục. Nếu có tên file, đoạn code ngắn xen kẽ trong văn bản, phải bọc trong thẻ \\texttt{}.
- Danh sách kiểm tra (Checklist): Dùng gói enumitem kết hợp với amssymb để tạo các danh sách có ô vuông kiểm tra đầu dòng (ví dụ: \\begin{itemize}[label={$\\square$}]).
- Công thức toán học: Sử dụng gói amsmath và amssymb để hiển thị chính xác các công thức vi phân, đạo hàm, nội suy. Các công thức trong dòng dùng thẻ $ $, công thức tách dòng dùng khối \\begin{equation} hoặc \\[ \\].
- Khoảng cách dòng & Đoạn văn: Dùng gói setspace và đặt \\onehalfspacing (cách dòng 1.5). Không thụt đầu dòng các đoạn văn (\\setlength{\\parindent}{0pt}) và giãn cách giữa các đoạn một chút (\\setlength{\\parskip}{0.5em}).

Nội dung dữ liệu đầu vào:
${input ? input : "(Không có văn bản nhập tay, vui lòng phân tích trực tiếp từ file đính kèm)"}`;

    } else if (type === 'game') {
        prompt = `Đóng vai một lập trình viên Front-end. Tôi cần bạn viết một file HTML tĩnh duy nhất (bao gồm cả CSS và JavaScript trong một file) để tạo ra một trò chơi trắc nghiệm giao diện hiện đại phục vụ giảng dạy. Dưới cùng của trò chơi, hãy thêm một dòng chữ nhỏ: 'Thiết kế bởi DETOZ'.

Yêu cầu kỹ thuật & Thư viện:
- Sử dụng Tailwind CSS qua CDN để thiết kế giao diện.
- Sử dụng thư viện Canvas Confetti qua CDN để tạo hiệu ứng pháo hoa.
- Sử dụng font chữ 'Inter' từ Google Fonts.
- Viết thêm CSS thuần trong thẻ <style> để tạo animation shake (rung lắc) khi người chơi trả lời sai.

Cấu trúc giao diện gồm 3 phần (ẩn/hiện bằng JavaScript):
1. Màn hình Bắt đầu: Có tiêu đề trò chơi, lời giới thiệu và nút "Bắt đầu ngay" có hiệu ứng hover.
2. Màn hình Chơi:
   - Có nút bật/tắt chế độ toàn màn hình (Fullscreen) ở góc phải.
   - Hiển thị tiến độ câu hỏi (ví dụ: Câu 1/10) và một thanh tiến trình (progress bar) thay đổi chiều dài theo số câu.
   - Tuyệt đối không hiển thị điểm số ở màn hình này.
   - Khung hiển thị nội dung câu hỏi và các nút bấm cho đáp án.
   - Có nút "Bỏ qua câu này". Khi bấm, hệ thống sẽ chuyển ngay sang câu tiếp theo mà không ghi điểm cho câu bị bỏ qua.
3. Màn hình Kết quả:
   - Chỉ xuất hiện khi học sinh đã hoàn thành xong toàn bộ các câu hỏi (bao gồm cả việc trả lời hoặc bấm bỏ qua).
   - Hiển thị thông báo chúc mừng và tổng điểm đạt được (ví dụ: 8/10).
   - Có nút "Chơi lại từ đầu" để load lại trang.

Logic JavaScript & Trải nghiệm:
- Cấu trúc dữ liệu: Lưu câu hỏi trong một mảng các Object có dạng { q: "Câu hỏi", a: ["Đáp án 1", "Đáp án 2",...], c: index_đáp_án_đúng }.
- Lưu trữ điểm số ngầm trong biến, không in ra màn hình khi đang chơi.
- Khi trả lời đúng: Nút đổi màu xanh lá, bắn pháo hoa, cộng điểm ngầm và tự động chuyển câu sau 1 giây.
- Khi trả lời sai: Nút đổi màu đỏ, và nút bị rung lắc (kích hoạt class shake). Tự động chuyển câu sau 1 giây.

Nội dung dữ liệu đầu vào hoặc tài liệu đính kèm để tự động tạo ra 10 câu hỏi trắc nghiệm liên quan đến chủ đề:
${input ? input : "(Không có văn bản nhập tay, vui lòng phân tích nội dung từ file đính kèm để tạo 10 câu hỏi trắc nghiệm phù hợp)"}`;
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

    const result = await model.generateContent(parts);
    const response = await result.response;
    
    res.status(200).json({ text: response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Hệ thống đang bận hoặc file quá lớn. Lỗi chi tiết: ' + error.message });
  }
}
