
import { supabase } from './supabase.js';

// =====================================
// ELEMEN HTML
// =====================================

const jenisLayanan = document.getElementById('jenisLayanan');
const kolomDinamis = document.getElementById('kolomDinamis');

const judulFormulir = document.getElementById('judulFormulir');
const deskripsiFormulir = document.getElementById('deskripsiFormulir');

const formPelayanan = document.getElementById('formPelayanan');
const tombolKirim = formPelayanan.querySelector('button[type="submit"]');

const pesanFormulir = document.getElementById('pesanFormulir');


// =====================================
// KONFIGURASI JENIS PELAYANAN
// =====================================

const konfigurasiLayanan = {

    domisili: {
        judul: 'Surat Keterangan Domisili',
        prefix: 'SKD',
        pertanyaan: [
            { id: 'alamat', label: 'Alamat Tempat Tinggal' },
            { id: 'lamaTinggal', label: 'Lama Tinggal' },
            { id: 'keperluan', label: 'Keperluan Surat' }
        ]
    },

    pengantar_skck: {
        judul: 'Surat Pengantar SKCK',
        prefix: 'SKCK',
        pertanyaan: [
            { id: 'alamat', label: 'Alamat Lengkap' },
            { id: 'keperluan', label: 'Keperluan Pembuatan SKCK' }
        ]
    },

    usaha: {
        judul: 'Surat Keterangan Usaha',
        prefix: 'SKU',
        pertanyaan: [
            { id: 'namaUsaha', label: 'Nama Usaha' },
            { id: 'jenisUsaha', label: 'Jenis Usaha' },
            { id: 'alamatUsaha', label: 'Alamat Usaha' }
        ]
    },

    sktm: {
        judul: 'Surat Keterangan Tidak Mampu',
        prefix: 'SKTM',
        pertanyaan: [
            { id: 'alamat', label: 'Alamat Tempat Tinggal' },
            { id: 'pekerjaan', label: 'Pekerjaan' },
            { id: 'keperluan', label: 'Keperluan SKTM' }
        ]
    },

    pengantar_nikah: {
        judul: 'Surat Pengantar Nikah',
        prefix: 'SPN',
        pertanyaan: [
            { id: 'namaPasangan', label: 'Nama Calon Pasangan' },
            {
                id: 'tanggalRencana',
                label: 'Tanggal Rencana Pernikahan',
                type: 'date'
            },
            { id: 'alamat', label: 'Alamat Lengkap' }
        ]
    },

    pembuatan_kk: {
        judul: 'Pengajuan Pembuatan Kartu Keluarga',
        prefix: 'KK',
        pertanyaan: []
    },

    akta_kelahiran: {
        judul: 'Pengajuan Akta Kelahiran',
        prefix: 'AKL',
        pertanyaan: [
            { id: 'namaAnak', label: 'Nama Lengkap Anak' },
            {
                id: 'tanggalLahir',
                label: 'Tanggal Lahir',
                type: 'date'
            },
            { id: 'namaAyah', label: 'Nama Ayah' },
            { id: 'namaIbu', label: 'Nama Ibu' }
        ]
    },

    akta_kematian: {
        judul: 'Pengajuan Akta Kematian',
        prefix: 'AKM',
        pertanyaan: [
            { id: 'namaAlmarhum', label: 'Nama Orang yang Meninggal' },
            {
                id: 'tanggalMeninggal',
                label: 'Tanggal Meninggal',
                type: 'date'
            },
            { id: 'namaPelapor', label: 'Nama Pelapor' }
        ]
    },

    surat_pindah: {
        judul: 'Pengajuan Pindah Datang Penduduk',
        prefix: 'SPD',
        pertanyaan: [
            { id: 'alamatAsal', label: 'Alamat Asal' },
            { id: 'alamatTujuan', label: 'Alamat Tujuan Lengkap' },
            { id: 'alasanPindah', label: 'Alasan Pindah' }
        ]
    },

    perubahan_data: {
        judul: 'Perubahan Data Kependudukan',
        prefix: 'PDK',
        pertanyaan: [
            { id: 'dataLama', label: 'Data Lama' },
            { id: 'dataBaru', label: 'Data yang Benar' },
            { id: 'alasanPerubahan', label: 'Alasan Perubahan' }
        ]
    },

    lainnya: {
        judul: 'Surat Keterangan Lainnya',
        prefix: 'SKL',
        pertanyaan: [
            { id: 'jenisSurat', label: 'Jenis Surat yang Dibutuhkan' },
            { id: 'keperluan', label: 'Keperluan Surat' }
        ]
    }

};


