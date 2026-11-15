package com.patito.sonidoVivo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.patito.sonidoVivo.dto.PageResponse;
import com.patito.sonidoVivo.dto.ProductRequest;
import com.patito.sonidoVivo.dto.ProductResponse;
import com.patito.sonidoVivo.exception.ConflictException;
import com.patito.sonidoVivo.exception.ResourceNotFoundException;
import com.patito.sonidoVivo.mapper.ProductMapper;
import com.patito.sonidoVivo.model.Category;
import com.patito.sonidoVivo.model.Product;
import com.patito.sonidoVivo.repository.CategoryRepository;
import com.patito.sonidoVivo.repository.ProductRepository;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final int CATALOG_PAGE_SIZE = 12;
    private static final int ADMIN_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchCatalog(String categoria, String q, List<String> marcas,
            Long min, Long max, boolean soloStock, String sort, int page, Integer size) {
        Specification<Product> spec = buildSpec(true, categoria, q, marcas, min, max, soloStock, sort);
        return toPage(productRepository.findAll(spec, pageable(page, size, CATALOG_PAGE_SIZE)));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findFeatured() {
        return productRepository.findByActiveTrueAndFeaturedTrueOrderByNameAsc().stream()
                .map(productMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<String> findBrands(String categoria) {
        if (categoria == null || categoria.isBlank()) {
            return productRepository.findActiveBrands();
        }
        return productRepository.findActiveBrandsByCategorySlug(categoria.trim().toLowerCase(Locale.ROOT));
    }

    @Transactional(readOnly = true)
    public ProductResponse findActiveByCode(String code) {
        String normalized = normalizeCode(code);
        return productRepository.findByCodeAndActiveTrue(normalized)
                .map(productMapper::toResponse)
                .orElseThrow(() -> notFound(normalized));
    }

    // admin


    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchAdmin(String q, int page, Integer size) {
        Specification<Product> spec = buildSpec(false, null, q, null, null, null, false, "nombre");
        return toPage(productRepository.findAll(spec, pageable(page, size, ADMIN_PAGE_SIZE)));
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
    public ProductResponse update(String code, ProductRequest request) {
        Product product = getByCode(code);

        if (request.getVersion() != null && !request.getVersion().equals(product.getVersion())) {
            throw new ConflictException(
                    "El producto fue modificado por otra persona. Recarga e inténtalo de nuevo.");
        }

        applyRequest(product, request);
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    @Transactional
    public ProductResponse setActive(String code, boolean active) {
        Product product = getByCode(code);
        product.setActive(active);
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    private Specification<Product> buildSpec(boolean onlyActive, String categoria, String q,
            List<String> marcas, Long min, Long max, boolean soloStock, String sort) {

        return (root, query, cb) -> {
            Expression<Long> effectivePrice = cb.coalesce(root.<Long>get("discountPrice"), root.<Long>get("price"));
            List<Predicate> predicates = new ArrayList<>();

            if (onlyActive) {
                predicates.add(cb.isTrue(root.get("active")));
            }
            if (categoria != null && !categoria.isBlank()) {
                predicates.add(cb.equal(root.get("category").get("slug"),
                        categoria.trim().toLowerCase(Locale.ROOT)));
            }
            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("name")), pattern),
                        cb.like(cb.lower(root.<String>get("brand")), pattern),
                        cb.like(cb.lower(root.<String>get("model")), pattern),
                        cb.like(cb.lower(root.<String>get("code")), pattern)));
            }
            if (marcas != null) {
                List<String> brands = marcas.stream()
                        .filter(b -> b != null && !b.isBlank())
                        .map(b -> b.trim().toLowerCase(Locale.ROOT))
                        .toList();
                if (!brands.isEmpty()) {
                    predicates.add(cb.lower(root.<String>get("brand")).in(brands));
                }
            }
            if (min != null) {
                predicates.add(cb.greaterThanOrEqualTo(effectivePrice, min));
            }
            if (max != null) {
                predicates.add(cb.lessThanOrEqualTo(effectivePrice, max));
            }
            if (soloStock) {
                predicates.add(cb.greaterThan(root.<Integer>get("stock"), 0));
            }

            if (query != null && !Long.class.equals(query.getResultType())
                    && !long.class.equals(query.getResultType())) {
                List<Order> orders = new ArrayList<>();
                switch (sort == null ? "" : sort.trim().toLowerCase(Locale.ROOT)) {
                    case "precio-asc" -> orders.add(cb.asc(effectivePrice));
                    case "precio-desc" -> orders.add(cb.desc(effectivePrice));
                    case "recientes" -> orders.add(cb.desc(root.get("createdAt")));
                    default -> orders.add(cb.asc(cb.lower(root.<String>get("name"))));
                }
                orders.add(cb.asc(root.get("id")));
                query.orderBy(orders);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private PageRequest pageable(int page, Integer size, int defaultSize) {
        int s = (size == null) ? defaultSize : Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(Math.max(page, 0), s);
    }

    private PageResponse<ProductResponse> toPage(Page<Product> result) {
        List<ProductResponse> content = result.getContent().stream().map(productMapper::toResponse).toList();
        return new PageResponse<>(content, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    private Product getByCode(String code) {
        String normalized = normalizeCode(code);
        return productRepository.findByCode(normalized).orElseThrow(() -> notFound(normalized));
    }

    private ResourceNotFoundException notFound(String code) {
        return new ResourceNotFoundException("Producto no encontrado con código: " + code);
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