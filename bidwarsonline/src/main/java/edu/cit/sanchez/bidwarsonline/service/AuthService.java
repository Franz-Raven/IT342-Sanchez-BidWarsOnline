package edu.cit.sanchez.bidwarsonline.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import edu.cit.sanchez.bidwarsonline.entity.User;
import edu.cit.sanchez.bidwarsonline.entity.Wallet;
import edu.cit.sanchez.bidwarsonline.repository.UserRepository;
import edu.cit.sanchez.bidwarsonline.repository.WalletRepository;
import edu.cit.sanchez.bidwarsonline.dto.AuthResponse;
import edu.cit.sanchez.bidwarsonline.dto.LoginRequest;
import edu.cit.sanchez.bidwarsonline.dto.RegisterRequest;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    public AuthService(RestTemplate restTemplate, PasswordEncoder passwordEncoder, UserRepository userRepository, WalletRepository walletRepository) {
        this.restTemplate = restTemplate;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        String url = supabaseUrl + "/auth/v1/signup";

        Map<String, Object> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());
        
        Map<String, String> data = new HashMap<>();
        data.put("username", request.getUsername());
        body.put("data", data);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, createHeaders());

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            String hashedPassword = passwordEncoder.encode(request.getPassword());
            User newUser = new User(
                    request.getEmail(),
                    hashedPassword,
                    request.getUsername(),
                    "PLAYER",
                    "ACTIVE"
            );
            User savedUser = userRepository.save(newUser);

            Wallet newWallet = new Wallet(savedUser, BigDecimal.ZERO, "USD");
            walletRepository.save(newWallet);

            Map<String, Object> responseBody = response.getBody();
            String token = responseBody != null && responseBody.containsKey("access_token") ? 
                    responseBody.get("access_token").toString() : null;

            return new AuthResponse(token, request.getEmail(), request.getUsername(), "Registration successful");
        }

        throw new RuntimeException("Registration failed");
    }

    public AuthResponse loginUser(LoginRequest request) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";

        Map<String, Object> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, createHeaders());

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            String token = response.getBody().get("access_token").toString();
            String username = userRepository.findByEmail(request.getEmail())
                    .map(User::getUsername)
                    .orElse("");
            return new AuthResponse(token, request.getEmail(), username, "Login successful");
        }

        throw new RuntimeException("Login failed");
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        return headers;
    }
}