// =====================================
// NOMOR REGISTRASI
// =====================================

function buatNomorRegistrasi(prefix) {
    const kodeAcak = crypto.randomUUID()
        .replaceAll('-', '')
        .substring(0, 10)
        .toUpperCase();

    return `${prefix}-${kodeAcak}`;
}


// =====================================
// MEMBUAT PERTANYAAN DINAMIS
// =====================================

function buatPertanyaan(pertanyaan) {
    const pembungkus = document.createElement('div');
    pembungkus.className = 'form-group';

    const label = document.createElement('label');
    label.htmlFor = pertanyaan.id;
    label.textContent = pertanyaan.label;

    const input = document.createElement('input');
    input.type = pertanyaan.type || 'text';
    input.id = pertanyaan.id;
    input.name = pertanyaan.id;
    input.required = true;

    if (input.type !== 'date') {
        input.placeholder =
            'Masukkan ' + pertanyaan.label.toLowerCase();
    }

    pembungkus.append(label, input);

    return pembungkus;
}


// =====================================
// GANTI PERTANYAAN SESUAI PELAYANAN
// =====================================

function tampilkanFormulir() {
    const layanan = konfigurasiLayanan[jenisLayanan.value];

    kolomDinamis.replaceChildren();
    pesanFormulir.textContent = '';

    if (!layanan) {
        judulFormulir.textContent = 'Formulir Pengajuan';

        deskripsiFormulir.textContent =
            'Pilih jenis pelayanan untuk memulai pengajuan.';

        return;
    }

    judulFormulir.textContent = layanan.judul;

    deskripsiFormulir.textContent =
        layanan.pertanyaan.length > 0
            ? 'Lengkapi informasi sesuai jenis pelayanan yang dipilih.'
            : 'Lengkapi identitas dan unggah dokumen persyaratan pelayanan.';

    layanan.pertanyaan.forEach(pertanyaan => {
        kolomDinamis.appendChild(
            buatPertanyaan(pertanyaan)
        );
    });
}

jenisLayanan.addEventListener('change', tampilkanFormulir);


// =====================================
// PILIH LAYANAN OTOMATIS DARI URL
// =====================================

const parameterURL = new URLSearchParams(window.location.search);
const layananDariURL = parameterURL.get('layanan');

if (
    layananDariURL &&
    Object.prototype.hasOwnProperty.call(
        konfigurasiLayanan,
        layananDariURL
    )
) {
    jenisLayanan.value = layananDariURL;
    tampilkanFormulir();
}


// =====================================
// VALIDASI DOKUMEN
// =====================================

function validasiDokumen(files) {
    if (files.length === 0) {
        throw new Error('Silakan unggah dokumen persyaratan.');
    }

    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png'
    ];

    for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                'Format dokumen harus PDF, JPG, JPEG, atau PNG.'
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error(
                `Ukuran file ${file.name} melebihi 5 MB.`
            );
        }
    }
}


// =====================================
// KIRIM PENGAJUAN
// =====================================

