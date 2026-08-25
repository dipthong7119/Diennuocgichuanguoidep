/**
 * app.js — Ứng dụng chính (Frontend Logic)
 * Quản lý hộ gia đình, đồng hồ, chỉ số, hóa đơn, AI
 */

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════
let currentUser = null;
let allHoGiaDinh = [];
let allDongHo = [];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-msg');
    msg.textContent = message;
    toast.className = `toast ${type}`;
    setTimeout(() => { toast.classList.add('hidden'); }, 3500);
}

function showModal(id) {
    document.getElementById(id).classList.remove('hidden');
}
function hideModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function updateClock() {
    const el = document.getElementById('current-time');
    if (el) {
        const now = new Date();
        el.textContent = now.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    }
}
setInterval(updateClock, 1000);
updateClock();

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    btn.disabled = true;
    btn.innerHTML = '<span>Đang đăng nhập...</span>';
    errorEl.classList.add('hidden');

    try {
        const data = await API.post('/auth/login', { username, password });
        API.setToken(data.token);
        currentUser = { username: data.username, role: data.role };
        localStorage.setItem('user', JSON.stringify(currentUser));
        showApp();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Đăng nhập</span>';
    }
    return false;
}

async function handleLogout() {
    try { await API.post('/auth/logout'); } catch (_) { }
    API.clearToken();
    localStorage.removeItem('user');
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    showToast('Đã đăng xuất', 'info');
}

function checkAuth() {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved && token) {
        currentUser = JSON.parse(saved);
        API.setToken(token);
        showApp();
    }
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('user-display').textContent =
        `👤 ${currentUser.username} (${currentUser.role})`;
    loadDashboard();
    switchPage('dashboard');
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

const PAGE_TITLES = {
    'dashboard': 'Dashboard',
    'ho-gia-dinh': 'Quản lý Hộ gia đình',
    'dong-ho': 'Quản lý Đồng hồ',
    'chi-so': 'Nhập chỉ số & Lịch sử',
    'hoa-don': 'Hóa đơn',
    'ai-insight': 'Phân tích AI',
};

