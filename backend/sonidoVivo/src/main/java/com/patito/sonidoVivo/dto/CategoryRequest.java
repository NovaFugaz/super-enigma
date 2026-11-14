package com.patito.sonidoVivo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter 
@Getter 
@Schema
public class CategoryRequest {
    @NotBlank(message = "El slug de la categoría es obligatorio.")
    @Size(max = 60, message = "El slug no puede superar los 60 caracteres.")
    private String slug;

    @NotBlank(message = "El nombre de la categoría es obligatorio.")
    @Size(max = 80, message = "El nombre no puede superar los 80 caracteres.")
    private String name;

    @Size(max = 150, message = "La descripción no puede superar los 150 caracteres.")
    private String description;

    @Size(max = 255, message = "La URL de la imagen no puede superar los 255 caracteres.")
    private String imageUrl;
}
