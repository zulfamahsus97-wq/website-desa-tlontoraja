
import { supabase } from './supabase.js';

const form = document.getElementById('adminLoginForm');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    loginButton.disabled = true;
    loginButton.textContent = 'Memeriksa akun...';
    loginMessage.textContent = '';

    try {
        // LOGIN KE SUPABASE
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        // PERIKSA HAK AKSES ADMIN
        const { data: admin, error: adminError } = await supabase
            .from('admin_users')
            .select('user_id')
            .eq('user_id', data.user.id)
            .maybeSingle();

        if (adminError) throw adminError;

        if (!admin) {
            await supabase.auth.signOut();
            throw new Error('Akun ini tidak memiliki akses admin.');
        }

        loginMessage.textContent =
            'Login berhasil! Hak akses admin terverifikasi.';

        loginMessage.style.color = 'green';

        console.log('Admin berhasil login:', data.user.email);
        // ARAHKAN KE DASHBOARD ADMIN
window.location.replace('dashboard.html');

    } catch (error) {
        console.error('Login gagal:', error);

        loginMessage.textContent = error.message;
        loginMessage.style.color = 'red';

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Masuk ke Dashboard';
    }
});

const forgotPasswordButton = document.getElementById('forgotPasswordButton');

forgotPasswordButton.addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value.trim();

    if (!email) {
        loginMessage.textContent = 'Masukkan email admin terlebih dahulu.';
        loginMessage.style.color = 'red';
        return;
    }

    forgotPasswordButton.disabled = true;
    forgotPasswordButton.textContent = 'Mengirim email...';

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:5173/reset-password.html'
        });

        if (error) throw error;

        loginMessage.textContent =
            'Email pemulihan berhasil dikirim. Periksa Gmail Anda.';

        loginMessage.style.color = 'green';

    } catch (error) {
        console.error('Pemulihan password gagal:', error);

        loginMessage.textContent = error.message;
        loginMessage.style.color = 'red';

    } finally {
        forgotPasswordButton.disabled = false;
        forgotPasswordButton.textContent = 'Lupa Password?';
    }
});
