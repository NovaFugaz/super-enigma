package com.patito.sonidoVivo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @NotBlank(message = "El código es obligatorio")
    @Pattern(regexp = "^[A-Z0-9-]+$",
             message = "El código solo admite mayúsculas, números y guiones")
    @Size(max = 20, message = "El código no puede superar los 20 caracteres")
    @Column(length = 20)
    private String code;

    @NotNull(message = "La categoría es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_slug", nullable = false)
    private Category category;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre no puede superar los 120 caracteres")
    @Column(nullable = false, length = 120)
    private String name;

    @Size(max = 60, message = "La marca no puede superar los 60 caracteres")
    @Column(length = 60)
    private String brand;

    @Size(max = 60, message = "El modelo no puede superar los 60 caracteres")
    @Column(length = 60)
    private String model;

    @NotNull(message = "El precio es obligatorio")
    @PositiveOrZero(message = "El precio no puede ser negativo")
    @Column(nullable = false)
    private Integer price;

    @NotNull(message = "El stock es obligatorio")
    @PositiveOrZero(message = "El stock no puede ser negativo")
    @Column(nullable = false)
    private Integer stock;

    @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
    @Column(length = 500)
    private String description;

    @Size(max = 255, message = "La imagen no puede superar los 255 caracteres")
    private String image;

    @Column(nullable = false)
    private boolean active = true;
}