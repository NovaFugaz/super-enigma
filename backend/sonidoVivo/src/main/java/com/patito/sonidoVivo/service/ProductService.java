package com.patito.sonidoVivo.service;

import com.patito.sonidoVivo.dto.catalogo.ProductRequest;
import com.patito.sonidoVivo.dto.catalogo.ProductResponse;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.repository.CategoryRepository;
import com.patito.sonidoVivo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository products;
    private final CategoryRepository categories;

    @Transactional(readOnly = true)
    public List<ProductResponse> list(String category, String q, boolean includeInactive) {
        String cat = category == null ? "" : category.trim();
        String text = q == null ? "" : q.trim().toLowerCase();
        return products.search(cat, text, includeInactive).stream()
                .map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse get(String code, boolean includeInactive) {
        Product p = find(code);
        if (!p.isActive() && !includeInactive) throw notFound();
        return ProductResponse.from(p);
    }

    @Transactional
    public ProductResponse create(ProductRequest r) {
        if (products.existsById(r.code())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un producto con el código " + r.code());
        }
        Product p = new Product();
        p.setCode(r.code());
        apply(p, r);
        p.setActive(r.active() == null || r.active());
        return ProductResponse.from(products.saveAndFlush(p));
    }

    @Transactional
    public ProductResponse update(String code, ProductRequest r) {
        Product p = find(code);
        if (!p.getCode().equals(r.code())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El código del cuerpo no coincide con el de la URL");
        }
        apply(p, r);
        if (r.active() != null) p.setActive(r.active());
        return ProductResponse.from(products.saveAndFlush(p));
    }

    @Transactional
    public void deactivate(String code) {
        Product p = find(code);
        p.setActive(false);
        products.save(p);
    }

    @Transactional
    public ProductResponse updateStock(String code, int stock) {
        Product p = find(code);
        p.setStock(stock);
        return ProductResponse.from(products.saveAndFlush(p));
    }

    private Product find(String code) {
        return products.findWithCategory(code.trim().toUpperCase())
                .orElseThrow(this::notFound);
    }

    private void apply(Product p, ProductRequest r) {
        Category c = categories.findById(r.category()).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La categoría '" + r.category() + "' no existe"));
        p.setCategory(c);
        p.setName(r.name());
        p.setBrand(r.brand());
        p.setModel(r.model());
        p.setPrice(r.price());
        p.setStock(r.stock());
        p.setDescription(r.description());
        p.setImage(r.image());
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
    }
}