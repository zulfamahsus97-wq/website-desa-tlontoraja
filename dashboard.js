
import { supabase } from './supabase.js';

// =====================================
// ELEMEN HTML
// =====================================

const daftarPengajuan = document.getElementById('daftarPengajuan');
const searchPengajuan = document.getElementById('searchPengajuan');
const logoutButton = document.getElementById('logoutButton');

const totalPengajuan = document.getElementById('totalPengajuan');
const totalMenunggu = document.getElementById('totalMenunggu');
const totalDiproses = document.getElementById('totalDiproses');
const totalPerluPerbaikan = document.getElementById('totalPerluPerbaikan');
const totalSelesai = document.getElementById('totalSelesai');

const modalDetail = document.getElementById('modalDetail');
const tempatDokumen = document.getElementById('detailDokumen');
const detailDataFormulir = document.getElementById('detailDataFormulir');

const tombolSimpanStatus = document.getElementById('simpanPerubahanStatus');
const pesanUpdate = document.getElementById('pesanUpdateStatus');

let semuaPengajuan = [];
let pengajuanAktif = null;

const daftarStatus = [
    'menunggu',
    'diperiksa',
    'perlu_perbaikan',
    'selesai'
];

const labelStatus = {
    menunggu: 'Menunggu',
    diperiksa: 'Diperiksa',
    perlu_perbaikan: 'Perlu Perbaikan',
    selesai: 'Selesai'
};

// =====================================
// LABEL JENIS PELAYANAN
// =====================================

const labelLayanan = {
    pecah_kk: 'Pecah Kartu Keluarga',
    akta_kelahiran: 'Akta Kelahiran',
    akta_kematian: 'Akta Kematian',
    kia: 'Kartu Identitas Anak',
    surat_pindah: 'Surat Pindah Datang',
    perubahan_data: 'Perubahan Data Kependudukan',
    domisili: 'Surat Keterangan Domisili',
    pengantar_skck: 'Surat Pengantar SKCK',
    usaha: 'Surat Keterangan Usaha',
    sktm: 'Surat Keterangan Tidak Mampu',
    pengantar_nikah: 'Surat Pengantar Nikah',
    lainnya: 'Surat Keterangan Lainnya'
};

// =====================================
// LABEL PERTANYAAN FORMULIR
// =====================================

const labelPertanyaan = {
    namaAnak: 'Nama Lengkap Anak',
    tanggalLahir: 'Tanggal Lahir',
    namaAyah: 'Nama Ayah',
    namaIbu: 'Nama Ibu',
    namaAlmarhum: 'Nama Orang yang Meninggal',
    tanggalMeninggal: 'Tanggal Meninggal',
    namaPelapor: 'Nama Pelapor',
    namaOrangTua: 'Nama Orang Tua',
    alamatAsal: 'Alamat Asal',
    alamatTujuan: 'Alamat Tujuan',
    alasanPindah: 'Alasan Pindah',
    dataLama: 'Data Lama',
    dataBaru: 'Data yang Benar',
    alasanPerubahan: 'Alasan Perubahan',
    alamat: 'Alamat Tempat Tinggal',
    lamaTinggal: 'Lama Tinggal',
    keperluan: 'Keperluan Surat',
    namaUsaha: 'Nama Usaha',
    jenisUsaha: 'Jenis Usaha',
    alamatUsaha: 'Alamat Usaha',
    pekerjaan: 'Pekerjaan',
    namaPasangan: 'Nama Calon Pasangan',
    tanggalRencana: 'Tanggal Rencana Pernikahan',
    jenisSurat: 'Jenis Surat yang Dibutuhkan'
};


// =====================================
// PESAN TABEL
// =====================================

function tampilkanPesan(pesan) {
    daftarPengajuan.replaceChildren();

    const baris = document.createElement('tr');
    const kolom = document.createElement('td');

    kolom.colSpan = 8;
    kolom.textContent = pesan;

    baris.appendChild(kolom);
    daftarPengajuan.appendChild(baris);
}


