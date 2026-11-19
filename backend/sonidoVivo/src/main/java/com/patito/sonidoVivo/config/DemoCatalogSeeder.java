package com.patito.sonidoVivo.config;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.patito.sonidoVivo.enums.LocationType;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.model.Location;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.repository.CategoryRepository;
import com.patito.sonidoVivo.repository.LocationRepository;
import com.patito.sonidoVivo.repository.ProductRepository;

@Service
public class DemoCatalogSeeder {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Resource seedResource;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final LocationRepository locations;

    public DemoCatalogSeeder(@Value("classpath:data/demo-catalog.json") Resource seedResource,
            CategoryRepository categories,
            ProductRepository products,
            LocationRepository locations) {
        this.seedResource = seedResource;
        this.categories = categories;
        this.products = products;
        this.locations = locations;
    }

    @Transactional
    public void seed() throws IOException {
        SeedData data;
        try (var input = seedResource.getInputStream()) {
            data = objectMapper.readValue(input, SeedData.class);
        }

        Map<String, Category> categoriesBySlug = new HashMap<>();
        for (CategorySeed seed : data.categories()) {
            Category category = categories.findById(seed.slug()).orElseGet(() -> {
                Category created = new Category();
                created.setSlug(seed.slug());
                created.setName(seed.name());
                created.setDescription(seed.description());
                created.setImage("");
                return categories.save(created);
            });
            categoriesBySlug.put(category.getSlug(), category);
        }

        for (ProductSeed seed : data.products()) {
            if (products.existsById(seed.code())) {
                continue;
            }
            Category category = categoriesBySlug.get(seed.category());
            if (category == null) {
                throw new IllegalStateException(
                        "El producto demo " + seed.code() + " referencia una categoría inexistente: " + seed.category());
            }

            Product product = new Product();
            product.setCode(seed.code());
            product.setCategory(category);
            product.setName(seed.name());
            product.setBrand(seed.brand());
            product.setModel(seed.model());
            product.setStock(seed.stock());
            product.setPrice(seed.price());
            product.setDescription(seed.description());
            product.setImage("");
            product.setActive(true);
            products.save(product);
        }

        for (LocationSeed seed : data.locations()) {
            if (locations.existsById(seed.id())) {
                continue;
            }
            Location location = new Location();
            location.setId(seed.id());
            location.setType(seed.type());
            location.setName(seed.name());
            location.setAddress(seed.address());
            location.setLatitude(BigDecimal.valueOf(seed.latitude()));
            location.setLongitude(BigDecimal.valueOf(seed.longitude()));
            location.setHours(seed.hours());
            location.setNote(seed.note());
            locations.save(location);
        }
    }

    private record SeedData(
            List<CategorySeed> categories,
            List<ProductSeed> products,
            List<LocationSeed> locations) {}

    private record CategorySeed(String slug, String name, String description) {}

    private record ProductSeed(String code, String category, String name, String brand,
            String model, int stock, int price, String description) {}

    private record LocationSeed(String id, LocationType type, String name, String address,
            double latitude, double longitude, String hours, String note) {}
}
