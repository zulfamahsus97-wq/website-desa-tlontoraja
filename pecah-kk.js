
import { supabase } from './supabase.js';


const form = document.getElementById('formPecahKK');

if (!form) {
  console.error('Formulir Pecah KK tidak ditemukan.');
} else {
  console.log('Formulir Pecah KK berhasil ditemukan.');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nama = document.getElementById('nama').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const dokumenInput = document.getElementById('dokumen');
    const persetujuan = document.getElementById('persetujuan');

    const files = Array.from(dokumenInput.files);

    if (!nama || !whatsapp || !persetujuan.checked) {
      alert('Lengkapi data dan persetujuan terlebih dahulu.');
      return;
    }

    if (files.length === 0) {
      alert('Silakan unggah dokumen persyaratan.');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert('Format dokumen harus PDF, JPG, JPEG, atau PNG.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran setiap dokumen maksimal 5 MB.');
        return;
      }
    }

    const tombol = form.querySelector('button[type="submit"]');
    const teksAwal = tombol.textContent;

    tombol.disabled = true;
    tombol.textContent = 'Mengirim pengajuan...';

    const nomorRegistrasi = 'PCKK-' +
      crypto.randomUUID().replaceAll('-', '').substring(0, 10).toUpperCase();

    const daftarDokumen = [];

    try {
      // UPLOAD DOKUMEN KE SUPABASE STORAGE

      for (const file of files) {
        const ekstensi = file.name.split('.').pop().toLowerCase();

        const namaFile = `pecah-kk/${nomorRegistrasi}/${crypto.randomUUID()}.${ekstensi}`;

        const { data, error } = await supabase.storage
          .from('dokumen-pengajuan')
          .upload(namaFile, file, {
            contentType: file.type,
            upsert: false
          });

        if (error) throw error;

        daftarDokumen.push(data.path);
      }

      // SIMPAN DATA KE DATABASE

      const { error: databaseError } = await supabase
        .from('pengajuan_layanan')
        .insert({
          nomor_registrasi: nomorRegistrasi,
          nama_pemohon: nama,
          nomor_whatsapp: whatsapp,
          jenis_layanan: 'pecah_kk',
          dokumen: daftarDokumen
        });

      if (databaseError) throw databaseError;

      alert(
        'Pengajuan berhasil dikirim!\nNomor Registrasi: ' +
        nomorRegistrasi
      );

      form.reset();

    } catch (error) {
      console.error('Kesalahan pengajuan:', error);
      alert('Pengajuan gagal: ' + error.message);

    } finally {
      tombol.disabled = false;
      tombol.textContent = teksAwal;
    }
  });
}