// =====================================
// FORMAT STATUS DAN LAYANAN
// =====================================

function tampilkanLabelStatus(status) {
    return labelStatus[status] || status || '-';
}

function tampilkanLabelLayanan(kode) {
    return labelLayanan[kode] || kode || '-';
}


// =====================================
// FORMAT LABEL PERTANYAAN
// =====================================

function formatLabelPertanyaan(kunci) {
    if (labelPertanyaan[kunci]) {
        return labelPertanyaan[kunci];
    }

    return String(kunci)
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, huruf => huruf.toUpperCase());
}


// =====================================
// FORMAT NILAI JAWABAN
// =====================================

function formatNilai(nilai) {
    if (nilai === null || nilai === undefined || nilai === '') {
        return '-';
    }

    if (Array.isArray(nilai)) {
        return nilai.join(', ');
    }

    if (typeof nilai === 'object') {
        return JSON.stringify(nilai);
    }

    return String(nilai);
}


// =====================================
// TAMPILKAN JAWABAN FORMULIR DINAMIS
// =====================================

function tampilkanDataFormulir(data) {
    detailDataFormulir.replaceChildren();

    if (
        !data ||
        typeof data !== 'object' ||
        Array.isArray(data) ||
        Object.keys(data).length === 0
    ) {
        detailDataFormulir.textContent =
            'Tidak ada informasi tambahan pada formulir ini.';
        return;
    }

    const daftarJawaban = document.createElement('div');
    daftarJawaban.className = 'daftar-jawaban-formulir';

    Object.entries(data).forEach(([kunci, nilai]) => {
        const item = document.createElement('div');
        item.className = 'detail-item';

        const label = document.createElement('strong');
        label.textContent = formatLabelPertanyaan(kunci);

        const jawaban = document.createElement('p');
        jawaban.textContent = formatNilai(nilai);

        item.appendChild(label);
        item.appendChild(jawaban);

        daftarJawaban.appendChild(item);
    });

    detailDataFormulir.appendChild(daftarJawaban);
}


// =====================================
// PERIKSA LOGIN DAN HAK AKSES ADMIN
// =====================================

async function periksaAdmin() {
    const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    const session = sessionData.session;

    if (!session) {
        window.location.replace('admin.html');
        return false;
    }

    const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

    if (adminError) throw adminError;

    if (!admin) {
        await supabase.auth.signOut();
        window.location.replace('admin.html');
        return false;
    }

    return true;
}


// =====================================
// AMBIL DATA PENGAJUAN DARI SUPABASE
// =====================================

