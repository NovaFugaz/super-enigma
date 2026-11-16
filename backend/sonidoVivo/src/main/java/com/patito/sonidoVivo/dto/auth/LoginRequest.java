package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@Schema 
public class LoginRequest 
{
    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Correo electrónico inválido.")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    private String password;
}