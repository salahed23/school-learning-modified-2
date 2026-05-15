<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    protected $table      = 'refresh_tokens';
    protected $primaryKey = 'Id_token';

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'token_hash',
        'CreateAt',
        'ExpirerAt',
        'RevokedAt',
    ];
}
