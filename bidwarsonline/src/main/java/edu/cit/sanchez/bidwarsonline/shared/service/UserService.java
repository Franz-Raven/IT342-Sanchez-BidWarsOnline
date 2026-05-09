package edu.cit.sanchez.bidwarsonline.shared.service;

import edu.cit.sanchez.bidwarsonline.shared.entity.User;
import edu.cit.sanchez.bidwarsonline.shared.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public UserDetails loadUserById(String userId) {
        User user = findById(Long.parseLong(userId));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                "[PROTECTED]",
                getAuthorities(user.getRole())
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(String role) {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }
}



