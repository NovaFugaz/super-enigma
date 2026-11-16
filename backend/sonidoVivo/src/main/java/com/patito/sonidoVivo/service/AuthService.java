package com.patito.sonidoVivo.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.dto.auth.AuthResponse;
import com.patito.sonidoVivo.dto.auth.LoginRequest;
import com.patito.sonidoVivo.dto.auth.RegisterRequest;
import com.patito.sonidoVivo.dto.auth.ResetPasswordRequest;
import com.patito.sonidoVivo.dto.auth.UserResponse;
import com.patito.sonidoVivo.enums.UserRole;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    @Value("${app.jwt.issuer}")
    private String issuer;

    @Value("${app.jwt.expiration-minutes}")
    private long expirationMinutes;

    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
        }

        User user = new User();
        user.setUsername(request.getName());
        user.setPhone(request.getPhone());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRol(UserRole.CUSTOMER);  

        return UserService.toResponse(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos."));

        if (!user.getActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu cuenta está desactivada.");
        }

        Instant now = Instant.now();
        long seconds = expirationMinutes * 60;

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(seconds))
                .subject(String.valueOf(user.getId()))
                .claim("roles", List.of(user.getRol().name())) 
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)
        ).getTokenValue();

        return new AuthResponse(token, "Bearer", seconds, user.getId(), user.getUsername(),
                user.getPhone(), user.getEmail(), user.getRol().name(), user.getActive());
    }

    public UserResponse me(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
        return UserService.toResponse(user);
    }

    public void forgotPassword(String email) {
        userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetTokenHash(sha256(token));  
            user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
            userRepository.save(user);

            log.info("Token de recuperación para {}: {}", user.getEmail(), token);
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetTokenHash(sha256(request.getToken()))
                .filter(u -> u.getResetTokenExpiresAt() != null
                        && u.getResetTokenExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "El token es inválido o expiró."));

        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setResetTokenHash(null);  
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    private String sha256(String text) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}                 