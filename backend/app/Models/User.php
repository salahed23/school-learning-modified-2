<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'rgpd_consent',       // RGPD — acceptation de la politique de confidentialité
        'rgpd_consent_at',    // RGPD — date/heure du consentement (traçabilité CNIL)
        'locked_until',       // Sécurité — verrouillage anti-brute force
        'failed_login_count', // Sécurité — compteur de tentatives échouées
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'password'           => 'hashed',
            'rgpd_consent'       => 'boolean',
            'rgpd_consent_at'    => 'datetime',
            'locked_until'       => 'datetime',
        ];
    }

    // ── JWT Interface ──────────────────────────────────────────────────────

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Claims personnalisés embarqués dans le token JWT.
     * Permet de récupérer le rôle et l'email sans requête DB côté front.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role'  => $this->role,
            'email' => $this->email,
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'Admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'Enseignant';
    }

    public function isStudent(): bool
    {
        return $this->role === 'Etudiant';
    }
}
