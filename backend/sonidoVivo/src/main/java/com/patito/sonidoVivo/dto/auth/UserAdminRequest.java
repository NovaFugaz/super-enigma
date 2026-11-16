package com.patito.sonidoVivo.dto.auth;

import com.patito.sonidoVivo.enums.UserRole;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserAdminRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
    private String name;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico es inválido")
    @Size(max = 150, message = "El correo no puede superar los 150 caracteres")
    private String email;

    @Size(max = 30, message = "El teléfono no puede superar los 30 caracteres")
    private String phone;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private UserRole role;

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean active;
}
