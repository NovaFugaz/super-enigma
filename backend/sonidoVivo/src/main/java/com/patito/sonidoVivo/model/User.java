package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import com.patito.sonidoVivo.enums.UserRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name = "usuarios")
@Getter 
@Setter
public class User 
{

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de usuario es obligatorio.")
    @Size(max = 40, message = "El nombre de usuario no puede superar los 40 caracteres.")
    @Column(nullable = false, length = 40)
    private String username;

    @NotBlank(message = "El número de télefono es obligatorio")
    @Column(nullable = false, length = 9)
    private String phone;

    @NotBlank(message = "El correo electrónico es obligatorio.")
    @Email(message = "Correo electrónico inválido.")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole rol;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updateAt;

    private String token;

    @Column(name = "reset_token_hash")
    private String resetTokenHash;

    @Column(name = "reset_token_expires_at")
    private LocalDateTime resetTokenExpiresAt;

    @PrePersist
    protected void onCreate() 
    {
        this.createdAt = LocalDateTime.now();
        this.updateAt = LocalDateTime.now();

    }

    @PreUpdate
    protected void onUpdate() 
    {
        this.updateAt = LocalDateTime.now();
    }
    
}
