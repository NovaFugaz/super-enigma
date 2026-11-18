package com.patito.sonidoVivo.dto.auth;

import com.patito.sonidoVivo.dto.usuario.UserResponse;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "Auth Reponse", description = "Respuestas tras una autenticación exitosa")
public record AuthResponse(
        @Schema(description = "Token JWT", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..")
        String token,
        String type,

        @Schema(description = "Bearer")
        long expiresInMs,

        @Schema(description = "Información del usuario autenticado")
        UserResponse user
) {
    public static AuthResponse bearer(String token, long expiresInMs, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresInMs, user);
    }
}