formPelayanan.addEventListener('submit', async event => {
    event.preventDefault();

    pesanFormulir.textContent = '';

    const kodeLayanan = jenisLayanan.value;
    const layanan = konfigurasiLayanan[kodeLayanan];

    if (!layanan) {
        pesanFormulir.textContent =
            'Silakan pilih jenis pelayanan terlebih dahulu.';
        return;
    }

    const nama = document.getElementById('namaPemohon')
        .value.trim();

    const whatsapp = document.getElementById('nomorWhatsapp')
        .value.trim();

    const dokumenInput =
        document.getElementById('dokumenPelayanan');

    const persetujuan =
        document.getElementById('persetujuan');

    const files = Array.from(dokumenInput.files);

    if (!nama || !whatsapp || !persetujuan.checked) {
        pesanFormulir.textContent =
            'Lengkapi identitas dan persetujuan terlebih dahulu.';
        return;
    }

    try {
        validasiDokumen(files);
    } catch (error) {
        pesanFormulir.textContent = error.message;
        return;
    }

    // KUMPULKAN JAWABAN FORMULIR

    const dataFormulir = {};

    const inputDinamis =
        kolomDinamis.querySelectorAll('input');

    for (const input of inputDinamis) {
        dataFormulir[input.name] = input.value.trim();
    }

    const nomorRegistrasi =
        buatNomorRegistrasi(layanan.prefix);

    const daftarDokumen = [];

    let tahapPengiriman = 'Persiapan pengajuan';

    tombolKirim.disabled = true;
    tombolKirim.textContent = 'Mengirim pengajuan...';

    try {

        // =================================
        // TAHAP 1: UPLOAD DOKUMEN
        // =================================

        tahapPengiriman = 'Upload dokumen ke Storage';

        for (const file of files) {
            const ekstensi = file.name
                .split('.')
                .pop()
                .toLowerCase();

            const namaFile =
                `${kodeLayanan}/${nomorRegistrasi}/` +
                `${crypto.randomUUID()}.${ekstensi}`;

            const { data, error } = await supabase.storage
                .from('dokumen-pengajuan')
                .upload(namaFile, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (error) throw error;

            daftarDokumen.push(data.path);
        }

        // =================================
        // TAHAP 2: SIMPAN DATABASE
        // =================================

        tahapPengiriman =
            'Menyimpan data ke tabel pengajuan_layanan';

        const { data, error } = await supabase
            .from('pengajuan_layanan')
            .insert({
                nomor_registrasi: nomorRegistrasi,
                nama_pemohon: nama,
                nomor_whatsapp: whatsapp,
                jenis_layanan: kodeLayanan,
                dokumen: daftarDokumen,
                data_formulir: dataFormulir
            })
            .select('nomor_registrasi')
            .single();

        if (error) throw error;

        // =================================
        // TAHAP 3: BERHASIL
        // =================================

        pesanFormulir.style.color = 'green';

        pesanFormulir.textContent =
            'Pengajuan berhasil dikirim! Nomor registrasi: ' +
            data.nomor_registrasi;

        alert(
            'Pengajuan berhasil dikirim!\n\n' +
            'Nomor Registrasi: ' + data.nomor_registrasi +
            '\n\nSimpan nomor registrasi ini untuk melacak pengajuan.'
        );

        formPelayanan.reset();
        kolomDinamis.replaceChildren();

        judulFormulir.textContent = 'Formulir Pengajuan';

        deskripsiFormulir.textContent =
            'Pilih jenis pelayanan untuk memulai pengajuan.';

    } catch (error) {

        // =================================
        // DIAGNOSTIK KESALAHAN
        // =================================

        console.error('Tahap yang gagal:', tahapPengiriman);
        console.error('Detail kesalahan:', error);

        pesanFormulir.style.color = 'red';

        pesanFormulir.textContent =
            'Gagal pada tahap: ' + tahapPengiriman +
            '. Pesan: ' + error.message;

    } finally {

        tombolKirim.disabled = false;
        tombolKirim.textContent = 'Kirim Pengajuan';

    }
});

console.log('Mesin formulir dinamis berhasil dimuat.');
