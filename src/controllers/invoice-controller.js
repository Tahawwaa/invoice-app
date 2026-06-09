'use strict';

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

function updateFooter() {
  const rows = document.querySelectorAll('#rowsBody tr');
  let sumQty = 0, sumTotal = 0;

  rows.forEach(tr => {
    sumQty   += parseFloat(tr.dataset.qty   || 0);
    sumTotal += parseFloat(tr.dataset.total || 0);
  });

  document.getElementById('sumQty').textContent   = sumQty   ? fmt(sumQty)   : '';
  document.getElementById('sumTotal').textContent  = sumTotal ? fmt(sumTotal) : '';
  document.getElementById('amountWords').textContent =
    sumTotal > 0 ? numberToWords(sumTotal) : '—';
}

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

function setTodayDate() {
  try {
    const jalali = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
    document.getElementById('invDate').value = jalali;
  } catch (e) {}
}

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

function printInvoice() {
  if (window.AndroidPrint) {
    window.AndroidPrint.print();
  } else {
    window.print();
  }
}

setTodayDate();
addRow();
addRow();
addRow();
