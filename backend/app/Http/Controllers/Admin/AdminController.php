<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * AdminController
 * Gère la page admin accessible UNIQUEMENT via /admin-secret-panel
 */
class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users'    => User::count(),
            'total_students' => User::where('role', 'Etudiant')->count(),
            'total_teachers' => User::where('role', 'Enseignant')->count(),
            'total_admins'   => User::where('role', 'Admin')->count(),
            'new_this_week'  => User::where('created_at', '>=', now()->subWeek())->count(),
        ];

        $recentUsers = User::select('id', 'first_name', 'last_name', 'email', 'role', 'created_at', 'rgpd_consent_at')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats'       => $stats,
            'recentUsers' => $recentUsers,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::select('id', 'first_name', 'last_name', 'email', 'role', 'created_at', 'rgpd_consent_at');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('email', 'like', '%' . $request->search . '%')
                  ->orWhere('first_name', 'like', '%' . $request->search . '%')
                  ->orWhere('last_name', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->role) {
            $query->where('role', $request->role);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(25));
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|in:Admin,Enseignant,Etudiant']);
        $old = $user->role;
        $user->update(['role' => $request->role]);

        Log::info('[ADMIN] Rôle modifié', [
            'admin_id'  => auth()->id(),
            'target_id' => $user->id,
            'old_role'  => $old,
            'new_role'  => $request->role,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Rôle mis à jour.']);
    }

    public function deleteUser(User $user)
    {
        $data = ['id' => $user->id, 'email' => $user->email];
        $user->delete();

        Log::info('[ADMIN][RGPD] Compte supprimé (droit à l\'effacement)', [
            'admin_id' => auth()->id(),
            'deleted'  => $data,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Utilisateur supprimé.']);
    }
}
