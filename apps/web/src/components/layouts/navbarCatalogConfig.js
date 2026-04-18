/**
 * Danh mục điều hướng — khớp tên `category` gửi API (products.getAll `category`).
 * Cấu trúc theo nhu cầu sinh viên đại học (đại cương, nhóm ngành, ôn KT–cuối kỳ, ngoại ngữ).
 * `query` trong children: thêm bộ lọc `q` kèm danh mục cha; rỗng = xem tất cả trong danh mục.
 */
export const NAV_CATALOG = [
  {
    label: 'Giáo trình đại cương',
    category: 'Giáo Trình',
    chipColor: 'var(--primary-500)',
    children: [
      { label: 'Toán – Đại số – Giải tích – Xác suất', query: 'toán đại số giải tích', icon: '📐' },
      { label: 'Vật lý đại cương', query: 'vật lý đại cương', icon: '⚛️' },
      { label: 'Hóa học – Hóa đại cương', query: 'hóa đại cương', icon: '🧪' },
      { label: 'Sinh học – Hoá sinh', query: 'sinh học đại cương', icon: '🧬' },
      { label: 'Tin học – Lập trình cơ sở', query: 'lập trình cơ sở tin học', icon: '💾' },
      { label: 'Kinh tế – Quản trị học đại cương', query: 'kinh tế học đại cương', icon: '📈' },
      {
        label: 'Triết – Chính trị – Pháp luật (GDTC)',
        query: 'triết học mác lênin pháp luật đại cương',
        icon: '📜',
      },
      { label: 'Lịch sử – Địa lý – Xã hội đại cương', query: 'lịch sử địa lý đại cương', icon: '🗺️' },
      { label: 'Ngoại ngữ 1 – 2 (Anh, …)', query: 'anh văn đại cương', icon: '🔤' },
      { label: 'Xem tất cả giáo trình', query: '', icon: '📘' },
    ],
  },
  {
    label: 'Sách theo ngành ĐH',
    category: 'Sách Chuyên Ngành',
    chipColor: 'var(--accent-600)',
    children: [
      { label: 'Công nghệ thông tin & phần mềm', query: 'công nghệ thông tin IT', icon: '💻' },
      { label: 'An ninh mạng – Khoa học dữ liệu – AI', query: 'an ninh mạng data science', icon: '🔐' },
      { label: 'Điện – Điện tử – Tự động hóa', query: 'điện điện tử tự động hóa', icon: '⚡' },
      { label: 'Cơ khí – Chế tạo – Ô tô', query: 'cơ khí chế tạo', icon: '⚙️' },
      { label: 'Xây dựng – Kiến trúc – Giao thông', query: 'xây dựng kiến trúc', icon: '🏗️' },
      { label: 'Kinh tế – Tài chính – Ngân hàng', query: 'tài chính ngân hàng', icon: '💹' },
      { label: 'Kế toán – Kiểm toán – Thuế', query: 'kế toán kiểm toán', icon: '📊' },
      { label: 'Quản trị kinh doanh – Marketing – Logistics', query: 'quản trị kinh doanh marketing', icon: '📋' },
      { label: 'Luật – Luật kinh tế', query: 'luật kinh tế', icon: '⚖️' },
      { label: 'Y – Dược – Điều dưỡng', query: 'y dược điều dưỡng', icon: '⚕️' },
      { label: 'Nông – Lâm – Thủy sản – Thực phẩm', query: 'nông lâm thủy sản', icon: '🌾' },
      { label: 'Báo chí – Truyền thông – PR', query: 'báo chí truyền thông', icon: '📣' },
      { label: 'Sư phạm – Giáo dục – Tâm lý', query: 'sư phạm giáo dục tâm lý', icon: '🎓' },
      { label: 'Du lịch – Khách sạn – Nhà hàng', query: 'du lịch khách sạn', icon: '🧳' },
      { label: 'Mỹ thuật – Thiết kế – Thời trang', query: 'thiết kế đồ họa mỹ thuật', icon: '🎨' },
      { label: 'Xem tất cả sách chuyên ngành', query: '', icon: '📚' },
    ],
  },
  {
    label: 'Ôn tập & kiểm tra',
    category: 'Tài Liệu Ôn Thi',
    chipColor: 'var(--accent-500)',
    children: [
      { label: 'Đề cương – Outline môn học', query: 'đề cương outline', icon: '📝' },
      { label: 'Bộ đề – Bài tập có lời giải', query: 'bài tập lời giải', icon: '✅' },
      { label: 'Ôn kiểm tra giữa kỳ / cuối kỳ', query: 'giữa kỳ cuối kỳ', icon: '📑' },
      { label: 'Slide – Bài giảng – Ghi chép', query: 'slide bài giảng', icon: '🖼️' },
      { label: 'Đồ án – Báo cáo – Template', query: 'đồ án báo cáo', icon: '📎' },
      { label: 'Ôn chứng chỉ (Tin học, ngoại ngữ…)', query: 'chứng chỉ MOS', icon: '🏅' },
      { label: 'Xem tất cả tài liệu ôn tập', query: '', icon: '📚' },
    ],
  },
  {
    label: 'Dụng cụ học tập',
    category: 'Dụng Cụ Học Tập',
    chipColor: 'var(--secondary-600)',
    children: [
      { label: 'Máy tính cầm tay (MTCT)', query: 'máy tính cầm tay', icon: '🔢' },
      { label: 'Thước – Compa – Vẽ kỹ thuật', query: 'thước compa ê ke', icon: '📐' },
      { label: 'Bút – Mực – Highlight', query: 'bút mực highlight', icon: '✏️' },
      { label: 'Sổ – File – Tài liệu', query: 'sổ tay file', icon: '📒' },
      { label: 'Balo – Túi đựng laptop / tài liệu', query: 'balo túi laptop', icon: '🎒' },
      { label: 'Xem tất cả dụng cụ', query: '', icon: '🛠️' },
    ],
  },
  {
    label: 'Ngoại ngữ & chứng chỉ',
    category: 'Ngoại Ngữ',
    chipColor: 'var(--primary-400)',
    children: [
      { label: 'Tiếng Anh giao tiếp', query: 'tiếng anh giao tiếp', icon: '🇬🇧' },
      { label: 'Anh văn chuyên ngành', query: 'anh văn chuyên ngành', icon: '📗' },
      { label: 'IELTS / TOEFL / TOEIC', query: 'IELTS TOEFL TOEIC', icon: '📝' },
      { label: 'Tiếng Trung', query: 'tiếng trung', icon: '🇨🇳' },
      { label: 'Tiếng Nhật', query: 'tiếng nhật', icon: '🇯🇵' },
      { label: 'Tiếng Hàn', query: 'tiếng hàn', icon: '🇰🇷' },
      { label: 'Tiếng Pháp / Đức', query: 'tiếng pháp tiếng đức', icon: '🇪🇺' },
      { label: 'Xem tất cả ngoại ngữ', query: '', icon: '🌐' },
    ],
  },
  {
    label: 'Khác (SV)',
    category: 'Khác',
    chipColor: 'var(--neutral-600)',
    children: [
      { label: 'Photocopy – Scan – Handout', query: 'photocopy scan', icon: '🖨️' },
      { label: 'CV – Phỏng vấn – Kỹ năng nghề nghiệp', query: 'CV phỏng vấn kỹ năng', icon: '💼' },
      { label: 'Tạp chí – Ấn phẩm học thuật', query: 'tạp chí học thuật', icon: '📰' },
      { label: 'Sách tham khảo ngoài giáo trình', query: 'sách tham khảo', icon: '📖' },
      { label: 'Xem tất cả mục khác', query: '', icon: '📦' },
    ],
  },
];

/** Chip lọc trang chủ — cùng thứ tự & `category` với menu Danh mục */
export const HOME_CATEGORY_CHIPS = [
  { val: 'all', label: 'Tất cả', chipColor: 'var(--neutral-600)' },
  ...NAV_CATALOG.map((item) => ({
    val: item.category,
    label: item.label,
    chipColor: item.chipColor ?? 'var(--neutral-600)',
  })),
];

const CATEGORY_LABEL_BY_VALUE = Object.fromEntries(NAV_CATALOG.map((item) => [item.category, item.label]));

/** Nhãn hiển thị cho giá trị `category` lưu ở API/DB (admin có thể thêm danh mục lạ → trả về nguyên tên). */
export const getCategoryDisplayLabel = (apiCategoryName) => {
  if (apiCategoryName == null || apiCategoryName === '') return '';
  return CATEGORY_LABEL_BY_VALUE[apiCategoryName] ?? apiCategoryName;
};
