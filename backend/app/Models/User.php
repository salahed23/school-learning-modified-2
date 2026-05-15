<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table      = 'utilisateur_';
    protected $primaryKey = 'id_user';

    protected $fillable = [
        'nom_',
        'prenom',
        'email',
        'mot_de_passe',
        'role',
    ];

    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'mot_de_passe' => 'hashed',
        ];
    }

    // ── Laravel Auth ───────────────────────────────────────────────────────

    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    public function getAuthPasswordName(): string
    {
        return 'mot_de_passe';
    }

    // ── JWT Interface ──────────────────────────────────────────────────────

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role'  => $this->role,
            'email' => $this->email,
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    public function isAdmin(): bool    { return $this->role === 'Admin'; }
    public function isTeacher(): bool  { return $this->role === 'Enseignant'; }
    public function isStudent(): bool  { return $this->role === 'Etudiant'; }
}
