package com.patito.sonidoVivo.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @Size(max = 30, message = "El código no puede superar los 30 caracteres.")
    @Column(nullable = false, unique = true, length = 30, updatable = false)
    private String code;

    @NotBlank(message = "El nombre del producto es obligatorio.")
    @Size(max = 70, message = "El nombre del producto no debe superar los 70 caracteres.")
    @Column(nullable = false, length = 70)
    private String name;

    @Size(max = 70, message = "La marca no debe superar los 70 caracteres.")
    @Column(length = 70)
    private String brand;

    @NotBlank(message = "El modelo del producto es obligatorio.")
    @Size(max = 70, message = "El modelo no debe superar los 70 caracteres.")
    @Column(nullable = false, length = 70)
    private String model;

    @NotBlank(message = "La descripción del producto es obligatoria.")
    @Size(max = 400, message = "La descripción no debe superar los 400 caracteres.")
    @Column(nullable = false, length = 400)
    private String description;

    @NotNull(message = "La categoría es obligatoria.")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @NotNull(message = "El precio es obligatorio.")
    @Positive(message = "El precio debe ser mayor a 0.")
    @Column(nullable = false)
    private Long price;

    @Positive(message = "El precio con descuento debe ser mayor a 0.")
    private Long discountPrice;

    @NotNull(message = "El stock es obligatorio.")
    @Min(value = 0, message = "El stock no puede ser negativo.")
    @Column(nullable = false)
    private Integer stock = 0;

    @Version
    private Long version;

    private String imageUrl;

    @Column(length = 1000)
    private String galleryUrls;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}