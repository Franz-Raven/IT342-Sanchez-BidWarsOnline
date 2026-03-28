package com.example.bidwarsonline.network

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String)
data class AuthResponse(val accessToken: String, val message: String?)

