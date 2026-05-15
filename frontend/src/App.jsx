import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:8000/api';

const navLinks = [
    { label: 'Accueil', target: 'home' },
    { label: 'Cours', target: 'courses' },
    { label: 'À propos', target: 'about' },
];

const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
    const score = [
        pwd.length >= 12,
        /[A-Z]/.test(pwd),
        /[a-z]/.test(pwd),
        /[0-9]/.test(pwd),
        /[^A-Za-z0-9]/.test(pwd),
    ].filter(Boolean).length;
    const levels = [
        { label: '', color: '#e2e8f0' },
        { label: 'Très faible', color: '#ef4444' },
        { label: 'Faible', color: '#f97316' },
        { label: 'Moyen', color: '#eab308' },
        { label: 'Fort', color: '#84cc16' },
        { label: 'Très fort', color: '#22c55e' },
    ];
    return { score, ...levels[Math.min(score, 5)] };
};

export default function App() {
    const [backendStatus, setBackendStatus] = useState(null);
    const [currentView, setCurrentView] = useState('home');
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        first_name: '', last_name: '', email: '',
        password: '', password_confirmation: '',
        role: 'Etudiant',
    });
    const [loginErrors, setLoginErrors] = useState({});
    const [registerErrors, setRegisterErrors] = useState({});
    const [loginTouched, setLoginTouched] = useState({});
    const [registerTouched, setRegisterTouched] = useState({});
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const [registerSubmitting, setRegisterSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');

    const roleOptions = [
        { value: 'Etudiant', label: 'Étudiant' },
        { value: 'Enseignant', label: 'Enseignant' },
    ];

    const getDashboardView = (role) => (role === 'Enseignant' ? 'teacherHome' : 'studentHome');

    const sanitizeInput = (value) => value.replace(/[<>"'\/]/g, '').trim();

    const showMessage = (text, type = 'error') => {
        setMessage(text);
        setMessageType(type);
    };

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const validateName = (value) => /^[A-Za-zÀ-ÿ '-]{2,}$/.test(value.trim());

    const validateLogin = () => {
        const errors = {};
        if (!validateEmail(loginData.email)) errors.email = 'Adresse email invalide.';
        if (loginData.password.length < 12) errors.password = 'Minimum 12 caractères requis.';
        return errors;
    };

    const validateRegister = () => {
        const errors = {};
        if (!validateName(registerData.first_name)) errors.first_name = 'Prénom invalide (min. 2 lettres).';
        if (!validateName(registerData.last_name)) errors.last_name = 'Nom invalide (min. 2 lettres).';
        if (!validateEmail(registerData.email)) errors.email = 'Adresse email invalide.';
        if (registerData.password.length < 12) errors.password = 'Minimum 12 caractères requis.';
        if (registerData.password !== registerData.password_confirmation) errors.password_confirmation = 'Les mots de passe ne correspondent pas.';
        return errors;
    };

    const touchRegisterField = (field) => setRegisterTouched(prev => ({ ...prev, [field]: true }));
    const touchLoginField = (field) => setLoginTouched(prev => ({ ...prev, [field]: true }));

    useEffect(() => {
        fetch(`${API_BASE}/status`)
            .then(r => r.json())
            .then(d => setBackendStatus(d))
            .catch(() => setBackendStatus(null));

        fetch(`${API_BASE}/auth/me`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(r => r.json())
        .then(d => {
            if (d.user) { setUser(d.user); setCurrentView(getDashboardView(d.user.role)); }
        })
        .catch(() => { setToken(null); setUser(null); });
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoginTouched({ email: true, password: true });
        const validationErrors = validateLogin();
        setLoginErrors(validationErrors);
        if (Object.keys(validationErrors).length) return;

        setLoginSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });
            const data = await response.json();
            if (response.ok && data.user) {
                setToken(data.access_token || null);
                setUser(data.user);
                setCurrentView(getDashboardView(data.user.role));
                showMessage('Connexion réussie', 'success');
            } else {
                showMessage(data.error || data.message || 'Email ou mot de passe incorrect.');
            }
        } catch {
            showMessage('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 8000.');
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setRegisterTouched({
            first_name: true, last_name: true, email: true,
            password: true, password_confirmation: true,
        });
        const validationErrors = validateRegister();
        setRegisterErrors(validationErrors);
        if (Object.keys(validationErrors).length) return;
        setRegisterSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: registerData.first_name,
                    last_name: registerData.last_name,
                    email: registerData.email,
                    password: registerData.password,
                    password_confirmation: registerData.password_confirmation,
                    role: registerData.role,
                }),
            });
            const data = await response.json();
            if (response.ok && data.user) {
                setCurrentView('login');
                showMessage('Inscription réussie ! Connectez-vous pour accéder à vos cours.', 'success');
            } else if (data.errors) {
                const serverErrors = {};
                Object.keys(data.errors).forEach(k => {
                    serverErrors[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k];
                });
                setRegisterErrors(serverErrors);
                showMessage('Veuillez corriger les erreurs ci-dessous.');
            } else {
                showMessage(data.error || data.message || "Erreur lors de l'inscription.");
            }
        } catch {
            showMessage('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 8000.');
        } finally {
            setRegisterSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch { /* ignore */ }
        setToken(null);
        setUser(null);
        setCurrentView('home');
        showMessage('Déconnexion réussie', 'success');
    };

    const renderHeader = () => (
        <header style={headerStyle}>
            <div style={headerInnerStyle}>
                <div style={logoStyle}>
                    <span style={{ fontSize: 20 }}>📘</span>
                    <span>School-learning</span>
                </div>
                <nav style={navStyle}>
                    {navLinks.map((link) => (
                        <button key={link.target} style={navButtonStyle}
                            onClick={() => setCurrentView(user ? getDashboardView(user.role) : 'home')}>
                            {link.label}
                        </button>
                    ))}
                </nav>
                <div style={actionsStyle}>
                    {user ? (
                        <button onClick={handleLogout} style={headerButtonStyle}>Déconnexion</button>
                    ) : (
                        <>
                            <button onClick={() => { setMessage(''); setCurrentView('login'); }} style={headerButtonStyleSecondary}>Connexion</button>
                            <button onClick={() => { setMessage(''); setCurrentView('register'); }} style={headerButtonStyle}>S'inscrire</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );

    const renderHome = () => (
        <main>
            <section style={heroStyle}>
                <div style={heroContentStyle}>
                    <p style={heroIntroStyle}>Apprenez à votre rythme</p>
                    <h1 style={heroTitleStyle}>Des cours structurés pour progresser chaque jour</h1>
                    <p style={heroTextStyle}>Des cours créés par des enseignants experts. Vidéos, documents, quiz — tout en un.</p>
                    <div style={heroButtonsStyle}>
                        <button onClick={() => setCurrentView('register')} style={heroPrimaryButtonStyle}>Découvrir les cours</button>
                        <button onClick={() => setCurrentView('login')} style={heroSecondaryButtonStyle}>En savoir plus</button>
                    </div>
                </div>
            </section>
            <section style={statsSectionStyle}>
                {[['120+', 'Cours disponibles'], ['850', 'Étudiants inscrits'], ['40', 'Enseignants']].map(([v, l]) => (
                    <div key={l} style={statCardStyle}>
                        <p style={statValueStyle}>{v}</p>
                        <p style={statLabelStyle}>{l}</p>
                    </div>
                ))}
            </section>
            <section style={infoSectionStyle}>
                {[
                    ["Accès immédiat", "Entrez dans votre espace et accédez directement à vos cours depuis n'importe où."],
                    ["Apprentissage interactif", "Supports multimédias, quiz et suivi de progression pour rester motivé."],
                    ["Communauté active", "Partagez avec des enseignants et des étudiants, obtenez de l'aide en un clic."],
                ].map(([title, text]) => (
                    <div key={title} style={infoCardStyle}><h3>{title}</h3><p>{text}</p></div>
                ))}
            </section>
        </main>
    );

    const renderStudentHome = () => (
        <main>
            <section style={heroStyle}>
                <div style={heroContentStyle}>
                    <p style={heroIntroStyle}>Bienvenue étudiant</p>
                    <h1 style={heroTitleStyle}>Votre espace d'apprentissage</h1>
                    <p style={heroTextStyle}>Retrouvez vos cours, exercices et ressources adaptés à votre parcours.</p>
                    <div style={heroButtonsStyle}>
                        <button style={heroPrimaryButtonStyle}>Voir mes cours</button>
                        <button onClick={() => setCurrentView('home')} style={heroSecondaryButtonStyle}>Retour à l'accueil</button>
                    </div>
                </div>
            </section>
        </main>
    );

    const renderTeacherHome = () => (
        <main>
            <section style={heroStyle}>
                <div style={heroContentStyle}>
                    <p style={heroIntroStyle}>Bienvenue enseignant</p>
                    <h1 style={heroTitleStyle}>Votre tableau de bord pédagogique</h1>
                    <p style={heroTextStyle}>Gérez vos cours, suivez les étudiants et partagez vos contenus en quelques clics.</p>
                    <div style={heroButtonsStyle}>
                        <button style={heroPrimaryButtonStyle}>Gérer mes cours</button>
                        <button onClick={() => setCurrentView('home')} style={heroSecondaryButtonStyle}>Retour à l'accueil</button>
                    </div>
                </div>
            </section>
        </main>
    );

    // ─── LOGIN FORM ──────────────────────────────────────────────────────────────
    const renderLogin = () => {
        const inlineErrors = validateLogin();
        const fieldStatus = (field) => {
            if (!loginTouched[field]) return 'idle';
            return inlineErrors[field] ? 'error' : 'success';
        };
        const inputBorder = (field) => {
            const s = fieldStatus(field);
            if (s === 'error') return '2px solid #ef4444';
            if (s === 'success') return '2px solid #22c55e';
            return '1.5px solid #e2e8f0';
        };

        return (
            <section style={formSectionStyle}>
                <div style={authCardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                        <span style={{ fontSize: 32 }}>📘</span>
                        <div>
                            <p style={brandStyle}>School-learning</p>
                            <h2 style={cardTitleStyle}>Bon retour !</h2>
                            <p style={cardSubtitleStyle}>Connectez-vous pour accéder à vos cours.</p>
                        </div>
                    </div>

                    {message && (
                        <div style={messageType === 'success' ? successBannerStyle : errorBannerStyle}>
                            {messageType === 'error' ? '⚠ ' : '✓ '}{message}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'grid', gap: 20 }} noValidate>
                        <div>
                            <label style={fieldLabelStyle}>Adresse Email</label>
                            <div style={inputWrapperStyle}>
                                <input
                                    type="email"
                                    placeholder="vous@exemple.com"
                                    value={loginData.email}
                                    onChange={(e) => {
                                        setLoginData({ ...loginData, email: e.target.value });
                                        setLoginErrors({ ...loginErrors, email: undefined });
                                    }}
                                    onBlur={() => touchLoginField('email')}
                                    style={{ ...modernInputStyle, border: inputBorder('email') }}
                                    required
                                />
                                {fieldStatus('email') === 'success' && <span style={iconSuccess}>✓</span>}
                                {fieldStatus('email') === 'error' && <span style={iconError}>✗</span>}
                            </div>
                            {fieldStatus('email') === 'error' && (
                                <p style={inlineErrorStyle}>{inlineErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={fieldLabelStyle}>Mot de passe</label>
                                <button type="button" style={forgotLinkStyle}>Mot de passe oublié ?</button>
                            </div>
                            <div style={inputWrapperStyle}>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={loginData.password}
                                    onChange={(e) => {
                                        setLoginData({ ...loginData, password: e.target.value });
                                        setLoginErrors({ ...loginErrors, password: undefined });
                                    }}
                                    onBlur={() => touchLoginField('password')}
                                    style={{ ...modernInputStyle, border: inputBorder('password') }}
                                    required
                                />
                                {fieldStatus('password') === 'success' && <span style={iconSuccess}>✓</span>}
                                {fieldStatus('password') === 'error' && <span style={iconError}>✗</span>}
                            </div>
                            {fieldStatus('password') === 'error' && (
                                <p style={inlineErrorStyle}>{inlineErrors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loginSubmitting}
                            style={{ ...submitButtonStyle, opacity: loginSubmitting ? 0.7 : 1, cursor: loginSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                            {loginSubmitting ? '⏳ Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <div style={footerRowStyle}>
                        <span style={{ color: '#64748b', fontSize: 14 }}>Pas encore de compte ?</span>
                        <button type="button" style={footerLinkStyle} onClick={() => { setMessage(''); setCurrentView('register'); }}>
                            S'inscrire
                        </button>
                    </div>
                    <button onClick={() => setCurrentView('home')} style={backButtonStyle}>← Retour à l'accueil</button>
                </div>
            </section>
        );
    };

    // ─── REGISTER FORM ───────────────────────────────────────────────────────────
    const renderRegister = () => {
        const inlineErrors = { ...validateRegister(), ...registerErrors };
        const fieldStatus = (field) => {
            if (!registerTouched[field]) return 'idle';
            return inlineErrors[field] ? 'error' : 'success';
        };
        const inputBorder = (field) => {
            const s = fieldStatus(field);
            if (s === 'error') return '2px solid #ef4444';
            if (s === 'success') return '2px solid #22c55e';
            return '1.5px solid #e2e8f0';
        };
        const pwStrength = getPasswordStrength(registerData.password);
        const allValid = Object.keys(validateRegister()).length === 0;

        return (
            <section style={formSectionStyle}>
                <div style={{ ...authCardStyle, maxWidth: 520 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                        <span style={{ fontSize: 32 }}>📘</span>
                        <div>
                            <p style={brandStyle}>School-learning</p>
                            <h2 style={cardTitleStyle}>Rejoignez-nous</h2>
                            <p style={cardSubtitleStyle}>Créez votre compte gratuitement.</p>
                        </div>
                    </div>

                    {message && (
                        <div style={messageType === 'success' ? successBannerStyle : errorBannerStyle}>
                            {messageType === 'error' ? '⚠ ' : '✓ '}{message}
                        </div>
                    )}

                    <form onSubmit={handleRegister} style={{ display: 'grid', gap: 18 }} noValidate>

                        {/* Prénom + Nom */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={fieldLabelStyle}>Prénom</label>
                                <div style={inputWrapperStyle}>
                                    <input
                                        type="text"
                                        placeholder="Jean"
                                        value={registerData.first_name}
                                        onChange={(e) => setRegisterData({ ...registerData, first_name: sanitizeInput(e.target.value) })}
                                        onBlur={() => touchRegisterField('first_name')}
                                        style={{ ...modernInputStyle, border: inputBorder('first_name') }}
                                    />
                                    {fieldStatus('first_name') === 'success' && <span style={iconSuccess}>✓</span>}
                                    {fieldStatus('first_name') === 'error' && <span style={iconError}>✗</span>}
                                </div>
                                {fieldStatus('first_name') === 'error' && (
                                    <p style={inlineErrorStyle}>{inlineErrors.first_name}</p>
                                )}
                            </div>
                            <div>
                                <label style={fieldLabelStyle}>Nom</label>
                                <div style={inputWrapperStyle}>
                                    <input
                                        type="text"
                                        placeholder="Dupont"
                                        value={registerData.last_name}
                                        onChange={(e) => setRegisterData({ ...registerData, last_name: sanitizeInput(e.target.value) })}
                                        onBlur={() => touchRegisterField('last_name')}
                                        style={{ ...modernInputStyle, border: inputBorder('last_name') }}
                                    />
                                    {fieldStatus('last_name') === 'success' && <span style={iconSuccess}>✓</span>}
                                    {fieldStatus('last_name') === 'error' && <span style={iconError}>✗</span>}
                                </div>
                                {fieldStatus('last_name') === 'error' && (
                                    <p style={inlineErrorStyle}>{inlineErrors.last_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={fieldLabelStyle}>Adresse Email</label>
                            <div style={inputWrapperStyle}>
                                <input
                                    type="email"
                                    placeholder="jean.dupont@exemple.com"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                    onBlur={() => touchRegisterField('email')}
                                    style={{ ...modernInputStyle, border: inputBorder('email') }}
                                />
                                {fieldStatus('email') === 'success' && <span style={iconSuccess}>✓</span>}
                                {fieldStatus('email') === 'error' && <span style={iconError}>✗</span>}
                            </div>
                            {fieldStatus('email') === 'error' && (
                                <p style={inlineErrorStyle}>{inlineErrors.email}</p>
                            )}
                        </div>

                        {/* Rôle */}
                        <div>
                            <label style={fieldLabelStyle}>Je suis un…</label>
                            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                {roleOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setRegisterData({ ...registerData, role: opt.value })}
                                        style={{
                                            flex: 1,
                                            padding: '12px 16px',
                                            borderRadius: 14,
                                            border: registerData.role === opt.value ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                                            backgroundColor: registerData.role === opt.value ? '#eff6ff' : '#fff',
                                            color: registerData.role === opt.value ? '#1d4ed8' : '#64748b',
                                            fontWeight: registerData.role === opt.value ? 700 : 400,
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {opt.value === 'Etudiant' ? '🎓 ' : '📖 '}{opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label style={fieldLabelStyle}>Mot de passe</label>
                            <div style={inputWrapperStyle}>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                    onBlur={() => touchRegisterField('password')}
                                    style={{ ...modernInputStyle, border: inputBorder('password') }}
                                />
                                {fieldStatus('password') === 'success' && <span style={iconSuccess}>✓</span>}
                                {fieldStatus('password') === 'error' && <span style={iconError}>✗</span>}
                            </div>

                            {/* Barre de force */}
                            {registerData.password && (
                                <div style={{ marginTop: 10 }}>
                                    <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} style={{
                                                flex: 1, height: 5, borderRadius: 99,
                                                backgroundColor: i <= pwStrength.score ? pwStrength.color : '#f1f5f9',
                                                transition: 'background-color 0.3s',
                                            }} />
                                        ))}
                                    </div>
                                    {pwStrength.label && (
                                        <p style={{ fontSize: 12, color: pwStrength.color, fontWeight: 700, margin: 0 }}>
                                            Force : {pwStrength.label}
                                        </p>
                                    )}
                                </div>
                            )}
                            {fieldStatus('password') === 'error' && (
                                <p style={inlineErrorStyle}>{inlineErrors.password}</p>
                            )}
                        </div>

                        {/* Confirmation mot de passe */}
                        <div>
                            <label style={fieldLabelStyle}>Confirmer le mot de passe</label>
                            <div style={inputWrapperStyle}>
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={registerData.password_confirmation}
                                    onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                                    onBlur={() => touchRegisterField('password_confirmation')}
                                    style={{ ...modernInputStyle, border: inputBorder('password_confirmation') }}
                                />
                                {fieldStatus('password_confirmation') === 'success' && <span style={iconSuccess}>✓</span>}
                                {fieldStatus('password_confirmation') === 'error' && <span style={iconError}>✗</span>}
                            </div>
                            {fieldStatus('password_confirmation') === 'error' && (
                                <p style={inlineErrorStyle}>{inlineErrors.password_confirmation}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={registerSubmitting}
                            style={{
                                ...submitButtonStyle,
                                opacity: (registerSubmitting || !registerData.rgpd_consent) ? 0.6 : 1,
                                cursor: (registerSubmitting || !registerData.rgpd_consent) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {registerSubmitting ? '⏳ Inscription en cours...' : 'Créer mon compte'}
                        </button>
                    </form>

                    <div style={footerRowStyle}>
                        <span style={{ color: '#64748b', fontSize: 14 }}>Vous avez déjà un compte ?</span>
                        <button type="button" style={footerLinkStyle} onClick={() => { setMessage(''); setCurrentView('login'); }}>
                            Se connecter
                        </button>
                    </div>
                    <button onClick={() => setCurrentView('home')} style={backButtonStyle}>← Retour à l'accueil</button>
                </div>
            </section>
        );
    };

    return (
        <div style={appStyle}>
            {renderHeader()}
            {currentView === 'home' && renderHome()}
            {currentView === 'studentHome' && renderStudentHome()}
            {currentView === 'teacherHome' && renderTeacherHome()}
            {currentView === 'login' && renderLogin()}
            {currentView === 'register' && renderRegister()}
        </div>
    );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────────

const appStyle = {
    fontFamily: 'Inter, system-ui, sans-serif',
    minHeight: '100vh',
    width: '100vw',
    overflowX: 'hidden',
    margin: 0,
    padding: 0,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
};

const headerStyle = {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: '18px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
};

const headerInnerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
};

const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 700,
    fontSize: '18px',
};

const navStyle = {
    display: 'flex',
    gap: '18px',
    alignItems: 'center',
    flexWrap: 'wrap',
};

const navButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: '#cbd5e1',
    fontSize: '14px',
    cursor: 'pointer',
};

const actionsStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
};

const headerButtonStyle = {
    padding: '10px 18px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontWeight: 600,
};

const headerButtonStyleSecondary = {
    ...headerButtonStyle,
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.24)',
};

const heroStyle = {
    padding: '100px 28px 60px',
    textAlign: 'center',
    background: 'linear-gradient(180deg, #0f172a 0%, #111827 40%, #f8fafc 100%)',
    color: '#fff',
};

const heroContentStyle = { maxWidth: '760px', margin: '0 auto' };

const heroIntroStyle = {
    fontSize: '16px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#93c5fd',
    marginBottom: '18px',
};

const heroTitleStyle = {
    fontSize: '58px',
    lineHeight: 1.05,
    fontWeight: 800,
    margin: '0 auto 20px',
    maxWidth: '760px',
};

const heroTextStyle = {
    fontSize: '18px',
    lineHeight: 1.8,
    color: '#cbd5e1',
    marginBottom: '32px',
};

const heroButtonsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
};

const heroPrimaryButtonStyle = {
    padding: '16px 28px',
    borderRadius: '999px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
};

const heroSecondaryButtonStyle = {
    padding: '16px 28px',
    borderRadius: '999px',
    backgroundColor: '#fff',
    color: '#0f172a',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 700,
};

const statsSectionStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px',
    maxWidth: '1100px',
    margin: '0 auto',
    transform: 'translateY(-40px)',
    padding: '0 28px 60px',
};

const statCardStyle = {
    backgroundColor: '#0f172a',
    padding: '32px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(15,23,42,0.12)',
    color: '#fff',
};

const statValueStyle = { fontSize: '42px', fontWeight: 800, margin: 0 };
const statLabelStyle = { color: '#94a3b8', marginTop: '10px' };

const infoSectionStyle = {
    display: 'grid',
    gap: '20px',
    maxWidth: '1100px',
    margin: '0 auto 80px',
    padding: '0 28px',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
};

const infoCardStyle = {
    backgroundColor: '#fff',
    padding: '28px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 18px 50px rgba(15,23,42,0.06)',
};

const formSectionStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '60px 28px 100px',
};

const authCardStyle = {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: '40px 36px',
    boxShadow: '0 24px 80px rgba(15,23,42,0.1)',
    border: '1px solid rgba(15,23,42,0.07)',
};

const brandStyle = {
    fontSize: '15px',
    fontWeight: 700,
    color: '#2563eb',
    margin: 0,
};

const cardTitleStyle = {
    fontSize: '28px',
    fontWeight: 800,
    margin: '4px 0 0',
    color: '#0f172a',
};

const cardSubtitleStyle = {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#64748b',
};

const fieldLabelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
};

const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
};

const modernInputStyle = {
    width: '100%',
    padding: '14px 44px 14px 16px',
    borderRadius: 14,
    border: '1.5px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
};

const iconSuccess = {
    position: 'absolute',
    right: 14,
    fontSize: 16,
    color: '#22c55e',
    fontWeight: 700,
    pointerEvents: 'none',
};

const iconError = {
    position: 'absolute',
    right: 14,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 700,
    pointerEvents: 'none',
};

const inlineErrorStyle = {
    fontSize: '12px',
    color: '#dc2626',
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
};

const errorBannerStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 13,
    color: '#dc2626',
    marginBottom: 20,
    fontWeight: 500,
};

const successBannerStyle = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 13,
    color: '#16a34a',
    marginBottom: 20,
    fontWeight: 500,
};

const submitButtonStyle = {
    width: '100%',
    padding: '16px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(37,99,235,0.28)',
    transition: 'opacity 0.2s',
};

const footerRowStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
};

const footerLinkStyle = {
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
};

const forgotLinkStyle = {
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 500,
};

const backButtonStyle = {
    marginTop: 16,
    display: 'block',
    width: '100%',
    padding: '13px 20px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    boxSizing: 'border-box',
};
