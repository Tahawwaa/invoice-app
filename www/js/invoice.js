'use strict';

// ===== NUMBER TO PERSIAN WORDS =====
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

// ===== FORMAT / UNFORMAT =====
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

// ===== ROW MANAGEMENT =====
let rowCount = 0;

function addRow() {
  rowCount++;
  const tbody = document.getElementById('rowsBody');
  const tr = document.createElement('tr');
  tr.id = 'row-' + rowCount;

  tr.innerHTML = `
    <td>${rowCount}</td>
    <td><input type="text" class="f-desc" style="text-align:right;padding:0 4px" placeholder="شرح کالا یا خدمات"></td>
    <td><input type="text" class="f-qty" placeholder="0" oninput="calcRow(this)"></td>
    <td><input type="text" class="f-unit" placeholder="عدد"></td>
    <td><input type="text" class="f-price" placeholder="0" oninput="calcRow(this)"></td>
    <td class="f-total num-cell">—</td>
    <td class="no-print"><button class="del-btn" onclick="deleteRow(${rowCount})" title="حذف ردیف">✕</button></td>
  `;
  tbody.appendChild(tr);
  updateFooter();
}

function deleteRow(id) {
  const row = document.getElementById('row-' + id);
  if (row) row.remove();
  renumberRows();
  updateFooter();
}

function renumberRows() {
  document.querySelectorAll('#rowsBody tr').forEach((tr, i) => {
    tr.cells[0].textContent = i + 1;
  });
}

// ===== ROW CALCULATION =====
function calcRow(input) {
  const tr = input.closest('tr');
  const qty   = unformat(tr.querySelector('.f-qty').value);
  const price = unformat(tr.querySelector('.f-price').value);
  const total = qty * price;

  tr.querySelector('.f-total').textContent = total > 0 ? fmt(total) : '—';

  tr.dataset.qty   = qty;
  tr.dataset.total = total;

  updateFooter();
}

// ===== FOOTER TOTALS =====
function updateFooter() {
  const rows = document.querySelectorAll('#rowsBody tr');
  let sumQty = 0, sumTotal = 0;

  rows.forEach(tr => {
    sumQty   += parseFloat(tr.dataset.qty   || 0);
    sumTotal += parseFloat(tr.dataset.total || 0);
  });

  document.getElementById('sumQty').textContent  = sumQty   ? fmt(sumQty)   : '';
  document.getElementById('sumTotal').textContent = sumTotal ? fmt(sumTotal) : '';

  document.getElementById('amountWords').textContent =
    sumTotal > 0 ? numberToWords(sumTotal) : '—';
}

// ===== CLEAR FORM =====
function clearForm() {
  if (!confirm('آیا مطمئن هستید که می‌خواهید فرم را پاک کنید؟')) return;
  document.getElementById('rowsBody').innerHTML = '';
  rowCount = 0;
  ['custName', 'notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  updateFooter();
  addRow();
}

// ===== SET TODAY'S DATE (Jalali) =====
function setTodayDate() {
  try {
    const jalali = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    document.getElementById('invDate').value = jalali;
  } catch (e) { /* user types manually */ }
}

// ===== AUTO-FORMAT PRICE/QTY ON BLUR =====
document.addEventListener('blur', function(e) {
  if (e.target.classList.contains('f-price') || e.target.classList.contains('f-qty')) {
    const raw = unformat(e.target.value);
    if (raw > 0) e.target.value = fmt(raw);
  }
}, true);

document.addEventListener('focus', function(e) {
  if (e.target.classList.contains('f-price')) {
    const raw = unformat(e.target.value);
    if (raw > 0) e.target.value = raw;
  }
}, true);

// ===== INIT =====
setTodayDate();
addRow();
addRow();
addRow();
