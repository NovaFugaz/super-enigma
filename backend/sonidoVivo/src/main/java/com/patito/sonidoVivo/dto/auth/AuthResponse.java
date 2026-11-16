package com.patito.sonidoVivo.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
@Schema(title = "Auth response", description = "Respuesta tras una autenticación exitosa")
@AllArgsConstructor 
public class AuthResponse 
{
    @Schema(description = "Token de acceso JWT", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;

    @Schema(description = "Tipo de esquema de autenticación", example = "Bearer")
    private String tokenType;

    @Schema(description = "Tiempo de validez del token", example = "60")
    private Long expiresInSeconds;

    @Schema(description = "Identificador único del usuario", example = "1")
    private Long id;

    @Schema(description = "Nombre de usuario.", example = "Carlos Pérez")
    private String name;

    @Schema(description = "Telefono", example = "9 1234 5678")
    private String phone;

    @Schema(description = "Correo electrónico", example = "Patito01@gmail.com")
    private String email;

    @Schema(description = "Rol o perfil de permisos asignado al usuario.",example = "ROLE_USER")
    private String role;

    @Schema(description = "Cuenta del usuario se encuentra activa y habilitada.",example = "true")
    private Boolean active;
}
