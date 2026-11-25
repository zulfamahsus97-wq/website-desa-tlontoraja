
import { supabase } from './supabase.js';

const form = document.getElementById('formLacak');
const tombol = document.getElementById('tombolLacak');
const hasil = document.getElementById('hasilPelacakan');

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

const labelStatus = {
    menunggu: 'Menunggu',
    diperiksa: 'Diperiksa',
    perlu_perbaikan: 'Perlu Perbaikan',
    selesai: 'Selesai'
};

function buatElemen(tag, teks) {
    const elemen = document.createElement(tag);
    elemen.textContent = teks;
    return elemen;
}

function tampilkanHasil(data) {
    hasil.replaceChildren();

    const kartu = document.createElement('div');
    kartu.className = 'hasil-card';

    kartu.appendChild(
        buatElemen('h3', 'Informasi Pengajuan')
    );

    const layanan =
        labelLayanan[data.jenis_layanan] ||
        data.jenis_layanan;

    const status =
        labelStatus[data.status] ||
        data.status;

    const tanggal = data.created_at
        ? new Date(data.created_at).toLocaleString('id-ID')
        : '-';

    kartu.appendChild(
        buatElemen('p', 'Nomor Registrasi: ' + data.nomor_registrasi)
    );

    kartu.appendChild(
        buatElemen('p', 'Jenis Pelayanan: ' + layanan)
    );

    const paragrafStatus = document.createElement('p');
    paragrafStatus.appendChild(
        buatElemen('strong', 'Status Pengajuan: ')
    );

    const badgeStatus = buatElemen('span', status);
    badgeStatus.className = 'status-hasil';

    paragrafStatus.appendChild(badgeStatus);
    kartu.appendChild(paragrafStatus);

    kartu.appendChild(
        buatElemen('p', 'Tanggal Pengajuan: ' + tanggal)
    );

    hasil.appendChild(kartu);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nomorRegistrasi = document
        .getElementById('nomorRegistrasi')
        .value.trim();

    const nomorWhatsapp = document
        .getElementById('nomorWhatsapp')
        .value.trim();

    hasil.replaceChildren();

    tombol.disabled = true;
    tombol.textContent = 'Memeriksa...';

    try {
        const { data, error } = await supabase.rpc(
            'lacak_pengajuan',
            {
                p_nomor_registrasi: nomorRegistrasi,
                p_nomor_whatsapp: nomorWhatsapp
            }
        );

        if (error) throw error;

        if (!data || data.length === 0) {
            hasil.appendChild(
                buatElemen(
                    'p',
                    'Pengajuan tidak ditemukan. Periksa kembali nomor registrasi dan WhatsApp Anda.'
                )
            );

            hasil.firstChild.className = 'pesan-error';
            return;
        }

        tampilkanHasil(data[0]);

    } catch (error) {
        console.error('Kesalahan pelacakan:', error);

        const pesan = buatElemen(
            'p',
            'Terjadi kesalahan saat memeriksa pengajuan: ' +
            error.message
        );

        pesan.className = 'pesan-error';
        hasil.appendChild(pesan);

    } finally {
        tombol.disabled = false;
        tombol.textContent = 'Lacak Pengajuan';
    }
});

console.log('Halaman pelacakan pengajuan berhasil dimuat.');