function switchPage(page) {
    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');
    // Update title
    document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;

    // Load data for page
    if (page === 'dashboard') loadDashboard();
    else if (page === 'ho-gia-dinh') loadHoGiaDinh();
    else if (page === 'dong-ho') loadDongHo();
    else if (page === 'chi-so') loadChiSoPage();
    else if (page === 'hoa-don') loadHoaDonPage();
    else if (page === 'ai-insight') loadAIPage();

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
    return false;
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

async function loadDashboard() {
    try {
        const stats = await API.get('/thong-ke/tong-quan');
        document.getElementById('stat-ho').textContent = stats.tong_ho_gia_dinh;
        document.getElementById('stat-dh').textContent = stats.tong_dong_ho;
        document.getElementById('stat-doanhthu').textContent = formatMoney(stats.tong_doanh_thu);
        document.getElementById('stat-congno').textContent = formatMoney(stats.cong_no);

        // Revenue chart
        const revenue = await API.get('/thong-ke/doanh-thu-theo-thang');
        renderRevenueChart(revenue);

        // Unpaid invoices
        await loadUnpaidInvoices();
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

function renderRevenueChart(data) {
    const container = document.getElementById('chart-revenue');
    if (!data.length) {
        container.innerHTML = '<p class="empty-state">Chưa có dữ liệu doanh thu</p>';
        return;
    }
    const max = Math.max(...data.map(d => d.tong_tien));
    container.innerHTML = data.map(d => {
        const pct = max > 0 ? (d.tong_tien / max * 100) : 0;
        return `
            <div class="chart-bar-group">
                <div class="chart-bar-label">
                    <span>${d.thang}</span>
                    <span>${formatMoney(d.tong_tien)}</span>
                </div>
                <div class="chart-bar-track">
                    <div class="chart-bar-fill" style="width:${pct}%"></div>
                </div>
            </div>`;
    }).join('');
}

async function loadUnpaidInvoices() {
    const container = document.getElementById('unpaid-list');
    try {
        // Load all households to find unpaid invoices
        const hoList = await API.get('/ho-gia-dinh/');
        let unpaidItems = [];
        for (const ho of hoList) {
            const hds = await API.get(`/chi-so/hoa-don/${ho.MaHo}`);
            const unpaid = hds.filter(h => !h.TrangThaiThanhToan);
            unpaid.forEach(h => {
                unpaidItems.push({ ...h, TenChuHo: ho.TenChuHo });
            });
        }

        if (!unpaidItems.length) {
            container.innerHTML = '<p class="empty-state">Tất cả hóa đơn đã thanh toán ✅</p>';
            return;
        }

        container.innerHTML = unpaidItems.map(item => `
            <div class="list-item">
                <div class="list-item-info">
                    <span class="list-item-title">${item.TenChuHo}</span>
                    <span class="list-item-sub">${item.MaHoaDon} — ${item.ThangNam}</span>
                </div>
                <span class="money money-negative">${formatMoney(item.TongTien)}</span>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p class="empty-state">Lỗi tải dữ liệu</p>';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HỘ GIA ĐÌNH
// ═══════════════════════════════════════════════════════════════════════════

async function loadHoGiaDinh() {
    try {
        allHoGiaDinh = await API.get('/ho-gia-dinh/');
        renderHoTable(allHoGiaDinh);
    } catch (err) {
        showToast('Lỗi tải danh sách hộ: ' + err.message, 'error');
    }
}

function renderHoTable(list) {
    const tbody = document.getElementById('tbody-ho');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có hộ gia đình nào</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(ho => `
        <tr>
            <td><strong>${ho.MaHo}</strong></td>
            <td>${ho.TenChuHo}</td>
            <td>${ho.SoDienThoai}</td>
            <td><span class="badge badge-info">${ho.MaPhong}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn action-btn-edit" onclick="editHo('${ho.MaHo}')">✏️ Sửa</button>
                    <button class="action-btn action-btn-delete" onclick="deleteHo('${ho.MaHo}')">🗑️ Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterHoGiaDinh() {
    const q = document.getElementById('search-ho').value.toLowerCase();
    const filtered = allHoGiaDinh.filter(ho =>
        ho.MaHo.toLowerCase().includes(q) ||
        ho.TenChuHo.toLowerCase().includes(q) ||
        ho.MaPhong.toLowerCase().includes(q)
    );
    renderHoTable(filtered);
}

async function handleSaveHo(e) {
    e.preventDefault();
    const mode = document.getElementById('ho-edit-mode').value;
    const maHo = document.getElementById('ho-ma').value;
    const body = {
        MaHo: maHo,
        TenChuHo: document.getElementById('ho-ten').value,
        SoDienThoai: document.getElementById('ho-sdt').value,
        MaPhong: document.getElementById('ho-phong').value,
    };

    try {
        if (mode === 'create') {
            await API.post('/ho-gia-dinh/', body);
            showToast('Đã thêm hộ gia đình thành công', 'success');
        } else {
            const { MaHo, ...updateBody } = body;
            await API.put(`/ho-gia-dinh/${maHo}`, updateBody);
            showToast('Đã cập nhật hộ gia đình', 'success');
        }
        hideModal('modal-ho');
        loadHoGiaDinh();
    } catch (err) {
        showToast('Lỗi: ' + err.message, 'error');
    }
    return false;
}

function editHo(maHo) {
    const ho = allHoGiaDinh.find(h => h.MaHo === maHo);
    if (!ho) return;
    document.getElementById('ho-edit-mode').value = 'edit';
    document.getElementById('ho-ma').value = ho.MaHo;
    document.getElementById('ho-ma').disabled = true;
    document.getElementById('ho-ten').value = ho.TenChuHo;
    document.getElementById('ho-sdt').value = ho.SoDienThoai;
    document.getElementById('ho-phong').value = ho.MaPhong;
    document.getElementById('modal-ho-title').textContent = 'Sửa hộ gia đình';
    showModal('modal-ho');
}

async function deleteHo(maHo) {
    if (!confirm(`Bạn chắc chắn muốn xóa hộ "${maHo}"?`)) return;
    try {
        await API.delete(`/ho-gia-dinh/${maHo}`);
        showToast('Đã xóa hộ gia đình', 'success');
        loadHoGiaDinh();
    } catch (err) {
        showToast('Lỗi xóa: ' + err.message, 'error');
    }
}

// Reset modal when opening for create
const origShowModal = showModal;
window.showModal = function(id) {
    if (id === 'modal-ho') {
        document.getElementById('ho-edit-mode').value = 'create';
        document.getElementById('ho-ma').disabled = false;
        document.getElementById('form-ho').reset();
        document.getElementById('modal-ho-title').textContent = 'Thêm hộ gia đình';
    }
    if (id === 'modal-dh') {
        document.getElementById('dh-edit-mode').value = 'create';
        document.getElementById('dh-ma').disabled = false;
        document.getElementById('form-dh').reset();
        document.getElementById('modal-dh-title').textContent = 'Thêm đồng hồ';
        populateHoSelect('dh-ho');
    }
    origShowModal(id);
};

// ═══════════════════════════════════════════════════════════════════════════
// ĐỒNG HỒ
// ═══════════════════════════════════════════════════════════════════════════

async function loadDongHo() {
    try {
        allDongHo = await API.get('/dong-ho/');
        renderDHTable(allDongHo);
    } catch (err) {
        showToast('Lỗi tải đồng hồ: ' + err.message, 'error');
    }
}

function renderDHTable(list) {
    const tbody = document.getElementById('tbody-dh');
    if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Chưa có đồng hồ nào</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(dh => `
        <tr>
            <td><strong>${dh.MaDongHo}</strong></td>
            <td>${dh.MaHo}</td>
            <td><span class="badge ${dh.Loai === 'Điện' ? 'badge-dien' : 'badge-nuoc'}">${dh.Loai === 'Điện' ? '⚡' : '💧'} ${dh.Loai}</span></td>
            <td>${formatMoney(dh.DonGia)}/đơn vị</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn action-btn-edit" onclick="editDH('${dh.MaDongHo}')">✏️ Sửa</button>
                    <button class="action-btn action-btn-delete" onclick="deleteDH('${dh.MaDongHo}')">🗑️ Xóa</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterDongHo() {
    const q = document.getElementById('search-dh').value.toLowerCase();
    const filtered = allDongHo.filter(dh =>
        dh.MaDongHo.toLowerCase().includes(q) ||
        dh.MaHo.toLowerCase().includes(q) ||
        dh.Loai.toLowerCase().includes(q)
    );
    renderDHTable(filtered);
}

async function handleSaveDH(e) {
    e.preventDefault();
    const mode = document.getElementById('dh-edit-mode').value;
    const maDH = document.getElementById('dh-ma').value;
    const body = {
        MaDongHo: maDH,
        MaHo: document.getElementById('dh-ho').value,
        Loai: document.getElementById('dh-loai').value,
        DonGia: parseFloat(document.getElementById('dh-dongia').value),
    };

    try {
        if (mode === 'create') {
            await API.post('/dong-ho/', body);
            showToast('Đã thêm đồng hồ thành công', 'success');
        } else {
            await API.put(`/dong-ho/${maDH}`, { Loai: body.Loai, DonGia: body.DonGia });
            showToast('Đã cập nhật đồng hồ', 'success');
        }
        hideModal('modal-dh');
        loadDongHo();
    } catch (err) {
        showToast('Lỗi: ' + err.message, 'error');
    }
    return false;
}

function editDH(maDH) {
    const dh = allDongHo.find(d => d.MaDongHo === maDH);
    if (!dh) return;
    document.getElementById('dh-edit-mode').value = 'edit';
    document.getElementById('dh-ma').value = dh.MaDongHo;
    document.getElementById('dh-ma').disabled = true;
    populateHoSelect('dh-ho');
    setTimeout(() => {
        document.getElementById('dh-ho').value = dh.MaHo;
    }, 100);
    document.getElementById('dh-loai').value = dh.Loai;
    document.getElementById('dh-dongia').value = dh.DonGia;
    document.getElementById('modal-dh-title').textContent = 'Sửa đồng hồ';
    showModal('modal-dh');
}

async function deleteDH(maDH) {
    if (!confirm(`Bạn chắc chắn muốn xóa đồng hồ "${maDH}"?`)) return;
    try {
        await API.delete(`/dong-ho/${maDH}`);
        showToast('Đã xóa đồng hồ', 'success');
        loadDongHo();
    } catch (err) {
        showToast('Lỗi xóa: ' + err.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// NHẬP CHỈ SỐ
// ═══════════════════════════════════════════════════════════════════════════

async function loadChiSoPage() {
    try {
        allDongHo = await API.get('/dong-ho/');
        populateDongHoSelect('cs-dongho');
        populateDongHoSelect('cs-filter-dh');
    } catch (err) {
        console.error(err);
    }
}

function populateDongHoSelect(selectId) {
    const sel = document.getElementById(selectId);
    const current = sel.value;
    sel.innerHTML = '<option value="">-- Chọn đồng hồ --</option>';
    allDongHo.forEach(dh => {
        const icon = dh.Loai === 'Điện' ? '⚡' : '💧';
        sel.innerHTML += `<option value="${dh.MaDongHo}">${icon} ${dh.MaDongHo} (${dh.MaHo})</option>`;
    });
    if (current) sel.value = current;
}

async function populateHoSelect(selectId) {
    try {
        if (!allHoGiaDinh.length) allHoGiaDinh = await API.get('/ho-gia-dinh/');
        const sel = document.getElementById(selectId);
        sel.innerHTML = '<option value="">-- Chọn hộ --</option>';
        allHoGiaDinh.forEach(ho => {
            sel.innerHTML += `<option value="${ho.MaHo}">${ho.MaHo} — ${ho.TenChuHo}</option>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function handleNhapChiSo(e) {
    e.preventDefault();
    const resultEl = document.getElementById('cs-result');

    const body = {
        MaChiSo: document.getElementById('cs-ma').value,
        MaDongHo: document.getElementById('cs-dongho').value,
        ThangNam: document.getElementById('cs-thangnam').value,
        ChiSoCu: parseInt(document.getElementById('cs-cu').value),
        ChiSoMoi: parseInt(document.getElementById('cs-moi').value),
    };

    try {
        const data = await API.post('/chi-so/', body);
        resultEl.classList.remove('hidden');
        resultEl.innerHTML = `
            <strong>✅ ${data.message}</strong><br>
            Tiêu thụ: <strong>${body.ChiSoMoi - body.ChiSoCu}</strong> đơn vị<br>
            Hóa đơn: <strong>${data.hoa_don.MaHoaDon}</strong> — ${formatMoney(data.hoa_don.TongTien)}
        `;
        showToast('Nhập chỉ số thành công!', 'success');
        document.getElementById('form-chi-so').reset();
    } catch (err) {
        resultEl.classList.remove('hidden');
        resultEl.style.borderColor = 'rgba(239,68,68,0.3)';
        resultEl.style.background = 'rgba(239,68,68,0.08)';
        resultEl.style.color = '#ef4444';
        resultEl.innerHTML = `<strong>❌ Lỗi:</strong> ${err.message}`;
    }
    return false;
}

async function loadLichSuChiSo() {
    const maDH = document.getElementById('cs-filter-dh').value;
    const tbody = document.getElementById('tbody-cs-history');
    if (!maDH) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Chọn đồng hồ để xem lịch sử</td></tr>';
        return;
    }
    try {
        const data = await API.get(`/chi-so/${maDH}`);
        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Chưa có dữ liệu</td></tr>';
            return;
        }
        tbody.innerHTML = data.map(cs => `
            <tr>
                <td>${cs.ThangNam}</td>
                <td>${cs.ChiSoCu}</td>
                <td>${cs.ChiSoMoi}</td>
                <td><strong>${cs.ChiSoMoi - cs.ChiSoCu}</strong></td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Lỗi tải dữ liệu</td></tr>';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HÓA ĐƠN
// ═══════════════════════════════════════════════════════════════════════════

async function loadHoaDonPage() {
    try {
        if (!allHoGiaDinh.length) allHoGiaDinh = await API.get('/ho-gia-dinh/');
        const sel = document.getElementById('hd-filter-ho');
        sel.innerHTML = '<option value="">-- Tất cả hộ gia đình --</option>';
        allHoGiaDinh.forEach(ho => {
            sel.innerHTML += `<option value="${ho.MaHo}">${ho.MaHo} — ${ho.TenChuHo}</option>`;
        });
        loadHoaDon();
    } catch (err) {
        console.error(err);
    }
}

async function loadHoaDon() {
    const maHo = document.getElementById('hd-filter-ho').value;
    const tbody = document.getElementById('tbody-hd');

    try {
        let allHD = [];
        if (maHo) {
            allHD = await API.get(`/chi-so/hoa-don/${maHo}`);
        } else {
            // Load all
            if (!allHoGiaDinh.length) allHoGiaDinh = await API.get('/ho-gia-dinh/');
            for (const ho of allHoGiaDinh) {
                const hds = await API.get(`/chi-so/hoa-don/${ho.MaHo}`);
                allHD.push(...hds);
            }
        }

        if (!allHD.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có hóa đơn</td></tr>';
            return;
        }

        tbody.innerHTML = allHD.map(hd => `
            <tr>
                <td><strong>${hd.MaHoaDon}</strong></td>
                <td>${hd.MaHo}</td>
                <td>${hd.ThangNam}</td>
                <td class="money">${formatMoney(hd.TongTien)}</td>
                <td>
                    ${hd.TrangThaiThanhToan
                        ? '<span class="badge badge-success">✅ Đã thanh toán</span>'
                        : '<span class="badge badge-warning">⏳ Chưa thanh toán</span>'
                    }
                </td>
                <td>
                    <div class="action-btns">
                        ${!hd.TrangThaiThanhToan
                            ? `<button class="action-btn action-btn-pay" onclick="thanhToan('${hd.MaHoaDon}')">💳 Thanh toán</button>`
                            : ''
                        }
                        <button class="action-btn action-btn-ai" onclick="goToAI('${hd.MaHoaDon}', '${hd.MaHo}')">🤖 AI</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Lỗi tải dữ liệu</td></tr>';
    }
}

async function thanhToan(maHD) {
    if (!confirm(`Đánh dấu hóa đơn "${maHD}" đã thanh toán?`)) return;
    try {
        await API.patch(`/chi-so/hoa-don/${maHD}/thanh-toan`);
        showToast('Đã thanh toán thành công!', 'success');
        loadHoaDon();
    } catch (err) {
        showToast('Lỗi: ' + err.message, 'error');
    }
}

function goToAI(maHD, maHo) {
    switchPage('ai-insight');
    setTimeout(() => {
        document.getElementById('ai-ho').value = maHo;
        loadHoaDonForAI().then(() => {
            document.getElementById('ai-hoadon').value = maHD;
        });
    }, 200);
}

// ═══════════════════════════════════════════════════════════════════════════
// PHÂN TÍCH AI
// ═══════════════════════════════════════════════════════════════════════════

async function loadAIPage() {
    try {
        if (!allHoGiaDinh.length) allHoGiaDinh = await API.get('/ho-gia-dinh/');
        const sel = document.getElementById('ai-ho');
        sel.innerHTML = '<option value="">-- Chọn hộ --</option>';
        allHoGiaDinh.forEach(ho => {
            sel.innerHTML += `<option value="${ho.MaHo}">${ho.MaHo} — ${ho.TenChuHo}</option>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadHoaDonForAI() {
    const maHo = document.getElementById('ai-ho').value;
    const sel = document.getElementById('ai-hoadon');
    sel.innerHTML = '<option value="">-- Chọn hóa đơn --</option>';
    if (!maHo) return;

    try {
        const hds = await API.get(`/chi-so/hoa-don/${maHo}`);
        hds.forEach(hd => {
            sel.innerHTML += `<option value="${hd.MaHoaDon}">${hd.MaHoaDon} — ${hd.ThangNam} — ${formatMoney(hd.TongTien)}</option>`;
        });
    } catch (err) {
        console.error(err);
    }
}

async function generateAI() {
    const maHo = document.getElementById('ai-ho').value;
    const maHD = document.getElementById('ai-hoadon').value;

    if (!maHo || !maHD) {
        showToast('Vui lòng chọn hộ gia đình và hóa đơn', 'error');
        return;
    }

    const loading = document.getElementById('ai-loading');
    const btn = document.getElementById('btn-ai-generate');
    const results = document.getElementById('ai-results');

    loading.classList.remove('hidden');
    btn.disabled = true;

    try {
        const data = await API.post('/ai-insight/generate', {
            ma_hoa_don: maHD,
            ma_ho: maHo,
        });

        // Determine badge class
        let badgeClass = 'badge-success';
        if (data.MucDoCanhBao === 'Cao') badgeClass = 'badge-warning';
        if (data.MucDoCanhBao === 'Nguy hiểm') badgeClass = 'badge-danger';

        const item = `
            <div class="ai-result-item">
                <div class="ai-result-header">
                    <span class="badge ${badgeClass}">${data.MucDoCanhBao}</span>
                    <span>${data.MaDanhGia}</span>
                </div>
                <div class="ai-result-body">${data.NoiDungNhanXet}</div>
            </div>
        `;

        // Prepend new result
        const existingEmpty = results.querySelector('.empty-state');
        if (existingEmpty) results.innerHTML = '';
        results.innerHTML = item + results.innerHTML;

        showToast('Phân tích AI hoàn tất!', 'success');
    } catch (err) {
        showToast('Lỗi AI: ' + err.message, 'error');
    } finally {
        loading.classList.add('hidden');
        btn.disabled = false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
