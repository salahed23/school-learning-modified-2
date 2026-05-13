import { useMemo } from 'react';

/**
 * PasswordStrengthMeter — Composant CNIL
 * 
 * Affiche la force du mot de passe en temps réel selon les critères CNIL :
 * - 12 caractères minimum
 * - Lettres majuscules et minuscules
 * - Chiffres
 * - Caractères spéciaux
 */
export default function PasswordStrengthMeter({ password }) {
    const checks = useMemo(() => [
        { id: 'length',   label: '12 caractères minimum',              test: (p) => p.length >= 12 },
        { id: 'upper',    label: 'Une lettre majuscule',               test: (p) => /[A-Z]/.test(p) },
        { id: 'lower',    label: 'Une lettre minuscule',               test: (p) => /[a-z]/.test(p) },
        { id: 'number',   label: 'Un chiffre',                        test: (p) => /[0-9]/.test(p) },
        { id: 'special',  label: 'Un caractère spécial (!@#$%...)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
    ], []);

    const score = useMemo(() =>
        checks.filter(c => c.test(password)).length,
        [password, checks]
    );

    const strength = useMemo(() => {
        if (score === 0) return { label: '',         color: 'bg-gray-200', text: 'text-gray-400' };
        if (score <= 2)  return { label: 'Faible',   color: 'bg-red-400',  text: 'text-red-500'  };
        if (score <= 3)  return { label: 'Moyen',    color: 'bg-orange-400', text: 'text-orange-500' };
        if (score === 4) return { label: 'Fort',     color: 'bg-yellow-400', text: 'text-yellow-600' };
        return               { label: 'Très fort', color: 'bg-green-500', text: 'text-green-600' };
    }, [score]);

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Barre de progression */}
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= score ? strength.color : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>

            {/* Label de force */}
            {strength.label && (
                <p className={`text-xs font-medium ${strength.text}`}>
                    Force : {strength.label}
                </p>
            )}

            {/* Critères CNIL */}
            <ul className="space-y-1">
                {checks.map((check) => {
                    const ok = check.test(password);
                    return (
                        <li key={check.id} className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                            <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[10px] font-bold ${ok ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {ok ? '✓' : '·'}
                            </span>
                            {check.label}
                        </li>
                    );
                })}
            </ul>

            {/* Badge conformité CNIL */}
            {score === 5 && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <span>🛡️</span>
                    <span>Conforme aux exigences CNIL</span>
                </div>
            )}
        </div>
    );
}
