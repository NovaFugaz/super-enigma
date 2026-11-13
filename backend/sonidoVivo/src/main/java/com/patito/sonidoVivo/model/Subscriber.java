package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Entity 
@Table(name = "subcripciones")
@Getter 
@Setter 
public class Subscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email(message = "Correo electronico invalido.")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime subscribedAt;

        @PrePersist 
    protected void onCreate() 
    {
        this.subscribedAt = LocalDateTime.now();
    }
}
