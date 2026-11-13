package com.patito.sonidoVivo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "categorias")
@Getter
@Setter
public class Category
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El slug de la categoría es obligatorio.")
    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @NotBlank(message = "El nombre de la categoría es obligatorio.")
    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 250)
    private String description;

    private String imageUrl;

}