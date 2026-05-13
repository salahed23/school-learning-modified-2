import { Head, Link } from '@inertiajs/react';

/**
 * Page Politique de Confidentialité — Conformité RGPD/CNIL
 */
export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Politique de confidentialité | School-learning" />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📘</span>
                            <span className="text-xl font-bold text-[#3B82F6]">School-learning</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
                        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : mai 2026 — Conforme RGPD & CNIL</p>

                        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                            <section>
                                <h2 className="font-bold text-gray-900 mb-2">1. Responsable du traitement</h2>
                                <p>School-learning est responsable du traitement de vos données personnelles dans le cadre de l'utilisation de la plateforme pédagogique.</p>
                            </section>

                            <section>
                                <h2 className="font-bold text-gray-900 mb-2">2. Données collectées</h2>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Prénom et nom</li>
                                    <li>Adresse email</li>
                                    <li>Rôle (Étudiant ou Enseignant)</li>
                                    <li>Date et heure de consentement</li>
                                    <li>Logs de connexion (sécurité)</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="font-bold text-gray-900 mb-2">3. Base légale</h2>
                                <p>Le traitement est fondé sur votre <strong>consentement explicite</strong> (Art. 6.1.a RGPD) recueilli lors de votre inscription.</p>
                            </section>

                            <section>
                                <h2 className="font-bold text-gray-900 mb-2">4. Sécurité des données</h2>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Mots de passe hachés (bcrypt, 12 rounds)</li>
                                    <li>Tokens JWT de courte durée (15 min) + Refresh Token (7 jours)</li>
                                    <li>Protection anti-brute force (5 tentatives max)</li>
                                    <li>Logs d'accès sécurisés</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="font-bold text-gray-900 mb-2">5. Vos droits (RGPD)</h2>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Droit d'accès</strong> — vous pouvez consulter vos données</li>
                                    <li><strong>Droit de rectification</strong> — vous pouvez modifier vos informations</li>
                                    <li><strong>Droit à l'effacement</strong> — vous pouvez demander la suppression de votre compte</li>
                                    <li><strong>Droit d'opposition</strong> — vous pouvez retirer votre consentement</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="font-bold text-gray-900 mb-2">6. Conservation</h2>
                                <p>Vos données sont conservées pendant la durée d'utilisation du service, puis supprimées dans un délai de 3 ans sans activité.</p>
                            </section>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <Link href="/" className="text-sm text-[#3B82F6] hover:underline">
                                ← Retour à l'accueil
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
