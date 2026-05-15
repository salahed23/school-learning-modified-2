import React, { useEffect, useState } from 'react';

const navLinks = [
    { label: 'Accueil', target: 'home' },
    { label: 'Cours', target: 'courses' },
    { label: 'À propos', target: 'about' },
];

export default function App() {
    const [backendStatus, setBackendStatus] = useState(null);
    const [currentView, setCurrentView] = useState('home'); // home, login, register, studentHome, teacherHome
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ first_name: '', last_name: '', email: '', password: '', password_confirmation: '', role: 'Etudiant' });
    const [loginErrors, setLoginErrors] = useState({});
    const [registerErrors, setRegisterErrors] = useState({});
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState('');

    const roleOptions = [
        { value: 'Etudiant', label: 'Étudiant' },
        { value: 'Enseignant', label: 'Enseignant' },
    ];

    const getDashboardView = (role) => {
        return role === 'Enseignant' ? 'teacherHome' : 'studentHome';
    };

    const sanitizeInput = (value) => {
        return value.replace(/[<>"'\/]/g, '').trim();
    };

    const validateEmail = (value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const validateName = (value) => {
        return /^[A-Za-zÀ-ÿ '-]{2,}$/.test(value.trim());
    };

    const validateLogin = () => {
        const errors = {};
        if (!validateEmail(loginData.email)) {
            errors.email = 'Email invalide.';
        }
        if (loginData.password.length < 12) {
            errors.password = 'Le mot de passe doit contenir au moins 12 caractères.';
        }
        return errors;
    };

    const validateRegister = () => {
        const errors = {};
        if (!validateName(registerData.first_name)) {
            errors.first_name = 'Le prénom doit contenir au moins 2 lettres.';
        }
        if (!validateName(registerData.last_name)) {
            errors.last_name = 'Le nom doit contenir au moins 2 lettres.';
        }
        if (!validateEmail(registerData.email)) {
            errors.email = 'Email invalide.';
        }
        if (registerData.password.length < 12) {
            errors.password = 'Le mot de passe doit contenir au moins 12 caractères.';
        }
        if (registerData.password !== registerData.password_confirmation) {
            errors.password_confirmation = 'Les mots de passe ne correspondent pas.';
        }
        return errors;
    };

    useEffect(() => {
        fetch('http://localhost:8000/api/status')
            .then(response => response.json())
            .then(data => setBackendStatus(data))
            .catch(() => setBackendStatus(null));

        fetch('http://localhost:8000/api/auth/me', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                setUser(data.user);
                setCurrentView(getDashboardView(data.user.role));
            }
        })
        .catch(() => {
            setToken(null);
            setUser(null);
        });
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        const validationErrors = validateLogin();
        setLoginErrors(validationErrors);
        if (Object.keys(validationErrors).length) {
            setMessage('Veuillez corriger les erreurs du formulaire.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });
            const data = await response.json();
            if (response.ok && data.user) {
                setToken(data.access_token || null);
                const loggedUser = data.user || { email: loginData.email, role: data.role || 'Etudiant' };
                setUser(loggedUser);
                setCurrentView(getDashboardView(loggedUser.role));
                setMessage('Connexion réussie');
            } else {
                setMessage(data.error || data.message || 'Erreur de connexion');
            }
        } catch (error) {
            setMessage('Erreur réseau');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        const validationErrors = validateRegister();
        setRegisterErrors(validationErrors);
        if (Object.keys(validationErrors).length) {
            setMessage('Veuillez corriger les erreurs du formulaire.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData),
            });
            const data = await response.json();
            if (response.ok && data.user) {
                setToken(data.access_token || null);
                const newUser = data.user || { email: registerData.email, role: registerData.role };
                setUser(newUser);
                setCurrentView(getDashboardView(newUser.role));
                setMessage('Inscription réussie. Bienvenue !');
            } else if (response.ok) {
                setMessage('Inscription réussie. Vous pouvez maintenant vous connecter.');
                setCurrentView('login');
            } else {
                setMessage(data.error || data.message || 'Erreur d\'inscription');
            }
        } catch (error) {
            setMessage('Erreur réseau');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:8000/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            // ignore network errors on logout
        }

        setToken(null);
        setUser(null);
        setCurrentView('home');
        setMessage('Déconnexion réussie');
    };

    const renderHeader = () => (
        <header style={headerStyle}>
            <div style={headerInnerStyle}>
                <div style={logoStyle}>
                    <span style={logoIconStyle}>📘</span>
                    <span>School-learning</span>
                </div>
                <nav style={navStyle}>
                    {navLinks.map((link) => (
                        <button
                            key={link.target}
                            style={navButtonStyle}
                            onClick={() => setCurrentView(user ? getDashboardView(user.role) : 'home')}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>
                <div style={actionsStyle}>
                    {user ? (
                        <button onClick={handleLogout} style={headerButtonStyle}>Déconnexion</button>
                    ) : (
                        <>
                            <button onClick={() => setCurrentView('login')} style={headerButtonStyleSecondary}>Connexion</button>
                            <button onClick={() => setCurrentView('register')} style={headerButtonStyle}>S'inscrire</button>
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
                    <p style={heroTextStyle}>
                        Des cours créés par des enseignants experts. Vidéos, documents, quiz — tout en un.
                    </p>
                    <div style={heroButtonsStyle}>
                        <button onClick={() => setCurrentView('register')} style={heroPrimaryButtonStyle}>Découvrir les cours</button>
                        <button onClick={() => setCurrentView('login')} style={heroSecondaryButtonStyle}>En savoir plus</button>
                    </div>
                </div>
            </section>
            <section style={statsSectionStyle}>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>120+</p>
                    <p style={statLabelStyle}>Cours disponibles</p>
                </div>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>850</p>
                    <p style={statLabelStyle}>Étudiants inscrits</p>
                </div>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>40</p>
                    <p style={statLabelStyle}>Enseignants</p>
                </div>
            </section>

            <section style={infoSectionStyle}>
                <div style={infoCardStyle}>
                    <h3>Accès immédiat</h3>
                    <p>Entrez dans votre espace et accédez directement à vos cours depuis n'importe où.</p>
                </div>
                <div style={infoCardStyle}>
                    <h3>Apprentissage interactif</h3>
                    <p>Supports multimédias, quiz et suivi de progression pour rester motivé.</p>
                </div>
                <div style={infoCardStyle}>
                    <h3>Communauté active</h3>
                    <p>Partagez avec des enseignants et des étudiants, obtenez de l'aide en un clic.</p>
                </div>
            </section>
        </main>
    );

    const renderStudentHome = () => (
        <main>
            <section style={heroStyle}>
                <div style={heroContentStyle}>
                    <p style={heroIntroStyle}>Bienvenue étudiant</p>
                    <h1 style={heroTitleStyle}>Votre espace d'apprentissage</h1>
                    <p style={heroTextStyle}>
                        Retrouvez vos cours, exercices et ressources adaptés à votre parcours.
                    </p>
                    <div style={heroButtonsStyle}>
                        <button onClick={() => setMessage('Accédez à vos cours dès maintenant.')} style={heroPrimaryButtonStyle}>Voir mes cours</button>
                        <button onClick={() => setCurrentView('home')} style={heroSecondaryButtonStyle}>Retour à l'accueil</button>
                    </div>
                </div>
            </section>
            <section style={statsSectionStyle}>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>Mes notes</p>
                    <p style={statLabelStyle}>Suivi des progrès</p>
                </div>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>Quiz</p>
                    <p style={statLabelStyle}>Évaluez vos acquis</p>
                </div>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>Soutien</p>
                    <p style={statLabelStyle}>Ressources et communauté</p>
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
                    <p style={heroTextStyle}>
                        Gérez vos cours, suivez les étudiants et partagez vos contenus en quelques clics.
                    </p>
                    <div style={heroButtonsStyle}>
                        <button onClick={() => setMessage('Accédez à votre espace enseignant.')} style={heroPrimaryButtonStyle}>Gérer mes cours</button>
                        <button onClick={() => setCurrentView('home')} style={heroSecondaryButtonStyle}>Retour à l'accueil</button>
                    </div>
                </div>
            </section>
            <section style={statsSectionStyle}>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>Cohortes</p>
                    <p style={statLabelStyle}>Organisez vos classes</p>
                </div>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>Ressources</p>
                    <p style={statLabelStyle}>Documents, quiz et supports</p>
                </div>
                <div style={statCardStyle}>
                    <p style={statValueStyle}>Feedback</p>
                    <p style={statLabelStyle}>Suivi des étudiants</p>
                </div>
            </section>
        </main>
    );

    const renderLogin = () => (
        <section style={formSectionStyle}>
            <div style={loginCardStyle}>
                <div style={loginHeaderStyle}>
                    <span style={loginIconStyle}>📘</span>
                    <div>
                        <p style={loginBrandStyle}>School-learning</p>
                        <h2 style={loginTitleStyle}>Bon retour !</h2>
                        <p style={loginSubtitleStyle}>Connectez-vous pour accéder à vos cours.</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} style={loginFormStyle}>
                    <label style={loginLabelStyle}>Adresse Email</label>
                    <input
                        type="email"
                        placeholder="admin@teacher.com"
                        value={loginData.email}
                        onChange={(e) => {
                            setLoginData({ ...loginData, email: e.target.value });
                            setLoginErrors({ ...loginErrors, email: undefined });
                        }}
                        style={loginInputStyle}
                        required
                    />
                    {loginErrors.email && <p style={fieldErrorStyle}>{loginErrors.email}</p>}

                    <div style={loginPasswordRowStyle}>
                        <label style={loginLabelStyle}>Mot de passe</label>
                        <button type="button" style={forgotLinkStyle} onClick={() => setMessage('Utilisez votre mot de passe habituel.')}>Oublié ?</button>
                    </div>
                    <input
                        type="password"
                        placeholder="••••••••••••"
                        value={loginData.password}
                        onChange={(e) => {
                            setLoginData({ ...loginData, password: e.target.value });
                            setLoginErrors({ ...loginErrors, password: undefined });
                        }}
                        style={loginInputStyle}
                        required
                    />
                    {loginErrors.password && <p style={fieldErrorStyle}>{loginErrors.password}</p>}
                    <p style={loginHintStyle}>Utilisez un email valide et un mot de passe d'au moins 12 caractères.</p>

                    <button type="submit" style={loginSubmitStyle}>Se connecter</button>
                </form>

                <div style={loginFooterStyle}>
                    <span>Pas encore de compte ?</span>
                    <button type="button" style={loginFooterLinkStyle} onClick={() => setCurrentView('register')}>S'inscrire</button>
                </div>
                <button onClick={() => setCurrentView('home')} style={loginBackStyle}>← Retour à l'accueil</button>
                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </section>
    );

    const renderRegister = () => (
        <section style={formSectionStyle}>
            <div style={loginCardStyle}>
                <div style={loginHeaderStyle}>
                    <span style={loginIconStyle}>📘</span>
                    <div>
                        <p style={loginBrandStyle}>School-learning</p>
                        <h2 style={loginTitleStyle}>Rejoignez-nous</h2>
                        <p style={loginSubtitleStyle}>Créez votre compte et commencez votre apprentissage.</p>
                    </div>
                </div>

                <form onSubmit={handleRegister} style={loginFormStyle}>
                    <label style={loginLabelStyle}>Prénom</label>
                    <input
                        type="text"
                        placeholder="Prénom"
                        value={registerData.first_name}
                        onChange={(e) => {
                            setRegisterData({ ...registerData, first_name: sanitizeInput(e.target.value) });
                            setRegisterErrors({ ...registerErrors, first_name: undefined });
                        }}
                        style={loginInputStyle}
                        required
                    />
                    {registerErrors.first_name && <p style={fieldErrorStyle}>{registerErrors.first_name}</p>}

                    <label style={loginLabelStyle}>Nom</label>
                    <input
                        type="text"
                        placeholder="Nom"
                        value={registerData.last_name}
                        onChange={(e) => {
                            setRegisterData({ ...registerData, last_name: sanitizeInput(e.target.value) });
                            setRegisterErrors({ ...registerErrors, last_name: undefined });
                        }}
                        style={loginInputStyle}
                        required
                    />
                    {registerErrors.last_name && <p style={fieldErrorStyle}>{registerErrors.last_name}</p>}

                    <label style={loginLabelStyle}>Adresse Email</label>
                    <input
                        type="email"
                        placeholder="email@example.com"
                        value={registerData.email}
                        onChange={(e) => {
                            setRegisterData({ ...registerData, email: sanitizeInput(e.target.value) });
                            setRegisterErrors({ ...registerErrors, email: undefined });
                        }}
                        style={loginInputStyle}
                        required
                    />
                    {registerErrors.email && <p style={fieldErrorStyle}>{registerErrors.email}</p>}

                    <label style={loginLabelStyle}>Rôle</label>
                    <select
                        value={registerData.role}
                        onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                        style={{ ...loginInputStyle, appearance: 'none' }}
                        required
                    >
                        {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <label style={loginLabelStyle}>Mot de passe</label>
                    <input
                        type="password"
                        placeholder="••••••••••••"
                        value={registerData.password}
                        onChange={(e) => {
                            setRegisterData({ ...registerData, password: sanitizeInput(e.target.value) });
                            setRegisterErrors({ ...registerErrors, password: undefined });
                        }}
                        style={loginInputStyle}
                        required
                    />
                    {registerErrors.password && <p style={fieldErrorStyle}>{registerErrors.password}</p>}

                    <label style={loginLabelStyle}>Confirmer mot de passe</label>
                    <input
                        type="password"
                        placeholder="••••••••••••"
                        value={registerData.password_confirmation}
                        onChange={(e) => {
                            setRegisterData({ ...registerData, password_confirmation: e.target.value });
                            setRegisterErrors({ ...registerErrors, password_confirmation: undefined });
                        }}
                        style={loginInputStyle}
                        required
                    />
                    {registerErrors.password_confirmation && <p style={fieldErrorStyle}>{registerErrors.password_confirmation}</p>}

                    <p style={loginHintStyle}>Tous les champs doivent être remplis correctement pour protéger votre compte.</p>

                    <button type="submit" style={loginSubmitStyle}>S'inscrire</button>
                </form>

                <div style={loginFooterStyle}>
                    <span>Vous avez déjà un compte ?</span>
                    <button type="button" style={loginFooterLinkStyle} onClick={() => setCurrentView('login')}>Connexion</button>
                </div>
                <button onClick={() => setCurrentView('home')} style={loginBackStyle}>← Retour à l'accueil</button>
                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </section>
    );

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

const logoIconStyle = {
    fontSize: '20px',
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
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.24)',
};

const heroStyle = {
    padding: '100px 28px 60px',
    textAlign: 'center',
    background: 'linear-gradient(180deg, #0f172a 0%, #111827 40%, #f8fafc 100%)',
    color: '#fff',
};

const heroContentStyle = {
    maxWidth: '760px',
    margin: '0 auto',
};

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

const statValueStyle = {
    fontSize: '42px',
    fontWeight: 800,
    margin: 0,
};

const statLabelStyle = {
    color: '#94a3b8',
    marginTop: '10px',
};

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
    padding: '80px 28px',
};

const formCardStyle = {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#fff',
    padding: '36px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(15,23,42,0.08)',
};

const formStyle = {
    display: 'grid',
    gap: '16px',
    marginTop: '20px',
};

const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
};

const buttonStyle = {
    padding: '14px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontWeight: 700,
};

const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e2e8f0',
    color: '#0f172a',
};

const messageStyle = {
    marginTop: '16px',
    color: '#ef4444',
};

const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#334155',
    marginTop: '8px',
};

const checkboxStyle = {
    width: '16px',
    height: '16px',
};

const loginCardStyle = {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#ffffff',
    borderRadius: '32px',
    padding: '38px',
    boxShadow: '0 24px 80px rgba(15,23,42,0.12)',
    border: '1px solid rgba(15,23,42,0.08)',
};

const loginHeaderStyle = {
    display: 'grid',
    gap: '14px',
    marginBottom: '30px',
};

const loginIconStyle = {
    fontSize: '28px',
};

const loginBrandStyle = {
    fontSize: '16px',
    fontWeight: 700,
    color: '#2563eb',
};

const loginTitleStyle = {
    fontSize: '32px',
    fontWeight: 800,
    margin: '6px 0 0',
};

const loginSubtitleStyle = {
    margin: '10px 0 0',
    fontSize: '15px',
    color: '#64748b',
};

const loginFormStyle = {
    display: 'grid',
    gap: '18px',
};

const loginLabelStyle = {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: 600,
};

const loginInputStyle = {
    width: '100%',
    padding: '16px 18px',
    borderRadius: '18px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#eef2ff',
    color: '#0f172a',
    fontSize: '15px',
};

const loginPasswordRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const forgotLinkStyle = {
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
};

const loginHintStyle = {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
};

const fieldErrorStyle = {
    color: '#dc2626',
    fontSize: '13px',
    margin: '6px 0 12px',
    lineHeight: 1.4,
};

const loginSubmitStyle = {
    padding: '16px 22px',
    width: '100%',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '18px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 20px 40px rgba(37,99,235,0.24)',
};

const loginFooterStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    alignItems: 'center',
    marginTop: '20px',
    color: '#64748b',
    fontSize: '14px',
};

const loginFooterLinkStyle = {
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 700,
};

const loginBackStyle = {
    marginTop: '28px',
    display: 'block',
    width: '100%',
    padding: '14px 22px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
    borderRadius: '18px',
    cursor: 'pointer',
    fontWeight: 600,
};

