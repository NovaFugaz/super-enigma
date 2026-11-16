package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema
@NoArgsConstructor 
public class ForgotPasswordRequest
{
    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Correo electrónico inválido.")
    private String email;
}
