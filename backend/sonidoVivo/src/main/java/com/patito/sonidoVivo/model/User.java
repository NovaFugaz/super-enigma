package com.patito.sonidoVivo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.patito.sonidoVivo.enums.Role;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users",
       uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^(\\+?56)?\\s?9\\s?\\d{4}\\s?\\d{4}$",
             message = "Ingresa un celular chileno válido (ej: +56 9 1234 5678)")
    @Size(max = 15, message = "El teléfono no puede superar los 15 caracteres")
    @Column(length = 12)
    private String phone;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 120, message = "El correo no puede superar los 120 caracteres")
    @Column(nullable = false, length = 120)
    private String email;

    @JsonIgnore
    @NotBlank(message = "La contraseña es obligatoria")
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @NotNull(message = "El rol es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.CUSTOMER;

    @Column(nullable = false)
    private boolean active = true;

    @PrePersist
    @PreUpdate
    private void normalize() {
        if (email != null) email = email.trim().toLowerCase();
        if (name != null) name = name.trim();
        if (phone != null) {
            String digits = phone.replaceAll("\\D", "");
            if (digits.length() == 9) digits = "56" + digits;
            phone = "+" + digits;   // siempre queda +569XXXXXXXX
        }
    }
}