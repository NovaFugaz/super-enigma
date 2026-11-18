package com.patito.sonidoVivo.dto.usuario;

import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.model.User;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(title = "User Response")
public record UserResponse(

        @Schema(description = "Id del usuario", example = "1")
        Long id,

        @Schema(description = "Nombre de usuario", example = "Alan Brito")
        String name,

        @Schema(description = "Teléfono", example = "+56 9 1234 5678")
        String phone,

        @Schema(description = "Correo electrónico", example = "Cliente01@gmail.com")
        String email,

        @Schema(description = "Rol del usuario", example = "CUSTOMER")
        Role role,

        @Schema(description = "Estado de un usuario", example = "active")
        boolean active
) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getPhone(),
                u.getEmail(), u.getRole(), u.isActive());
    }
}
