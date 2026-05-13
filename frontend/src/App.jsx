import React, { useEffect, useState, useMemo, useCallback } from 'react';

export default function App() {
    const [utilisateur, setUtilisateur] = useState('');
    const [compteur, setCompteur] = useState(0);

    useEffect(() => {
        console.log('Composant chargé');
    }, []);

    const incrementer = useCallback(() => {
        setCompteur((ancien) => ancien + 1);
    }, []);

    const message = useMemo(() => {
        return `Bonjour ${utilisateur || 'utilisateur'} - compteur : ${compteur}`;
    }, [utilisateur, compteur]);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Frontend React avec Hooks</h1>

            <input
                type="text"
                placeholder="Votre nom"
                value={utilisateur}
                onChange={(e) => setUtilisateur(e.target.value)}
            />

            <p>{message}</p>

            <button onClick={incrementer}>
                Incrementer
            </button>
        </div>
    );
}
