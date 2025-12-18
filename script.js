
/**
 * SCF Music - Core JS
 * Senior Implementation - Fixes: ReferenceError: router is not defined
 */

const SCF = {
    state: {
        user: null,
        isLoggedIn: false
    },

    // 1. Navigation Logic (Router)
    navigate: (viewId) => {
        console.log(`Navigating to: ${viewId}`);
        
        // Tüm görünümleri gizle
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden', 'active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        // Hedef görünümü bul ve göster
        const target = document.getElementById(`view-${viewId}`);
        if (target) {
            target.classList.remove('hidden');
            setTimeout(() => target.classList.add('active'), 10);
        }

        // Layout düzenlemeleri
        const nav = document.getElementById('main-nav');
        const footer = document.getElementById('main-footer');
        
        if (viewId === 'dashboard') {
            nav?.classList.add('hidden');
            footer?.classList.add('hidden');
        } else {
            nav?.classList.remove('hidden');
            footer?.classList.remove('hidden');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // 2. Auth Logic
    auth: {
        login: (email) => {
            SCF.state.user = { name: email.split('@')[0], email };
            localStorage.setItem('scf_session', JSON.stringify(SCF.state.user));
            SCF.ui.updateDashboard();
            SCF.navigate('dashboard');
        },
        logout: () => {
            localStorage.removeItem('scf_session');
            location.reload();
        },
        checkSession: () => {
            const saved = localStorage.getItem('scf_session');
            if (saved) {
                SCF.state.user = JSON.parse(saved);
                SCF.ui.updateDashboard();
                SCF.navigate('dashboard');
            }
        }
    },

    // 3. UI Interactions
    ui: {
        init: () => {
            // Loader'ı kaldır
            setTimeout(() => {
                document.getElementById('app-loader')?.classList.add('opacity-0');
                setTimeout(() => document.getElementById('app-loader')?.remove(), 500);
            }, 800);

            // Tüm 'data-navigate' butonlarına olay dinleyici ekle
            document.querySelectorAll('[data-navigate]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const view = e.currentTarget.getAttribute('data-navigate');
                    if (view) SCF.navigate(view);
                });
            });

            // Home logoları
            document.querySelectorAll('.link-home').forEach(el => {
                el.addEventListener('click', () => SCF.navigate('landing'));
            });

            // Formlar
            document.getElementById('form-login')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                SCF.auth.login(email);
            });

            document.getElementById('form-register')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = e.target.querySelector('input[type="email"]').value;
                SCF.auth.login(email);
            });

            // Logout
            document.getElementById('btn-logout')?.addEventListener('click', SCF.auth.logout);
        },

        updateDashboard: () => {
            const el = document.getElementById('user-display-name');
            if (el && SCF.state.user) el.innerText = SCF.state.user.name;
        }
    }
};

// Başlatıcı
document.addEventListener('DOMContentLoaded', () => {
    SCF.ui.init();
    SCF.auth.checkSession();
});

// Window objesine aktararak dışarıdan erişimi (eğer gerekirse) garanti et
window.router = { navigate: SCF.navigate };
