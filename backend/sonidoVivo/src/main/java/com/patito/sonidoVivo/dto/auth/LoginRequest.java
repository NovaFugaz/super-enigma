package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(title = "Login Request", description = "Datos necesarios para el inicio de sesión")
public record LoginRequest(

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Schema(description = "Correo electrónico", example = "Cliente01@gmail.com")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Schema(description = "Contraseña", example = "Cliente01!")
        String password
) {}