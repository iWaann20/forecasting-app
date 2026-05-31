<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $role = is_object($user) ? ($user->role ?? null) : null;

        if (! $role || ! in_array($role, $roles, true)) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}