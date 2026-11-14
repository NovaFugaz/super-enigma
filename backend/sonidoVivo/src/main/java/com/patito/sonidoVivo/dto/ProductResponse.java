package com.patito.sonidoVivo.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema
public class ProductResponse 
{
    private Long id;
    private String code;
    private String name;
    private String brand;
    private String model;
    private String description;
    private Long categoryId;
    private String categorySlug;
    private String categoryName;
    private Long price;
    private Long discountPrice;
    private Integer stock;
    private String imageUrl;
    private String galleryUrls;
    private Boolean active;
    private Boolean featured;
    private Long version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}