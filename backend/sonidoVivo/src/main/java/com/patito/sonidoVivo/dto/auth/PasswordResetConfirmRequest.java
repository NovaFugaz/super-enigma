package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(title = "Password Reset Confirmation", description = "Token de un solo uso y nueva contraseña")
public record PasswordResetConfirmRequest(
        @NotBlank(message = "El token es obligatorio")
        @Size(max = 64, message = "El token no es válido")
        String token,

        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String newPassword) {
}
