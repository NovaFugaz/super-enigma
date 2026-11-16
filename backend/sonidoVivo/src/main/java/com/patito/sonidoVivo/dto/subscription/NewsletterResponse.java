package com.patito.sonidoVivo.dto.subscription;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class NewsletterResponse {
    private String message;
    private String email;
    private String unsubscribeToken;
}
