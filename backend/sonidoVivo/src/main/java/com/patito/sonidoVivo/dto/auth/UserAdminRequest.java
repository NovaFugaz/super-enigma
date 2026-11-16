package com.patito.sonidoVivo.dto.auth;

import com.patito.sonidoVivo.enums.UserRole;

import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema(description = "Nombre de usuario", example = "Carlos Perez")
    private String name;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El formato del correo electrónico es inválido")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
    @Schema(description = "Correo electrónico", example = "Patito01@gmail.com")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Pattern(regexp = "^\\d{9}$", message = "El teléfono debe tener 9 dígitos.")
    @Schema(description = "Telefono", example = "9 1234 5678")
    private String phone;

    @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
    @Schema(description = "Contraseña", example = "Patito01!")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    @Schema(description = "Rol o perfil de permisos asignado al usuario.",example = "ROLE_USER")
    private UserRole role;

    @NotNull(message = "El estado activo es obligatorio")
    @Schema(description = "Cuenta del usuario se encuentra activa y habilitada.",example = "true")
    private Boolean active;
}
