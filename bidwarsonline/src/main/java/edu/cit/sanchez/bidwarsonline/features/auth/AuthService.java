package edu.cit.sanchez.bidwarsonline.features.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import edu.cit.sanchez.bidwarsonline.shared.entity.User;
import edu.cit.sanchez.bidwarsonline.features.wallet.Wallet;
import edu.cit.sanchez.bidwarsonline.shared.repository.UserRepository;
import edu.cit.sanchez.bidwarsonline.features.wallet.WalletRepository;
import edu.cit.sanchez.bidwarsonline.features.auth.dto.AuthResponse;
import edu.cit.sanchez.bidwarsonline.features.auth.dto.LoginRequest;
import edu.cit.sanchez.bidwarsonline.features.auth.dto.RegisterRequest;
import edu.cit.sanchez.bidwarsonline.shared.security.JwtService;

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
    private final JwtService jwtService;

    public AuthService(RestTemplate restTemplate,
                       PasswordEncoder passwordEncoder,
                       UserRepository userRepository,
                       WalletRepository walletRepository,
                       JwtService jwtService) {
        this.restTemplate = restTemplate;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.jwtService = jwtService;
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

            Wallet newWallet = new Wallet(savedUser, new BigDecimal("100000"), "USD");
            walletRepository.save(newWallet);

            String jwtToken = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getUsername());
            return new AuthResponse(jwtToken, request.getEmail(), request.getUsername(), "Registration successful");
        }

        throw new RuntimeException("Registration failed");
    }

    public AuthResponse loginUser(LoginRequest request) {
        // First try local authentication
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found locally"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid password");
            }

            String jwtToken = jwtService.generateToken(user.getId(), user.getEmail(), user.getUsername());
            return new AuthResponse(jwtToken, user.getEmail(), user.getUsername(), "Login successful");
        } catch (RuntimeException e) {
            // Fall back to Supabase authentication if local auth fails
            return loginUserViaSupabase(request);
        }
    }

    private AuthResponse loginUserViaSupabase(LoginRequest request) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";

        Map<String, Object> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, createHeaders());

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            String supabaseToken = response.getBody().get("access_token").toString();

            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user == null) {
                String hashedPassword = passwordEncoder.encode(request.getPassword());
                user = new User(
                        request.getEmail(),
                        hashedPassword,
                        request.getUsername() != null ? request.getUsername() : "",
                        "PLAYER",
                        "ACTIVE"
                );
                user = userRepository.save(user);

                // Create wallet
                Wallet wallet = new Wallet(user, new BigDecimal("100000"), "USD");
                walletRepository.save(wallet);
            }

            // Generate our own JWT
            String jwtToken = jwtService.generateToken(user.getId(), user.getEmail(), user.getUsername());
            return new AuthResponse(jwtToken, user.getEmail(), user.getUsername(), "Login successful");
        }

        throw new RuntimeException("Invalid email or password");
    }


    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        headers.set("Authorization", "Bearer " + supabaseKey);
        return headers;
    }
}




