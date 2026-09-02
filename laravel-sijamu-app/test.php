<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::where('role', 'dosen')->first();
$userData = $user->toArray();
$rolePerm = \App\Models\RolePermission::where('role', $user->role)->first();
$userData['permissions'] = $rolePerm->permissions ?? [];
echo json_encode($userData['permissions']);
