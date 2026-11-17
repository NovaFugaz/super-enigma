package com.patito.sonidoVivo.dto.usuario;

import com.patito.sonidoVivo.enums.Role;
import com.patito.sonidoVivo.model.User;

public record UserResponse(
        Long id,
        String name,
        String phone,
        String email,
        Role role,
        boolean active
) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getPhone(),
                u.getEmail(), u.getRole(), u.isActive());
    }
}
