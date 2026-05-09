package edu.cit.sanchez.bidwarsonline.features.auth.dto;

public class AuthResponse {
    private String accessToken;
    private String userEmail;
    private String username;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String accessToken, String userEmail, String username, String message) {
        this.accessToken = accessToken;
        this.userEmail = userEmail;
        this.username = username;
        this.message = message;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}




