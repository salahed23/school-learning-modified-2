import React, { useEffect, useState } from 'react';

export default function AdministrationSecrete() {

    const [utilisateurs, setUtilisateurs] = useState([]);

    useEffect(() => {

        // récupération API Laravel

        setUtilisateurs([
            {
                id: 1,
                nom: 'Etudiant Test',
                status: 'en_attente'
            }
        ]);

    }, []);

    const validerUtilisateur = (id) => {
        console.log('Validation utilisateur : ', id);
    };

    const refuserUtilisateur = (id) => {
        console.log('Refus utilisateur : ', id);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Administration secrète</h1>

            {utilisateurs.map((user) => (
                <div key={user.id}>
                    <p>{user.nom}</p>

                    <button onClick={() => validerUtilisateur(user.id)}>
                        Valider
                    </button>

                    <button onClick={() => refuserUtilisateur(user.id)}>
                        Refuser
                    </button>
                </div>
            ))}
        </div>
    );
}
