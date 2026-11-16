package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Schema(title = "Register request", description = "Datos necesarios para registrar un usuario.")
@NoArgsConstructor
public class RegisterRequest
{
    @NotBlank(message = "El nombre es obligatorio.")
    @Size(min = 2, max = 40, message = "El nombre debe tener entre 2 y 40 caracteres.")
    @Schema(description = "Nombre de usuario", example = "Carlos Perez")
    private String name;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Pattern(regexp = "^\\d{9}$", message = "El teléfono debe tener exactamente 9 dígitos.")
    @Schema(description = "Telefono", example = "9 1234 5678")
    private String phone;

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Correo electrónico inválido.")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres.")
    @Schema(description = "Correo electrónico", example = "Patito01@gmail.com")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres.")
    @Schema(description = "Contraseña", example = "Patito01!")
    private String password;
}