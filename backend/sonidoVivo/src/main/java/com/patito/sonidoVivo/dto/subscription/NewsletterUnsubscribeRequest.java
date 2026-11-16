package com.patito.sonidoVivo.dto.subscription;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class NewsletterUnsubscribeRequest {

    @NotBlank(message = "El token es obligatorio.")
    private String token;
}