async function ambilPengajuan() {
    tampilkanPesan('Memuat data pengajuan...');

    const { data, error } = await supabase
        .from('pengajuan_layanan')
        .select(`
            id,
            nomor_registrasi,
            nama_pemohon,
            nomor_whatsapp,
            jenis_layanan,
            status,
            dokumen,
            data_formulir,
            catatan_admin,
            created_at,
            updated_at
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    semuaPengajuan = data || [];

    hitungStatistik();
    tampilkanPengajuan(semuaPengajuan);
}


// =====================================
// HITUNG STATISTIK
// =====================================

function hitungStatistik() {
    totalPengajuan.textContent = semuaPengajuan.length;

    totalMenunggu.textContent =
        semuaPengajuan.filter(item => item.status === 'menunggu').length;

    totalDiproses.textContent =
        semuaPengajuan.filter(item => item.status === 'diperiksa').length;

    totalPerluPerbaikan.textContent =
        semuaPengajuan.filter(item => item.status === 'perlu_perbaikan').length;

    totalSelesai.textContent =
        semuaPengajuan.filter(item => item.status === 'selesai').length;
}


// =====================================
// MEMBUAT KOLOM TABEL
// =====================================

function buatKolom(nilai) {
    const kolom = document.createElement('td');

    kolom.textContent =
        nilai === null || nilai === undefined || nilai === ''
            ? '-'
            : String(nilai);

    return kolom;
}


// =====================================
// MENAMPILKAN DAFTAR PENGAJUAN
// =====================================

function tampilkanPengajuan(data) {
    daftarPengajuan.replaceChildren();

    if (data.length === 0) {
        tampilkanPesan('Belum ada pengajuan layanan.');
        return;
    }

    data.forEach((item, index) => {
        const baris = document.createElement('tr');

        const tanggal = item.created_at
            ? new Date(item.created_at).toLocaleDateString('id-ID')
            : '-';

        const dataBaris = [
            index + 1,
            item.nomor_registrasi,
            item.nama_pemohon,
            item.nomor_whatsapp,
            tampilkanLabelLayanan(item.jenis_layanan),
            tampilkanLabelStatus(item.status),
            tanggal
        ];

        dataBaris.forEach(nilai => {
            baris.appendChild(buatKolom(nilai));
        });

        const kolomAksi = document.createElement('td');
        const tombolDetail = document.createElement('button');

        tombolDetail.textContent = 'Detail';
        tombolDetail.type = 'button';

        tombolDetail.addEventListener('click', () => {
            bukaDetailPengajuan(item);
        });

        kolomAksi.appendChild(tombolDetail);
        baris.appendChild(kolomAksi);

        daftarPengajuan.appendChild(baris);
    });
}


// =====================================
// PENCARIAN PENGAJUAN
// =====================================

searchPengajuan.addEventListener('input', () => {
    const kataKunci = searchPengajuan.value.toLowerCase().trim();

    const hasilPencarian = semuaPengajuan.filter(item => {
        return [
            item.nomor_registrasi,
            item.nama_pemohon,
            item.nomor_whatsapp,
            item.jenis_layanan
        ].some(nilai =>
            String(nilai || '').toLowerCase().includes(kataKunci)
        );
    });

    tampilkanPengajuan(hasilPencarian);
});


// =====================================
// LOGOUT ADMIN
// =====================================

logoutButton.addEventListener('click', async () => {
    const konfirmasi = confirm(
        'Apakah kamu yakin ingin keluar dari Dashboard Admin?'
    );

    if (!konfirmasi) return;

    logoutButton.disabled = true;

    const { error } = await supabase.auth.signOut();

    if (error) {
        alert('Gagal logout: ' + error.message);
        logoutButton.disabled = false;
        return;
    }

    window.location.replace('admin.html');
});


// =====================================
// BUKA DETAIL PENGAJUAN
// =====================================

async function bukaDetailPengajuan(item) {
    pengajuanAktif = item;

    modalDetail.style.display = 'flex';

    document.getElementById('detailRegistrasi').textContent =
        item.nomor_registrasi || '-';

    document.getElementById('detailNama').textContent =
        item.nama_pemohon || '-';

    document.getElementById('detailWhatsapp').textContent =
        item.nomor_whatsapp || '-';

    document.getElementById('detailLayanan').textContent =
        tampilkanLabelLayanan(item.jenis_layanan);

    document.getElementById('detailStatus').textContent =
        tampilkanLabelStatus(item.status);

    document.getElementById('detailTanggal').textContent =
        item.created_at
            ? new Date(item.created_at).toLocaleString('id-ID')
            : '-';

    document.getElementById('statusBaru').value =
        daftarStatus.includes(item.status) ? item.status : 'menunggu';

    document.getElementById('catatanAdmin').value =
        item.catatan_admin || '';

    pesanUpdate.textContent = '';

    // TAMPILKAN JAWABAN FORMULIR
    tampilkanDataFormulir(item.data_formulir);

    // TAMPILKAN DOKUMEN
    tempatDokumen.replaceChildren();

    const daftarDokumen = Array.isArray(item.dokumen)
        ? item.dokumen
        : [];

    if (daftarDokumen.length === 0) {
        tempatDokumen.textContent = 'Tidak ada dokumen.';
        return;
    }

    const pesanMemuat = document.createElement('p');
    pesanMemuat.textContent = 'Memuat dokumen...';

    tempatDokumen.appendChild(pesanMemuat);

    let jumlahBerhasil = 0;

    for (const path of daftarDokumen) {
        const { data, error } = await supabase.storage
            .from('dokumen-pengajuan')
            .createSignedUrl(path, 60);

        if (error) {
            console.error('Gagal membuat URL dokumen:', error);
            continue;
        }

        const link = document.createElement('a');

        link.href = data.signedUrl;
        link.textContent = 'Lihat / Unduh Dokumen';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const pembungkus = document.createElement('p');
        pembungkus.appendChild(link);

        tempatDokumen.appendChild(pembungkus);

        jumlahBerhasil++;
    }

    pesanMemuat.remove();

    if (jumlahBerhasil === 0) {
        tempatDokumen.textContent =
            'Dokumen tidak dapat diakses. Periksa izin Storage dan lokasi file.';
    }
}


// =====================================
// TUTUP DETAIL PENGAJUAN
// =====================================

function tutupDetailPengajuan() {
    modalDetail.style.display = 'none';
    pengajuanAktif = null;
}

document.getElementById('tutupModal')
    .addEventListener('click', tutupDetailPengajuan);

document.getElementById('tutupModalBawah')
    .addEventListener('click', tutupDetailPengajuan);

modalDetail.addEventListener('click', event => {
    if (event.target === modalDetail) {
        tutupDetailPengajuan();
    }
});


// =====================================
// SIMPAN PERUBAHAN STATUS
// =====================================

tombolSimpanStatus.addEventListener('click', async () => {
    if (!pengajuanAktif) {
        alert('Data pengajuan tidak ditemukan.');
        return;
    }

    const statusBaru =
        document.getElementById('statusBaru').value;

    const catatanAdmin =
        document.getElementById('catatanAdmin').value.trim();

    if (!daftarStatus.includes(statusBaru)) {
        pesanUpdate.textContent = 'Status pengajuan tidak valid.';
        pesanUpdate.style.color = 'red';
        return;
    }

    tombolSimpanStatus.disabled = true;
    tombolSimpanStatus.textContent = 'Menyimpan...';
    pesanUpdate.textContent = '';

    try {
        const { data, error } = await supabase
            .from('pengajuan_layanan')
            .update({
                status: statusBaru,
                catatan_admin: catatanAdmin,
                updated_at: new Date().toISOString()
            })
            .eq('id', pengajuanAktif.id)
            .select()
            .single();

        if (error) throw error;

        pengajuanAktif = data;

        semuaPengajuan = semuaPengajuan.map(item =>
            item.id === data.id ? data : item
        );

        hitungStatistik();

        const kataKunci = searchPengajuan.value.toLowerCase().trim();

        const dataTampil = semuaPengajuan.filter(item => {
            return [
                item.nomor_registrasi,
                item.nama_pemohon,
                item.nomor_whatsapp,
                item.jenis_layanan
            ].some(nilai =>
                String(nilai || '').toLowerCase().includes(kataKunci)
            );
        });

        tampilkanPengajuan(dataTampil);

        document.getElementById('detailStatus').textContent =
            tampilkanLabelStatus(data.status);

        pesanUpdate.textContent = 'Perubahan berhasil disimpan!';
        pesanUpdate.style.color = 'green';

        console.log('Status berhasil diperbarui:', data);

    } catch (error) {
        console.error('Gagal memperbarui status:', error);

        pesanUpdate.textContent =
            'Gagal menyimpan perubahan: ' + error.message;

        pesanUpdate.style.color = 'red';

    } finally {
        tombolSimpanStatus.disabled = false;
        tombolSimpanStatus.textContent = 'Simpan Perubahan';
    }
});


// =====================================
// JALANKAN DASHBOARD
// =====================================

async function jalankanDashboard() {
    try {
        const bolehMasuk = await periksaAdmin();

        if (!bolehMasuk) return;

        await ambilPengajuan();

        console.log('Dashboard Admin berhasil dimuat.');

    } catch (error) {
        console.error('Kesalahan Dashboard:', error);

        tampilkanPesan(
            'Gagal memuat data: ' + error.message
        );
    }
}

jalankanDashboard();
