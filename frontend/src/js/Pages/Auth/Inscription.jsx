import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordStrengthMeter from '@/Components/PasswordStrengthMeter';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name:            '',
        last_name:             '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        role:                  'Etudiant',
        rgpd_consent:          false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="S'inscrire | School-learning" />

            <div className="mb-8 text-center">
                <div className="flex items-center gap-2 justify-center mb-4">
                    <span className="text-3xl">📘</span>
                    <span className="text-2xl font-bold text-[#3B82F6]">School-learning</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Commencez dès aujourd'hui</h2>
                <p className="text-gray-500">Rejoignez notre communauté d'apprentissage.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="first_name" value="Prénom" />
                        <TextInput
                            id="first_name"
                            name="first_name"
                            value={data.first_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.first_name} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="last_name" value="Nom" />
                        <TextInput
                            id="last_name"
                            name="last_name"
                            value={data.last_name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.last_name} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Adresse Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="role" value="Je suis un..." />
                    <select
                        id="role"
                        name="role"
                        value={data.role}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        onChange={(e) => setData('role', e.target.value)}
                        required
                    >
                        <option value="Etudiant">Étudiant</option>
                        <option value="Enseignant">Enseignant</option>
                    </select>
                    <InputError message={errors.role} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Mot de passe" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('password', e.target.value)}
                        minLength="12"
                        required
                    />
                    {/* Indicateur de force CNIL en temps réel */}
                    <PasswordStrengthMeter password={data.password} />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirmer le mot de passe" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    {data.password_confirmation && data.password !== data.password_confirmation && (
                        <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                    )}
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                {/* RGPD — Consentement obligatoire (CNIL) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="rgpd_consent"
                            checked={data.rgpd_consent}
                            onChange={(e) => setData('rgpd_consent', e.target.checked)}
                            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            required
                        />
                        <span className="text-sm text-gray-700">
                            J'accepte la{' '}
                            <Link
                                href="/politique-confidentialite"
                                target="_blank"
                                className="text-[#3B82F6] underline hover:text-blue-700"
                            >
                                politique de confidentialité
                            </Link>{' '}
                            et le traitement de mes données personnelles conformément au{' '}
                            <strong>RGPD</strong> et aux recommandations de la{' '}
                            <strong>CNIL</strong>.
                        </span>
                    </label>
                    <InputError message={errors.rgpd_consent} className="mt-2" />
                </div>

                <div className="flex flex-col gap-4">
                    <PrimaryButton
                        className="w-full justify-center py-4 bg-[#3B82F6] hover:bg-blue-600"
                        disabled={processing || !data.rgpd_consent}
                    >
                        Créer mon compte
                    </PrimaryButton>

                    <div className="text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-[#3B82F6] font-bold hover:underline"
                        >
                            Déjà inscrit ? Se connecter
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
