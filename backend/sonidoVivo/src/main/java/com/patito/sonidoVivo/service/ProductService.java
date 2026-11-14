package com.patito.sonidoVivo.service;

import java.util.List;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.patito.sonidoVivo.dto.ProductRequest;
import com.patito.sonidoVivo.dto.ProductResponse;
import com.patito.sonidoVivo.exception.ConflictException;
import com.patito.sonidoVivo.exception.ResourceNotFoundException;
import com.patito.sonidoVivo.mapper.ProductMapper;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.repository.CategoryRepository;
import com.patito.sonidoVivo.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive(Long categoryId, String categorySlug, Boolean featured) {
        List<Product> products;
        if (categorySlug != null && !categorySlug.isBlank()) {
            products = productRepository
                    .findByActiveTrueAndCategorySlug(categorySlug.trim().toLowerCase(Locale.ROOT));
        } else if (categoryId != null) {
            products = productRepository.findByActiveTrueAndCategoryId(categoryId);
        } else if (Boolean.TRUE.equals(featured)) {
            products = productRepository.findByActiveTrueAndFeaturedTrue();
        } else {
            products = productRepository.findByActiveTrue();
        }
        return products.stream().map(productMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findActiveById(Long id) {
        Product product = getProduct(id);
        if (!Boolean.TRUE.equals(product.getActive())) {
            throw notFound(id);
        }
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse findActiveByCode(String code) {
        String normalized = normalizeCode(code);
        return productRepository.findByCodeAndActiveTrue(normalized)
                .map(productMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Producto no encontrado con código: " + normalized));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream().map(productMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return productMapper.toResponse(getProduct(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        String code = normalizeCode(request.getCode());

        if (productRepository.existsByCode(code)) {
            throw new ConflictException("Ya existe un producto con el código: " + code);
        }

        Product product = new Product();
        product.setCode(code);
        applyRequest(product, request);

        try {
            return productMapper.toResponse(productRepository.saveAndFlush(product));
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Ya existe un producto con el código: " + code);
        }
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getProduct(id);

        if (request.getVersion() != null && !request.getVersion().equals(product.getVersion())) {
            throw new ConflictException(
                    "El producto fue modificado por otra persona. Recarga e inténtalo de nuevo.");
        }

        applyRequest(product, request); 
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = getProduct(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product getProduct(Long id) {
        return productRepository.findById(id).orElseThrow(() -> notFound(id));
    }

    private ResourceNotFoundException notFound(Long id) {
        return new ResourceNotFoundException("Producto no encontrado con id: " + id);
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private void applyRequest(Product product, ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Categoría no encontrada con id: " + request.getCategoryId()));

        product.setName(request.getName().trim());
        product.setBrand(blankToNull(request.getBrand()));
        product.setModel(request.getModel().trim());
        product.setDescription(request.getDescription().trim());
        product.setCategory(category);
        product.setPrice(request.getPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setStock(request.getStock());
        product.setImageUrl(blankToNull(request.getImageUrl()));
        product.setGalleryUrls(blankToNull(request.getGalleryUrls()));
        product.setActive(request.isActive());
        product.setFeatured(request.isFeatured());
    }
}