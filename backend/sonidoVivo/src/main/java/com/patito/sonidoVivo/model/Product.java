package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "productos")
@Getter 
@Setter 
public class Product 
{

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El código del producto es obligatorio.")
    @Column(nullable = false, unique = true, length = 30, updatable = false)
    private String code;

    @NotBlank(message = "El nombre del producto es obligatorio.")
    @Size(max = 70, message = "El nombre del producto no debe superar los 70 caracteres.")
    @Column(nullable = false, length = 70)
    private String name;

    @NotBlank(message = "El modelo del producto es obligatorio.")
    @Column(nullable = false, length = 70)
    private String model;

    @NotBlank(message = "La descripción del producto es obligatoria")
    @Column(nullable = false, length = 400)
    private String description;

    @NotNull(message = "El precio es obligatorio.")
    @Column(nullable = false)
    private Long price;

    @NotNull(message = "El stock no puede ser negativo.")
    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean featured = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updateAt;

    @PrePersist
    protected void onCreate()
    {
        this.createdAt = LocalDateTime.now();
        this.updateAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() 
    {
        this.updateAt = LocalDateTime.now();
    }

}
