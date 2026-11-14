package com.patito.sonidoVivo.mapper;

import org.springframework.stereotype.Component;

import com.patito.sonidoVivo.dto.ProductResponse;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.model.Product;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setCode(p.getCode());
        r.setName(p.getName());
        r.setBrand(p.getBrand());
        r.setModel(p.getModel());
        r.setDescription(p.getDescription());

        Category c = p.getCategory();
        r.setCategoryId(c.getId());
        r.setCategorySlug(c.getSlug());
        r.setCategoryName(c.getName());

        r.setPrice(p.getPrice());
        r.setDiscountPrice(p.getDiscountPrice());
        r.setStock(p.getStock());
        r.setImageUrl(p.getImageUrl());
        r.setGalleryUrls(p.getGalleryUrls());
        r.setActive(p.getActive());
        r.setFeatured(p.getFeatured());
        r.setVersion(p.getVersion());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }
}