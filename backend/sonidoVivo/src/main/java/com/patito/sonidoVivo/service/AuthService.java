package com.patito.sonidoVivo.service;

import com.patito.sonidoVivo.dto.auth.AuthResponse;
import com.patito.sonidoVivo.dto.auth.LoginRequest;
import com.patito.sonidoVivo.dto.auth.RegisterRequest;
import com.patito.sonidoVivo.dto.usuario.UserResponse;
import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.model.User;
import com.patito.sonidoVivo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final UserService userService;
    private final PasswordEncoder encoder;
    private final TokenService tokens;

    @Transactional
    public AuthResponse register(RegisterRequest r) {
        User u = userService.createUser(r.name(), r.phone(), r.email(), r.password(), Role.CUSTOMER);
        return toResponse(u);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest r) {
        User u = users.findByEmail(r.email().trim().toLowerCase())
                .filter(found -> encoder.matches(r.password(), found.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));

        if (!u.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La cuenta está desactivada");
        }
        return toResponse(u);
    }

    private AuthResponse toResponse(User u) {
        return AuthResponse.bearer(tokens.generate(u), tokens.expiresInMs(), UserResponse.from(u));
    }
}