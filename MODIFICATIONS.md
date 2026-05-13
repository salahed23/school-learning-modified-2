# 📋 Résumé des fichiers modifiés / créés

## 🔐 Access Token + Refresh Token

### Fichiers modifiés
| Fichier | Action | Détail |
|---|---|---|
| `app/Http/Controllers/Api/AuthController.php` | **MODIFIÉ** | Access Token 15 min + Refresh Token 7 jours rotatif, brute force, logs CNIL |
| `routes/api.php` | **MODIFIÉ** | Documentation des routes token, structure claire |
| `.env` | **MODIFIÉ** | `JWT_TTL=15`, `JWT_REFRESH_TTL=10080` |

### Comportement
- **Access Token** : 15 min, envoyé dans `Authorization: Bearer <token>` pour chaque requête API
- **Refresh Token** : 7 jours, envoyé à `POST /api/auth/refresh` pour obtenir un nouveau pair
- **Rotation** : chaque appel à `/refresh` invalide l'ancien Refresh Token et en génère un nouveau

---

## 🛡️ Règles CNIL

### Fichiers modifiés/créés
| Fichier | Action | Détail |
|---|---|---|
| `app/Http/Controllers/Api/AuthController.php` | **MODIFIÉ** | Validation mot de passe CNIL, consentement RGPD obligatoire, logs traçabilité |
| `app/Models/User.php` | **MODIFIÉ** | Champs `rgpd_consent`, `rgpd_consent_at`, `locked_until`, `failed_login_count` |
| `database/migrations/2026_05_13_000001_add_rgpd_to_users_table.php` | **CRÉÉ** | Migration RGPD : consentement + verrouillage |
| `resources/js/Components/PasswordStrengthMeter.jsx` | **CRÉÉ** | Indicateur de force mot de passe temps réel (critères CNIL) |
| `resources/js/Pages/Auth/Register.jsx` | **MODIFIÉ** | Case RGPD obligatoire, lien politique confidentialité, PasswordStrengthMeter |
| `resources/js/Pages/Legal/PrivacyPolicy.jsx` | **CRÉÉ** | Page politique de confidentialité RGPD/CNIL |
| `routes/web.php` | **MODIFIÉ** | Route `/politique-confidentialite` ajoutée |

### Règles appliquées
- Mot de passe : 12 car min, maj+min+chiffre+symbole (CNIL délibération 2017)
- Consentement RGPD explicite avec date/heure tracée en base
- Hachage bcrypt 12 rounds (configuré dans `.env` via `BCRYPT_ROUNDS=12`)
- Logs de connexion (succès, échec, brute force) dans `storage/logs/laravel.log`

---

## 🔒 Brute Force Protection

### Fichiers modifiés
| Fichier | Action | Détail |
|---|---|---|
| `app/Http/Controllers/Api/AuthController.php` | **MODIFIÉ** | `RateLimiter` : 5 tentatives max, lockout 60 sec, clé IP+email |

### Comportement
- 5 tentatives échouées → HTTP 429 avec `retry_in` en secondes
- Clé de throttle : `login|<email>|<ip>` (double facteur)
- Logs automatiques : `[SECURITE] Compte verrouillé après plusieurs tentatives`

---

## 👑 Page Admin

### Fichiers créés
| Fichier | Action | Détail |
|---|---|---|
| `app/Http/Middleware/AdminSecretMiddleware.php` | **CRÉÉ** | Vérifie auth + rôle Admin + IP whitelist optionnelle |
| `app/Http/Controllers/Admin/AdminController.php` | **CRÉÉ** | Dashboard stats, liste users, modifier rôle, supprimer (RGPD) |
| `resources/js/Pages/Admin/Dashboard.jsx` | **CRÉÉ** | Interface admin sombre, stats, gestion utilisateurs |
| `bootstrap/app.php` | **MODIFIÉ** | Enregistrement alias `admin.secret` |
| `routes/web.php` | **MODIFIÉ** | Route `/admin-secret-panel` + groupe routes admin |

### Accès
```
URL directe : http://localhost/admin-secret-panel
```
- ❌ Non listée dans la navigation du site
- ❌ Aucun lien depuis les pages publiques
- ✅ Nécessite d'être connecté avec un compte Admin
- ✅ Redirige vers /login si non authentifié
- ✅ HTTP 403 si rôle insuffisant
