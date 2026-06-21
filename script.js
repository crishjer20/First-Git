// ==========================================
// BAGIAN 1: HALAMAN UTAMA - CARI MEJA
// ==========================================

const reserveBtn = document.getElementById('reserveBtn');
if (reserveBtn) {
    reserveBtn.addEventListener('click', function(e) {
        this.style.transform = 'scale(0.96)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.reservation-card');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    }

    // ==========================================
    // BAGIAN 2: HALAMAN RESERVASI
    // ==========================================

    // Counter jumlah orang
    const btnMinus = document.querySelector('.btn-minus');
    const btnPlus = document.querySelector('.btn-plus');
    const tableInput = document.getElementById('tableNo');

    if (btnPlus && btnMinus && tableInput) {
        btnPlus.addEventListener('click', () => {
            let val = parseInt(tableInput.value);
            val++;
            tableInput.value = val;
        });

        btnMinus.addEventListener('click', () => {
            let val = parseInt(tableInput.value);
            if (val > 1) val--;
            tableInput.value = val;
        });
    }

    // Filter Tab
    const tabButtons = document.querySelectorAll('.tab-btn');
    let currentFilter = 'all';

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterItems();
            });
        });
    }

    // LOGIKA UTAMA: Tambah data + Notifikasi
    const form = document.getElementById('bookingForm');
    const registryList = document.getElementById('registryList');
    const notification = document.getElementById('notification');

    let reservations = []; // Simpan semua data

    if (form && registryList && notification) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Ambil nilai (TERMASUK TANGGAL)
            const name = document.getElementById('guestName').value;
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const people = tableInput ? tableInput.value : 1;

            // Simpan data ke array
            const newRes = {
                id: Date.now(),
                name: name,
                date: date,
                time: time,
                people: people,
                status: 'confirmed' // Status awal
            };
            reservations.push(newRes);

            // Hapus tulisan kosong
            const emptyMsg = registryList.querySelector('.empty-state');
            if (emptyMsg) emptyMsg.remove();

            // Reset form
            form.reset();
            if (tableInput) tableInput.value = 1;

            // Tampilkan notifikasi
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 2500);

            // Perbarui tampilan
            filterItems();
            updateCount();
        });
    }

    // Fungsi tampilkan data sesuai filter
    function filterItems() {
        registryList.innerHTML = '';

        let filtered = reservations;
        if (currentFilter !== 'all') {
            filtered = reservations.filter(r => r.status === currentFilter);
        }

        if (filtered.length === 0) {
            registryList.innerHTML = `<div class="empty-state">Tidak ada data di kategori ini</div>`;
            return;
        }

        filtered.forEach(res => {
            const item = document.createElement('div');
            item.className = 'registry-item';
            item.dataset.status = res.status;

            // Format tanggal jadi lebih cantik
            const tampilTanggal = new Date(res.date).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });

            item.innerHTML = `
                <div class="item-left">
                    <span class="time-date">${res.time} | ${tampilTanggal}</span>
                    <span class="name-guest">${res.name}</span>
                </div>
                <div class="item-right">
                    <span class="guest-count">${res.people} Guests</span>
                    <select class="status-select" onchange="ubahStatus(${res.id}, this.value)">
                        <option value="confirmed" ${res.status==='confirmed'?'selected':''}>Confirmed</option>
                        <option value="waitlist" ${res.status==='waitlist'?'selected':''}>Waitlist</option>
                        <option value="cancelled" ${res.status==='cancelled'?'selected':''}>Cancelled</option>
                        <option value="completed" ${res.status==='completed'?'selected':''}>Completed</option>
                    </select>
                </div>
            `;
            registryList.appendChild(item);
        });
    }

    // Fungsi ubah status
    window.ubahStatus = function(id, statusBaru) {
        const idx = reservations.findIndex(r => r.id === id);
        if (idx !== -1) {
            reservations[idx].status = statusBaru;
            filterItems();
            updateCount();
        }
    };

    // Update jumlah di tombol
    function updateCount() {
        const all = reservations.length;
        const confirmed = reservations.filter(r => r.status==='confirmed').length;
        const waitlist = reservations.filter(r => r.status==='waitlist').length;
        const cancelled = reservations.filter(r => r.status==='cancelled').length;
        const completed = reservations.filter(r => r.status==='completed').length;

        document.querySelector('[data-filter="all"] span').textContent = `(${all})`;
        document.querySelector('[data-filter="confirmed"] span').textContent = `(${confirmed})`;
        document.querySelector('[data-filter="waitlist"] span').textContent = `(${waitlist})`;
        document.querySelector('[data-filter="cancelled"] span').textContent = `(${cancelled})`;
        document.querySelector('[data-filter="completed"] span').textContent = `(${completed})`;
    }

});