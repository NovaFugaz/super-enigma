package com.patito.sonidoVivo.dto.auth;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(title = "User Response")
@AllArgsConstructor 
public class UserResponse 
{

    @Schema(description = "Identificador único del usuario.",example = "42")
    private Long id;

    @Schema(description = "Nombre de usuario", example = "Carlos Perez")
    private String name;

    @Schema(description = "Telefono", example = "9 1234 5678")
    private String phone;

    @Schema(description = "Correo electrónico", example = "Patito01@gmail.com")
    private String email;

    @Schema(description = "Rol o perfil de permisos asignado al usuario.",example = "ROLE_USER")
    private String role;

    @Schema(description = "Cuenta del usuario se encuentra activa y habilitada.",example = "true")
    private Boolean active;

    @Schema(description = "Fecha y hora exacta en que se creó el registro del usuario.", example = "2026-11-16T11:55:00")
    private LocalDateTime createdAt;
}