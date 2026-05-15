<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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

        $recentUsers = User::select('id_user', 'prenom', 'nom_', 'email', 'role', 'created_at')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return response()->json([
            'stats'       => $stats,
            'recentUsers' => $recentUsers,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::select('id_user', 'prenom', 'nom_', 'email', 'role', 'created_at');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('email', 'like', '%' . $request->search . '%')
                  ->orWhere('prenom', 'like', '%' . $request->search . '%')
                  ->orWhere('nom_', 'like', '%' . $request->search . '%');
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
            'admin_id'  => Auth::id(),
            'target_id' => $user->getKey(),
            'old_role'  => $old,
            'new_role'  => $request->role,
        ]);

        return response()->json(['message' => 'Rôle mis à jour.']);
    }

    public function deleteUser(User $user)
    {
        $data = ['id_user' => $user->getKey(), 'email' => $user->email];
        $user->delete();

        Log::info('[ADMIN][RGPD] Compte supprimé', [
            'admin_id' => Auth::id(),
            'deleted'  => $data,
        ]);

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
