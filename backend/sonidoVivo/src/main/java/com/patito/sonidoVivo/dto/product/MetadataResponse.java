package com.patito.sonidoVivo.dto.product;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter 
@AllArgsConstructor 
@NoArgsConstructor 
public class MetadataResponse {
    private Long id;
    private String slug;
    private String name;
    private String description;
    private String imageUrl;
}
