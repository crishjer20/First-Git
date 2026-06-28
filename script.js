document.addEventListener('DOMContentLoaded', () => {
    let reservations = [];
    const simpanan = localStorage.getItem('dataReservasi');
    if (simpanan) reservations = JSON.parse(simpanan);

    function simpanData() {
        localStorage.setItem('dataReservasi', JSON.stringify(reservations));
    }

    // ==========================================
    // BAGIAN 1: HALAMAN UTAMA - CARI MEJA & ANIMASI
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
    // Counter jumlah meja/tamu
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

    // Filter Tab & Status
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

    // Simpan Data & Elemen Utama
    const form = document.getElementById('bookingForm');
    const registryList = document.getElementById('registryList');
    const notification = document.getElementById('notification');

    if (form && registryList && notification) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validasi dasar
            const name = document.getElementById('guestName').value.trim();
            const date = document.getElementById('bookingDate').value;
            const time = document.getElementById('bookingTime').value;
            const people = tableInput ? tableInput.value : 1;

            if (!name || !date || !time) {
                alert('Mohon isi semua kolom yang wajib!');
                return;
            }

            // Tambah data baru
            const newRes = {
                id: Date.now(),
                name: name,
                date: date,
                time: time,
                people: people,
                status: 'confirmed'
            };
            reservations.push(newRes);
            simpanData();

            // Hapus pesan kosong
            const emptyMsg = registryList.querySelector('.empty-state');
            if (emptyMsg) emptyMsg.remove();

            // Reset form
            form.reset();
            if (tableInput) tableInput.value = 1;

            // Tampilkan notifikasi
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 2500);

            // Perbarui tampilan & hitungan
            filterItems();
            updateCount();
        });
    }

    // TABEL STANDAR + FORMAT TANGGAL dd/mm/yyyy
    function filterItems() {
        if (!registryList) return;
        registryList.innerHTML = '';
        let filtered = reservations;
        if (currentFilter !== 'all') {
            filtered = reservations.filter(r => r.status === currentFilter);
        }

        if (filtered.length === 0) {
            registryList.innerHTML = `<div class="empty-state">Tidak ada data di kategori ini</div>`;
            return;
        }

        // Buat tabel
        const table = document.createElement('table');
        table.className = 'reservation-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Date</th>
                    <th>Guest Name</th>
                    <th>Number of Guest</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        filtered.forEach(res => {
            // Format tanggal sesuai keinginan: hari/bulan/tahun
            const tampilTanggal = new Date(res.date).toLocaleDateString('id-ID', { 
                day:'2-digit', 
                month:'2-digit', 
                year:'numeric' 
            });

            const baris = document.createElement('tr');
            baris.innerHTML = `
                <td>${res.time}</td>
                <td>${tampilTanggal}</td>
                <td>${res.name}</td>
                <td>${res.people} Tamu</td>
                <td>
                    <select class="status-select" onchange="ubahStatus(${res.id}, this.value)">
                        <option value="confirmed" ${res.status==='confirmed'?'selected':''}>Confirmed</option>
                        <option value="waitlist" ${res.status==='waitlist'?'selected':''}>Waitlist</option>
                        <option value="cancelled" ${res.status==='cancelled'?'selected':''}>Cancelled</option>
                        <option value="completed" ${res.status==='completed'?'selected':''}>Completed</option>
                    </select>
                </td>
                <td><button class="btn-delete" data-id="${res.id}">Hapus</button></td>
            `;
            tbody.appendChild(baris);
        });

        registryList.appendChild(table);

        // Pasang fungsi hapus permanen
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                reservations = reservations.filter(r => r.id !== id);
                simpanData();
                filterItems();
                updateCount();

                // MUNCULKAN NOTIFIKASI HAPUS
                notification.classList.add('show');
                
                document.querySelector('.notification-box h3').textContent = 'Reservasi Dihapus!';
                document.querySelector('.notification-box p').textContent = 'Data reservasi sudah dihapus dari daftar.';
                setTimeout(() => notification.classList.remove('show'), 2500);
                
                setTimeout(() => {
                    document.querySelector('.notification-box h3').textContent = 'Reservasi Berhasil!';
                    document.querySelector('.notification-box p').textContent = 'Data telah ditambahkan ke daftar.';
                }, 3000);
            });
        });
    }

    // Ubah status reservasi
    window.ubahStatus = function(id, statusBaru) {
        const idx = reservations.findIndex(r => r.id === id);
        if (idx !== -1) {
            reservations[idx].status = statusBaru;
            simpanData();
            filterItems();
            updateCount();
        }
    };

    // jumlah di tombol filter
    function updateCount() {
        const all = reservations.length;
        const confirmed = reservations.filter(r => r.status==='confirmed').length;
        const waitlist = reservations.filter(r => r.status==='waitlist').length;
        const cancelled = reservations.filter(r => r.status==='cancelled').length;
        const completed = reservations.filter(r => r.status==='completed').length;

        const setCount = (sel, val) => {
            const el = document.querySelector(sel);
            if (el) el.textContent = `(${val})`;
        };
        setCount('[data-filter="all"] span', all);
        setCount('[data-filter="confirmed"] span', confirmed);
        setCount('[data-filter="waitlist"] span', waitlist);
        setCount('[data-filter="cancelled"] span', cancelled);
        setCount('[data-filter="completed"] span', completed);
    }

    filterItems();
    updateCount();

    // ==========================================
    // BAGIAN 3: KLAIM VOUCHER 
    // ==========================================
    const claimBtn = document.getElementById('claimBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', e => {
            e.preventDefault();
            alert("Klaim Berhasil! 🎉\n\nVoucher diskon Anda sudah aktif.\nSilakan simpan atau tangkap layar pesan ini, lalu tunjukkan langsung di kasir saat berkunjung ke The Thirty-Six Cafe ya!");
        });
    }

    // ==========================================
    // BAGIAN 4: FILTER MENU
    // ==========================================
    const tabBtnsMenu = document.querySelectorAll('.tab-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    if (tabBtnsMenu.length > 0 && menuItems.length > 0) {
        tabBtnsMenu.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtnsMenu.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                menuItems.forEach(item => {
                    item.style.display = (filter === 'all' || item.dataset.category === filter) ? 'block' : 'none';
                });
            });
        });
    }

});