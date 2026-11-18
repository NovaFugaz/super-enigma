package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

public record ResetPasswordRequest(

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Schema(description = "Correo electrónico", example = "Cliente01@gmail.com")
        String email,

        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        @Schema(description = "Contraseña", example = "Cliente01!")
        String password
) {}