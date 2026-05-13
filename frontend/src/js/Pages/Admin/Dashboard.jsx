import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

/**
 * Admin Dashboard — School-learning
 *
 * Accessible UNIQUEMENT via : /admin-secret-panel
 * Non listée dans la navigation du site.
 * Protégée par : AdminSecretMiddleware (auth + rôle Admin)
 */
export default function AdminDashboard({ stats, recentUsers }) {
    const [users, setUsers] = useState(recentUsers || []);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotif = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    const fetchUsers = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (roleFilter) params.append('role', roleFilter);

        try {
            const res = await fetch(`/admin-secret-panel/users?${params}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            setUsers(data.data || []);
        } catch {
            showNotif('Erreur lors du chargement.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId, newRole) => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        const res = await fetch(`/admin-secret-panel/users/${userId}/role`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ role: newRole }),
        });
        const data = await res.json();
        if (data.status === 'success') {
            showNotif(data.message);
            fetchUsers();
        } else {
            showNotif('Erreur lors de la mise à jour.', 'error');
        }
    };

    const deleteUser = async (userId, name) => {
        if (!confirm(`Supprimer définitivement ${name} ? (RGPD — droit à l'effacement)`)) return;
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        const res = await fetch(`/admin-secret-panel/users/${userId}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': csrfToken },
        });
        const data = await res.json();
        if (data.status === 'success') {
            showNotif(data.message);
            fetchUsers();
        }
    };

    const roleBadge = (role) => {
        const classes = {
            Admin:      'bg-purple-100 text-purple-800 border border-purple-200',
            Enseignant: 'bg-blue-100 text-blue-800 border border-blue-200',
            Etudiant:   'bg-green-100 text-green-800 border border-green-200',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${classes[role] || 'bg-gray-100 text-gray-700'}`}>
                {role}
            </span>
        );
    };

    return (
        <>
            <Head title="Panel Admin — School-learning" />

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
                    notification.type === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-green-600 text-white'
                }`}>
                    {notification.msg}
                </div>
            )}

            <div className="min-h-screen bg-gray-950 text-white">
                {/* Header */}
                <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-lg">
                                🔐
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">Panel Administrateur</h1>
                                <p className="text-xs text-gray-500">School-learning — Accès restreint</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs bg-red-900/50 text-red-300 border border-red-800 px-3 py-1 rounded-full">
                                ⚠ Page non listée — Accès confidentiel
                            </span>
                            <a
                                href="/"
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                ← Retour au site
                            </a>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Total utilisateurs', value: stats.total_users,    icon: '👥', color: 'from-blue-600 to-blue-800' },
                            { label: 'Étudiants',          value: stats.total_students, icon: '🎓', color: 'from-green-600 to-green-800' },
                            { label: 'Enseignants',        value: stats.total_teachers, icon: '📚', color: 'from-indigo-600 to-indigo-800' },
                            { label: 'Admins',             value: stats.total_admins,   icon: '🔑', color: 'from-purple-600 to-purple-800' },
                            { label: 'Inscrits ce mois',   value: stats.new_this_week,  icon: '📈', color: 'from-orange-600 to-orange-800' },
                        ].map((s) => (
                            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-4`}>
                                <div className="text-2xl mb-1">{s.icon}</div>
                                <div className="text-2xl font-bold">{s.value}</div>
                                <div className="text-xs opacity-80 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Gestion utilisateurs */}
                    <section className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center gap-4">
                            <h2 className="font-semibold text-lg flex-1">Gestion des utilisateurs</h2>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                                />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => { setRoleFilter(e.target.value); }}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">Tous les rôles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Enseignant">Enseignant</option>
                                    <option value="Etudiant">Étudiant</option>
                                </select>
                                <button
                                    onClick={fetchUsers}
                                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Filtrer
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b border-gray-800">
                                        <th className="px-6 py-3 font-medium">Utilisateur</th>
                                        <th className="px-6 py-3 font-medium">Email</th>
                                        <th className="px-6 py-3 font-medium">Rôle</th>
                                        <th className="px-6 py-3 font-medium">RGPD</th>
                                        <th className="px-6 py-3 font-medium">Inscrit le</th>
                                        <th className="px-6 py-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Chargement...
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                Aucun utilisateur trouvé.
                                            </td>
                                        </tr>
                                    ) : users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {user.first_name} {user.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                            <td className="px-6 py-4">{roleBadge(user.role)}</td>
                                            <td className="px-6 py-4">
                                                {user.rgpd_consent_at ? (
                                                    <span className="text-xs text-green-400">
                                                        ✓ {new Date(user.rgpd_consent_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-red-400">✗ Non consenti</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">
                                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        defaultValue={user.role}
                                                        onChange={(e) => updateRole(user.id, e.target.value)}
                                                        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                                    >
                                                        <option value="Etudiant">Étudiant</option>
                                                        <option value="Enseignant">Enseignant</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                    <button
                                                        onClick={() => deleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                                                        className="text-red-400 hover:text-red-300 text-xs border border-red-900 hover:border-red-700 px-2 py-1 rounded transition-colors"
                                                        title="Supprimer (RGPD)"
                                                    >
                                                        🗑 Suppr.
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Infos CNIL/RGPD */}
                    <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <span>🛡️</span> Conformité CNIL / RGPD
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                            <div className="bg-gray-800 rounded-xl p-4">
                                <div className="text-white font-medium mb-2">Mots de passe</div>
                                <ul className="space-y-1 text-xs">
                                    <li>✓ 12 caractères minimum</li>
                                    <li>✓ Majuscules + minuscules</li>
                                    <li>✓ Chiffres + caractères spéciaux</li>
                                    <li>✓ Hachage bcrypt (12 rounds)</li>
                                </ul>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4">
                                <div className="text-white font-medium mb-2">Anti-brute force</div>
                                <ul className="space-y-1 text-xs">
                                    <li>✓ 5 tentatives max par IP</li>
                                    <li>✓ Blocage 60 secondes</li>
                                    <li>✓ Logs sécurité centralisés</li>
                                    <li>✓ Clé throttle IP + email</li>
                                </ul>
                            </div>
                            <div className="bg-gray-800 rounded-xl p-4">
                                <div className="text-white font-medium mb-2">Tokens JWT</div>
                                <ul className="space-y-1 text-xs">
                                    <li>✓ Access Token : 15 min</li>
                                    <li>✓ Refresh Token : 7 jours</li>
                                    <li>✓ Rotation automatique</li>
                                    <li>✓ Invalidation à la déconnexion</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
