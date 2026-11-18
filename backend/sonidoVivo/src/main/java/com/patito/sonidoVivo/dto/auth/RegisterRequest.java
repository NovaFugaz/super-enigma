package com.patito.sonidoVivo.dto.auth;


import com.patito.sonidoVivo.dto.common.Patterns;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

public record RegisterRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        @Schema(description = "Nombre de usuario", example = "Alan Brito")
        String name,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = Patterns.PHONE_CL,
                 message = "Ingrese un número de celular válido")
        @Size(max = 15, message = "El teléfono no puede superar los 15 caracteres")
        @Schema(description = "Teléfono", example = "+56 9 1234 5678")
        String phone,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 120, message = "El correo no puede superar los 120 caracteres")
        @Schema(description = "Correo electrónico", example = "Cliente01@gmail.com")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        @Schema(description = "Contraseña", example = "Cliente01!")
        String password
) {}