package com.patito.sonidoVivo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema
public class ProductRequest 
{

    @NotBlank(message = "El código del producto es obligatorio.")
    @Size(max = 30, message = "El código no puede superar los 30 caracteres.")
    @Schema(description = "Solo se usa al crear; en la edición se ignora (pero igual debe enviarse).")
    private String code;

    @NotBlank(message = "El nombre del producto es obligatorio.")
    @Size(max = 70, message = "El nombre del producto no debe superar los 70 caracteres.")
    private String name;

    @Size(max = 70, message = "La marca no debe superar los 70 caracteres.")
    private String brand;

    @NotBlank(message = "El modelo del producto es obligatorio.")
    @Size(max = 70, message = "El modelo no debe superar los 70 caracteres.")
    private String model;

    @NotBlank(message = "La descripción del producto es obligatoria.")
    @Size(max = 400, message = "La descripción no debe superar los 400 caracteres.")
    private String description;

    @NotNull(message = "La categoría es obligatoria.")
    private Long categoryId;

    @NotNull(message = "El precio es obligatorio.")
    @Positive(message = "El precio debe ser mayor a 0.")
    private Long price;

    @Positive(message = "El precio con descuento debe ser mayor a 0.")
    private Long discountPrice;

    @NotNull(message = "El stock es obligatorio.")
    @Min(value = 0, message = "El stock no puede ser negativo.")
    private Integer stock;

    @Size(max = 255, message = "La URL de la imagen no puede superar los 255 caracteres.")
    private String imageUrl;

    @Size(max = 1000, message = "Las URLs de la galería no pueden superar los 1000 caracteres.")
    private String galleryUrls;

    private boolean active = true;

    private boolean featured = false;

    @Schema(description = "Versión que devolvió el GET. Opcional: si se envía y no coincide, responde 409.")
    private Long version;

    @Schema(hidden = true)
    @AssertTrue(message = "El precio con descuento debe ser menor al precio normal.")
    public boolean isDiscountPriceValid() {
        return discountPrice == null || price == null || discountPrice < price;
    }
}