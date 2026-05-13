import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Connexion | School-learning" />

            <div className="mb-8 text-center">
                <div className="flex items-center gap-2 justify-center mb-4">
                    <span className="text-3xl">📘</span>
                    <span className="text-2xl font-bold text-[#3B82F6]">School-learning</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Bon retour !</h2>
                <p className="text-gray-500">Connectez-vous pour accéder à vos cours.</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Adresse Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full px-4 py-3"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex justify-between">
                        <InputLabel htmlFor="password" value="Mot de passe" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-[#3B82F6] hover:underline"
                            >
                                Oublié ?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full px-4 py-3"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Se souvenir de moi
                        </span>
                    </label>
                </div>

                <div className="flex flex-col gap-4">
                    <PrimaryButton className="w-full justify-center py-4 bg-[#3B82F6] hover:bg-blue-600 shadow-lg shadow-blue-200" disabled={processing}>
                        Se connecter
                    </PrimaryButton>

                    <div className="text-center">
                        <p className="text-gray-500 text-sm">
                            Pas encore de compte ?{' '}
                            <Link
                                href={route('register')}
                                className="text-[#3B82F6] font-bold hover:underline"
                            >
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
                    ← Retour à l'accueil
                </Link>
            </div>
        </GuestLayout>
    );
}
