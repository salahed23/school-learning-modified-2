import { Head, Link } from '@inertiajs/react';

/**
 * Page d'accueil principale de la plateforme School-learning.
 * C'est la vitrine de mon application pour les visiteurs et les futurs étudiants.
 */
export default function Accueil({ auth }) {
    return (
        <div className="bg-white min-h-screen font-['Inter',sans-serif]">
            <Head title="Accueil | School-learning" />
            
            {/* Barre de navigation : Gère l'affichage selon si l'utilisateur est connecté ou non */}
            <nav className="bg-[#1F2937] text-white py-4 px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📘</span>
                    <span className="text-xl font-bold text-[#3B82F6]">School-learning</span>
                </div>
                <div className="hidden md:flex gap-8 font-medium">
                    <Link href="/" className="text-[#3B82F6]">Accueil</Link>
                    <a href="#" className="hover:text-gray-300 transition">Cours</a>
                    <a href="#" className="hover:text-gray-300 transition">À propos</a>
                </div>
                <div className="flex gap-4">
                    {/* Si l'utilisateur est déjà loggé, on affiche le bouton Dashboard */}
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="px-6 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        /* Sinon, on affiche les boutons de Connexion et d'Inscription */
                        <>
                            <Link
                                href={route('login')}
                                className="px-6 py-2 rounded-lg border border-white hover:bg-white hover:text-[#1F2937] transition"
                            >
                                Connexion
                            </Link>
                            <Link
                                href={route('register')}
                                className="px-6 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 transition"
                            >
                                S'inscrire
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Section Hero : Le message de bienvenue et l'appel à l'action */}
            <section className="text-center py-24 px-4 max-w-4xl mx-auto">
                <h1 className="text-6xl font-extrabold text-[#111827] mb-6 leading-tight">
                    Apprenez à votre rythme
                </h1>
                <p className="text-xl text-[#6B7280] mb-10">
                    Des cours structurés créés par des enseignants experts. Vidéos, documents, quiz — tout en un.
                </p>
                <div className="flex justify-center gap-4">
                    <button className="px-8 py-3 rounded-lg border border-[#D1D5DB] font-medium hover:bg-gray-50 transition">
                        Découvrir les cours
                    </button>
                    <button className="px-8 py-3 rounded-lg border border-[#D1D5DB] font-medium hover:bg-gray-50 transition">
                        En savoir plus
                    </button>
                </div>
            </section>

            {/* Section Statistiques : Quelques chiffres pour rassurer l'utilisateur */}
            <section className="px-12 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#1F2937] rounded-2xl p-10 text-center">
                        <div className="text-5xl font-bold text-[#3B82F6] mb-2">120+</div>
                        <div className="text-white text-lg opacity-80">Cours disponibles</div>
                    </div>
                    <div className="bg-[#1F2937] rounded-2xl p-10 text-center">
                        <div className="text-5xl font-bold text-[#3B82F6] mb-2">850</div>
                        <div className="text-white text-lg opacity-80">Étudiants inscrits</div>
                    </div>
                    <div className="bg-[#1F2937] rounded-2xl p-10 text-center">
                        <div className="text-5xl font-bold text-[#3B82F6] mb-2">40</div>
                        <div className="text-white text-lg opacity-80">Enseignants</div>
                    </div>
                </div>
            </section>

            {/* Section Cours populaires : Présentation des cours en vedette */}
            <section className="px-12 py-20 bg-gray-50">
                <h2 className="text-2xl font-bold mb-12 text-gray-400">Cours populaires</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Carte Cours : React */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="h-48 bg-[#EBF5FF] flex items-center justify-center text-6xl">⚛️</div>
                        <div className="p-6 bg-[#1F2937]">
                            <h3 className="text-white text-xl font-bold mb-1">React Avancé</h3>
                            <p className="text-gray-400 text-sm mb-4">Par M. Dupont • 12 leçons</p>
                            <span className="bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-semibold px-3 py-1 rounded-full border border-[#3B82F6]/30">Développement</span>
                        </div>
                    </div>

                    {/* Carte Cours : Laravel */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="h-48 bg-[#E6FFFA] flex items-center justify-center text-6xl">🐘</div>
                        <div className="p-6 bg-[#1F2937]">
                            <h3 className="text-white text-xl font-bold mb-1">Maîtrise de Laravel</h3>
                            <p className="text-gray-400 text-sm mb-4">Par M. Martin • 15 leçons</p>
                            <span className="bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-semibold px-3 py-1 rounded-full border border-[#3B82F6]/30">Backend</span>
                        </div>
                    </div>

                    {/* Carte Cours : Design UI/UX */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="h-48 bg-[#FFF5F5] flex items-center justify-center text-6xl">🎨</div>
                        <div className="p-6 bg-[#1F2937]">
                            <h3 className="text-white text-xl font-bold mb-1">Design UI/UX</h3>
                            <p className="text-gray-400 text-sm mb-4">Par Mme. Lefebvre • 10 leçons</p>
                            <span className="bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-semibold px-3 py-1 rounded-full border border-[#3B82F6]/30">Design</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
