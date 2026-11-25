
import { supabase } from './supabase.js';

const form = document.getElementById('resetPasswordForm');
const message = document.getElementById('resetMessage');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password.length < 12) {
        message.textContent = 'Password minimal 12 karakter.';
        message.style.color = 'red';
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = 'Password tidak sama.';
        message.style.color = 'red';
        return;
    }

    try {
        const { data: sessionData } =
            await supabase.auth.getSession();

        if (!sessionData.session) {
            throw new Error(
                'Sesi pemulihan tidak ditemukan atau sudah kedaluwarsa. Silakan minta email reset baru.'
            );
        }

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) throw error;

        message.textContent =
            'Password berhasil diperbarui! Silakan login kembali.';

        message.style.color = 'green';

        await supabase.auth.signOut();

        form.reset();

    } catch (error) {
        console.error('Reset password gagal:', error);

        message.textContent = error.message;
        message.style.color = 'red';
    }
});
