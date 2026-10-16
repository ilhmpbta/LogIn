<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
    Route::inertia('incidents', 'incidents/Index')->name('incidents.index');
    Route::inertia('incidents/{id}', 'incidents/Show')->name('incidents.show');
    Route::inertia('logs', 'logs/Index')->name('logs.index');
    Route::inertia('rules', 'rules/Index')->name('rules.index');
});

require __DIR__.'/settings.php';
