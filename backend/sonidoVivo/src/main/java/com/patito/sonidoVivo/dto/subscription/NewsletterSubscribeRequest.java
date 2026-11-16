package com.patito.sonidoVivo.dto.subscription;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor 
public class NewsletterSubscribeRequest {
    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Correo electrónico inválido.")
    private String email;
}
