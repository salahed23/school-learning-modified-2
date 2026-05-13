<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    protected $table = 'refresh_tokens';

    protected $fillable = [
        'id_user', 'token_hash', 'created_at', 'expires_at', 'revoked_at'
    ];

    public $timestamps = false;
}