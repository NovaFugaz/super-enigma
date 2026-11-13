package com.patito.sonidoVivo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@Schema 
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long expiresInSeconds;
    private String username;
    private String email;
    private String role;
}
