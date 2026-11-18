package com.patito.sonidoVivo.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import com.patito.sonidoVivo.dto.catalogo.ProductRequest;
import com.patito.sonidoVivo.dto.catalogo.ProductResponse;
import com.patito.sonidoVivo.dto.catalogo.ProductoActualizarRequest;
import com.patito.sonidoVivo.dto.catalogo.StockRequest;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.repository.CategoryRepository;
import com.patito.sonidoVivo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class ProductService {
    
    private final ProductRepository products;
    private final CategoryRepository categories;

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive(String categorySlug) {
        List<Product> result;

        if (categorySlug == null || categorySlug.isBlank()) {
            result = products.findAllByActiveTrueOrderByNameAsc();
        } else {
            result = products.findAllByCategory_SlugAndActiveTrueOrderByNameAsc(
                    categorySlug.trim());
        }

        return result.stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findActiveByCode(String code) {
        Product product = products.findById(normalizeCode(code))
                .filter(Product::isActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));

        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        String code = normalizeCode(request.code());

        if (products.existsById(code)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "El código del producto ya existe");
        }

        Category category = findCategoryOrThrow(request.category());

        Product product = new Product();
        product.setCode(code);
        product.setCategory(category);
        product.setName(request.name());
        product.setBrand(request.brand());
        product.setModel(request.model());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setDescription(request.description());
        product.setImage(request.image());
        product.setActive(request.active() == null || request.active());

        return ProductResponse.from(products.save(product));
    }

    @Transactional
    public ProductResponse update(String code, ProductoActualizarRequest request) {
        Product product = findByCodeOrThrow(code);
        Category category = findCategoryOrThrow(request.categoriaSlug());

        product.setCategory(category);
        product.setName(request.nombre());
        product.setBrand(request.marca());
        product.setModel(request.modelo());
        product.setPrice(request.precio());
        product.setStock(request.stock());
        product.setDescription(request.descripcion());
        product.setImage(request.imagen());
        product.setActive(request.activo());

        return ProductResponse.from(products.save(product));
    }

    @Transactional
    public ProductResponse updateStock(String code, StockRequest request) {
        Product product = findByCodeOrThrow(code);
        product.setStock(request.stock());

        return ProductResponse.from(products.save(product));
    }

    @Transactional
    public void deactivate(String code) {
        Product product = findByCodeOrThrow(code);
        product.setActive(false);
        products.save(product);
    }

    private Product findByCodeOrThrow(String code) {
        return products.findById(normalizeCode(code))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private Category findCategoryOrThrow(String slug) {
        return categories.findById(slug.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }
}

