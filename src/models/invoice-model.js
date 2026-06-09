'use strict';

const ONES = [
  '', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه',
  'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده',
  'هفده', 'هجده', 'نوزده'
];
const TENS     = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const HUNDREDS = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];

function _lt1000(n) {
  if (n === 0) return '';
  let parts = [];
  if (n >= 100) { parts.push(HUNDREDS[Math.floor(n / 100)]); n %= 100; }
  if (n >= 20)  { parts.push(TENS[Math.floor(n / 10)]);      n %= 10; }
  if (n > 0)    { parts.push(ONES[n]); }
  return parts.join(' و ');
}

function numberToWords(num) {
  num = Math.round(num);
  if (isNaN(num) || num === 0) return 'صفر';
  if (num < 0) return 'منفی ' + numberToWords(-num);

  const segments = [
    { val: 1_000_000_000_000, name: 'تریلیون' },
    { val: 1_000_000_000,     name: 'میلیارد' },
    { val: 1_000_000,         name: 'میلیون' },
    { val: 1_000,             name: 'هزار' },
  ];

  let parts = [];
  for (const seg of segments) {
    if (num >= seg.val) {
      const q = Math.floor(num / seg.val);
      parts.push(_lt1000(q) + ' ' + seg.name);
      num %= seg.val;
    }
  }
  if (num > 0) parts.push(_lt1000(num));
  return parts.join(' و ');
}

function fmt(n) {
  if (n === '' || n === null || isNaN(Number(n))) return '';
  return Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function unformat(str) {
  if (!str) return 0;
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic  = '٠١٢٣٤٥٦٧٨٩';
  let s = String(str).replace(/,/g, '').replace(/،/g, '').replace(/٬/g, '');
  for (let i = 0; i < 10; i++) {
    s = s.split(persian[i]).join(i);
    s = s.split(arabic[i]).join(i);
  }
  return parseFloat(s) || 0;
}
