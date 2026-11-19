package com.patito.sonidoVivo.dto.usuario;

import com.patito.sonidoVivo.dto.common.Patterns;
import com.patito.sonidoVivo.enums.Role;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(title = "User Update Request", description = "Datos necesarios para actualizar un usuario")
public record UserUpdateRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        @Schema(description = "Nombre de usuario", example = "Alan Brito")
        String name,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = Patterns.PHONE_CL,
                 message = "Ingresa un celular chileno válido (ej: +56 9 1234 5678)")
        @Size(max = 15, message = "El teléfono no puede superar los 15 caracteres")
        @Schema(description = "Teléfono", example = "+56 9 1234 5678")
        String phone,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 120, message = "El correo no puede superar los 120 caracteres")
        @Schema(description = "Correo electrónico", example = "Cliente01@gmail.com")
        String email,

        @NotNull(message = "El rol es obligatorio")
        @Schema(description = "Rol asignado al usuario", example = "SELLER", allowableValues = "CUSTOMER/ADMIN/SELLER")
        Role role,

        @NotNull(message = "Debes indicar si el usuario está activo")
        @Schema(description = "Estado de un usuario", example = "true")
        Boolean active
) {}
