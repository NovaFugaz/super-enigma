package com.patito.sonidoVivo.dto.auth;


import com.patito.sonidoVivo.dto.common.Patterns;

import jakarta.validation.constraints.*;

public record RegisterRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String name,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = Patterns.PHONE_CL,
                 message = "Ingresa un celular chileno válido (ej: +56 9 1234 5678)")
        @Size(max = 15, message = "El teléfono no puede superar los 15 caracteres")
        String phone,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 120, message = "El correo no puede superar los 120 caracteres")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        String password
) {}