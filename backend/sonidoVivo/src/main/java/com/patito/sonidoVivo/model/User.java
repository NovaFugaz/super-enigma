package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import com.patito.sonidoVivo.enums.UserRole;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Entity 
@Table(name = "usuarios")
@Data
public class User {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(max = 40, message = "El nombre de usuario no puede superar los 100 caracteres.")
    private String username;

    @NotBlank(message = "El número de télefono es obligatorio")
    @Column(nullable = false, length = 10)
    private String phone;

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Correo electrónico invalido.")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    private String passwordHash;
    private UserRole rol;
    private Boolean active = true;
    private LocalDateTime createdAt;
    private LocalDateTime updateAt;
    private String token;
    private String resetTokenHash;
    private LocalDateTime resetTokenExpiresAt;
    
}
