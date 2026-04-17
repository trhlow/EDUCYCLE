package com.educycle.listing.application.service.impl;

import com.educycle.shared.dto.common.PageResponse;
import com.educycle.listing.api.dto.request.AdminRejectProductRequest;
import com.educycle.listing.api.dto.request.CreateProductRequest;
import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.api.dto.request.UpdateProductRequest;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.listing.domain.Product;
import com.educycle.review.domain.Review;
import com.educycle.user.domain.User;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.review.infrastructure.persistence.ReviewRepository;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.user.infrastructure.persistence.UserRepository;
import com.educycle.listing.infrastructure.persistence.ProductSpecifications;
import com.educycle.notification.application.service.NotificationService;
import com.educycle.listing.application.service.ProductService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.educycle.shared.util.PrivacyHelper.maskUsername;

/**
 * Maps C# ProductService.cs
 *
 * Key differences:
 *  - JsonSerializer.Serialize/Deserialize  → Jackson ObjectMapper
 *  - products.Average(r => r.Rating)       → stream average
 *  - String.IsNullOrEmpty()                → String null/blank checks
 *  - Guid userId (from JWT claim)          → UUID userId passed by controller
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository      productRepository;
    private final ReviewRepository       reviewRepository;
    private final TransactionRepository  transactionRepository;
    private final UserRepository         userRepository;
    private final ObjectMapper         objectMapper;
    private final NotificationService  notificationService;

    // ===== CREATE =====

    @Override
    public ProductResponse create(CreateProductRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        String imageUrlsJson = serializeImageUrls(request.imageUrls());
        String primaryImage  = request.imageUrl() != null
                ? request.imageUrl()
                : (request.imageUrls() != null && !request.imageUrls().isEmpty()
                        ? request.imageUrls().get(0) : null);

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(primaryImage)
                .imageUrls(imageUrlsJson)
                .category(request.category())
                .condition(request.condition())
                .contactNote(request.contactNote())
                .user(user)
                .status(ProductStatus.PENDING)
                .build();

        productRepository.save(product);
        log.info("Product created: {} by user {}", product.getId(), userId);
        return mapToResponse(product, Collections.emptyList());
    }

    // ===== GET BY ID =====

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        List<Review> reviews = reviewRepository.findByProductId(id);
        return mapToResponse(product, reviews);
    }

    // ===== GET ALL (approved only — public) =====

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAll(
            Pageable pageable,
            String q,
            String category,
            BigDecimal priceMin,
            BigDecimal priceMax) {

        Specification<Product> spec = ProductSpecifications.publicCatalog(q, category, priceMin, priceMax);
        Page<Product> page = productRepository.findAll(spec, pageable);
        List<ProductResponse> content = mapAllWithReviews(page.getContent());
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    // ===== GET ALL FOR ADMIN (every status) =====

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllForAdmin() {
        return mapAllWithReviews(productRepository.findAllWithUser());
    }

    // ===== GET PENDING =====

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getPending() {
        return mapAllWithReviews(
                productRepository.findByStatusWithUser(ProductStatus.PENDING));
    }

    // ===== GET MY PRODUCTS =====

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getMyProducts(UUID userId, Pageable pageable) {
        Page<Product> page = productRepository.findByUser_Id(userId, pageable);
        List<ProductResponse> content = mapAllWithReviews(page.getContent());
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    // ===== UPDATE =====

    @Override
    public ProductResponse update(UUID id, UpdateProductRequest request, UUID userId) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        if (!product.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Bạn chỉ có thể chỉnh sửa sản phẩm của mình");
        }

        String primaryImage = request.imageUrl() != null
                ? request.imageUrl()
                : (request.imageUrls() != null && !request.imageUrls().isEmpty()
                        ? request.imageUrls().get(0) : null);

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(primaryImage);
        product.setImageUrls(serializeImageUrls(request.imageUrls()));
        product.setCategory(request.category());
        product.setCondition(request.condition());
        product.setContactNote(request.contactNote());
        product.setStatus(ProductStatus.PENDING); // reset to pending on edit
        product.setRejectReason(null);

        productRepository.save(product);
        return mapToResponse(product, Collections.emptyList());
    }

    // ===== DELETE =====

    @Override
    public void delete(UUID id, UUID userId) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        if (!product.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Bạn chỉ có thể xóa sản phẩm của mình");
        }

        if (transactionRepository.existsByProduct_Id(id)) {
            throw new BadRequestException("Không thể xóa sản phẩm đã có giao dịch liên quan.");
        }

        productRepository.delete(product);
        log.info("Product deleted: {} by user {}", id, userId);
    }

    // ===== APPROVE =====

    @Override
    public ProductResponse approve(UUID id) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        product.setStatus(ProductStatus.APPROVED);
        product.setRejectReason(null);
        productRepository.save(product);
        log.info("Product approved: {}", id);

        notificationService.create(
                product.getUser().getId(),
                "PRODUCT_APPROVED",
                "Sản phẩm được duyệt",
                "Sản phẩm '" + product.getName() + "' đã được duyệt và hiển thị trên sàn.",
                product.getId());

        return mapToResponse(product, Collections.emptyList());
    }

    // ===== REJECT =====

    @Override
    public ProductResponse reject(UUID id, AdminRejectProductRequest request) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        String reason = null;
        if (request != null && request.reason() != null) {
            String r = request.reason().trim();
            reason = r.isEmpty() ? null : r;
        }

        product.setStatus(ProductStatus.REJECTED);
        product.setRejectReason(reason);
        productRepository.save(product);
        log.info("Product rejected: {}", id);

        String msg = "Sản phẩm '" + product.getName() + "' đã bị từ chối. Vui lòng chỉnh sửa và đăng lại.";
        if (reason != null) {
            msg += "\nLý do: " + reason;
        }

        notificationService.create(
                product.getUser().getId(),
                "PRODUCT_REJECTED",
                "Sản phẩm bị từ chối",
                msg,
                product.getId());

        return mapToResponse(product, Collections.emptyList());
    }

    // ===== Private Helpers =====

    /**
     * Batch-loads reviews for all products in a SINGLE query (fixes N+1).
     */
    private List<ProductResponse> mapAllWithReviews(List<Product> products) {
        if (products == null || products.isEmpty()) {
            return List.of();
        }
        Set<UUID> ids = products.stream().map(Product::getId).collect(Collectors.toSet());
        Map<UUID, List<Review>> reviewMap = reviewRepository.findByProductIdIn(ids)
                .stream()
                .filter(r -> r.getProduct() != null)
                .collect(Collectors.groupingBy(r -> r.getProduct().getId()));

        return products.stream()
                .map(p -> mapToResponse(p, reviewMap.getOrDefault(p.getId(), List.of())))
                .toList();
    }

    private ProductResponse mapToResponse(Product p, List<Review> reviews) {
        List<String> imageUrlList = deserializeImageUrls(p.getImageUrls());

        double avgRating = reviews.isEmpty() ? 0.0
                : Math.round(reviews.stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0) * 10.0) / 10.0;

        UUID userId = p.getUser() != null ? p.getUser().getId() : null;

        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                imageUrlList,
                p.getCategory(),
                p.getCategory(),          // categoryName same as category string
                p.getCategoryRef() != null ? p.getCategoryRef().getId() : null,
                p.getCondition(),
                p.getContactNote(),
                userId,
                userId,
                maskUsername(p.getUser() != null ? p.getUser().getUsername() : null),
                p.getStatus().name(),
                avgRating,
                reviews.size(),
                p.getCreatedAt(),
                p.getRejectReason()
        );
    }

    private String serializeImageUrls(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(imageUrls);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize imageUrls", e);
            return null;
        }
    }

    private List<String> deserializeImageUrls(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize imageUrls: {}", json);
            return null;
        }
    }


}
