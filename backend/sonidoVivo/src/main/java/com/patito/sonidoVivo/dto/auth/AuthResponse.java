package com.patito.sonidoVivo.dto.auth;

import com.patito.sonidoVivo.dto.usuario.UserResponse;

public record AuthResponse(
        String token,
        String type,
        long expiresInMs,
        UserResponse user
) {
    public static AuthResponse bearer(String token, long expiresInMs, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresInMs, user);
    }
}