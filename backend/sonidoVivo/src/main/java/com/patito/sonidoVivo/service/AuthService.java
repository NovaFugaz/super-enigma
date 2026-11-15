package com.patito.sonidoVivo.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.patito.sonidoVivo.dto.AuthResponse;
import com.patito.sonidoVivo.dto.LoginRequest;
import com.patito.sonidoVivo.dto.RegisterRequest;
import com.patito.sonidoVivo.dto.UserResponse;
import com.patito.sonidoVivo.enums.UserRole;
import com.patito.sonidoVivo.exception.BadRequestException;
import com.patito.sonidoVivo.exception.InvalidCredentialsException;
import com.patito.sonidoVivo.exception.UnauthorizedException;
import com.patito.sonidoVivo.exception.UserAlreadyExistsException;
import com.patito.sonidoVivo.mapper.UserMapper;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final UserMapper userMapper;

    @Value("${app.jwt.issuer}")
    private String issuer;

    @Value("${app.jwt.expiration-minutes}")
    private long expirationMinutes;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.reset-token.expiration-minutes:30}")
    private long resetTokenMinutes;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(email);
        }

        User user = new User();
        user.setUsername(request.getName().trim());
        user.setPhone(request.getPhone());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRol(UserRole.CUSTOMER);
        user.setActive(true);

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            throw new UserAlreadyExistsException(email);
        }

        return buildResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .filter(User::getActive)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);

        return buildResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        User user = userRepository.findById(userId)
                .filter(User::getActive)
                .orElseThrow(() -> new UnauthorizedException("Tu sesión ya no es válida. Inicia sesión nuevamente."));
        return userMapper.toResponse(user);
    }

    @Transactional
    public void forgotPassword(String rawEmail) {
        userRepository.findByEmail(normalizeEmail(rawEmail))
                .filter(User::getActive)
                .ifPresent(user -> {
                    String token = generateToken();
                    user.setResetTokenHash(sha256(token));
                    user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(resetTokenMinutes));
                    userRepository.save(user);
                    sendResetToken(user, token);
                });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetTokenHash(sha256(token.trim()))
                .filter(u -> u.getResetTokenExpiresAt() != null
                        && u.getResetTokenExpiresAt().isAfter(LocalDateTime.now()))
                .filter(User::getActive)
                .orElseThrow(() -> new BadRequestException("El enlace de recuperación es inválido o expiró."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetTokenHash(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
    }

    private void sendResetToken(User user, String token) {
        log.info("Recuperación de contraseña para {}: {}/recuperar?token={} (válido {} min)",
                user.getEmail(), frontendUrl, token, resetTokenMinutes);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private AuthResponse buildResponse(User user) {
        Instant now = Instant.now();
        Duration ttl = Duration.ofMinutes(expirationMinutes);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plus(ttl))
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("roles", List.of(user.getRol().name()))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new AuthResponse(
                token,
                "Bearer",
                ttl.toSeconds(),
                user.getId(),
                user.getUsername(),
                user.getPhone(),
                user.getEmail(),
                user.getRol().name().toLowerCase(Locale.ROOT),
                user.getActive());
    }
}