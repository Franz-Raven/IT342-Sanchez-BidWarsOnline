package com.example.bidwarsonline.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("/api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
}

object ApiClient {
    private const val BASE_URL = "http://10.0.2.2:8080" // emulator access to localhost backend

    val authApi: AuthApi by lazy {
        val logging = okhttp3.logging.HttpLoggingInterceptor().apply {
            setLevel(okhttp3.logging.HttpLoggingInterceptor.Level.BODY)
        }

        val client = okhttp3.OkHttpClient.Builder()
            .addInterceptor(logging)
            .build()

        retrofit2.Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(retrofit2.converter.gson.GsonConverterFactory.create())
            .client(client)
            .build()
            .create(AuthApi::class.java)
    }
}
