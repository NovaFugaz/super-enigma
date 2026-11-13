package com.patito.sonidoVivo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
@Schema
public class RegisterRequest
{
    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(max = 40, message = "El nombre de usuario no puede superar los 40 caracteres.")
    private String username;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Size(max = 9, message = "El teléfono no puede superar los 9 caracteres.")
    private String phone;

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Correo electrónico inválido.")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres.")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres.")
    private String password;
}

