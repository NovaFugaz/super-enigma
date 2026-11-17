package com.patito.sonidoVivo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {

    @Id
    @NotBlank(message = "El slug es obligatorio")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
             message = "El slug solo admite minúsculas, números y guiones")
    @Size(max = 60, message = "El slug no puede superar los 60 caracteres")
    @Column(length = 60)
    private String slug;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 80, message = "El nombre no puede superar los 80 caracteres")
    @Column(nullable = false, length = 80)
    private String name;

    @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
    private String description;

    @Size(max = 255, message = "La imagen no puede superar los 255 caracteres")
    private String image;
}