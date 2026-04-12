const DISALLOWED_CONSUMER_TECH = [
  'iphone',
  'android',
  'dien thoai',
  'smartphone',
  'laptop',
  'macbook',
  'ipad',
  'tablet',
  'tai nghe',
  'headphone',
  'airpod',
  'earbud',
  'smartwatch',
  'apple watch',
  'camera',
  'webcam',
  'chuot gaming',
  'ban phim gaming',
  'xbox',
  'playstation',
  'ps5',
  'man hinh',
  'monitor',
  'loa bluetooth',
];

const EDUCATIONAL_CONTEXT = [
  'giao trinh',
  'sach',
  'tai lieu',
  'de cuong',
  'on thi',
  'vo ghi',
  'tap vo',
  'but',
  'thuoc',
  'hoc phan',
  'nganh hoc',
  'casio',
  'may tinh cam tay',
  'stationery',
  'study',
  'textbook',
  'notebook',
];

function normalizeText(input) {
  if (!input) return '';
  return String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isEducationalListing(item) {
  const merged = normalizeText(
    `${item?.name ?? ''} ${item?.description ?? ''} ${item?.category ?? ''}`,
  );
  if (!merged) return true;

  const hasTechKeyword = DISALLOWED_CONSUMER_TECH.some((keyword) =>
    merged.includes(keyword),
  );
  if (!hasTechKeyword) return true;

  const hasAcademicContext = EDUCATIONAL_CONTEXT.some((keyword) =>
    merged.includes(keyword),
  );
  return hasAcademicContext;
}
