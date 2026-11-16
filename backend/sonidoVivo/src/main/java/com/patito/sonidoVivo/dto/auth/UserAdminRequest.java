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
    @Size(max = 40, message = "El nombre no puede superar los 40 caracteres")
    private String name;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico es inválido")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Pattern(regexp = "^\\d{9}$", message = "El teléfono debe tener 9 dígitos.")
    private String phone;

    @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private UserRole role;

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean active;
}
