package com.educycle.wishlist.application;

import com.educycle.wishlist.dto.WishlistCardResponse;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.listing.domain.Product;
import com.educycle.review.domain.Review;
import com.educycle.user.domain.User;
import com.educycle.wishlist.domain.WishlistItem;
import com.educycle.listing.persistence.ProductRepository;
import com.educycle.review.persistence.ReviewRepository;
import com.educycle.user.persistence.UserRepository;
import com.educycle.wishlist.persistence.WishlistItemRepository;
import com.educycle.wishlist.application.WishlistService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.educycle.shared.util.PrivacyHelper.maskUsername;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistCardResponse> listMine(UUID userId) {
        List<WishlistItem> rows = wishlistItemRepository.findByUserIdWithProduct(userId);
        if (rows.isEmpty()) {
            return List.of();
        }
        Set<UUID> productIds = rows.stream().map(w -> w.getProduct().getId()).collect(Collectors.toSet());
        Map<UUID, List<Review>> reviewMap = reviewRepository.findByProductIdIn(productIds).stream()
                .filter(r -> r.getProduct() != null)
                .collect(Collectors.groupingBy(r -> r.getProduct().getId()));

        return rows.stream()
                .map(w -> toCard(w.getProduct(), reviewMap.getOrDefault(w.getProduct().getId(), List.of())))
                .toList();
    }

    @Override
    public void add(UUID userId, UUID productId) {
        if (wishlistItemRepository.existsByUser_IdAndProduct_Id(userId, productId)) {
            return;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));
        if (product.getUser() != null && product.getUser().getId().equals(userId)) {
            throw new BadRequestException("Không thể thêm sản phẩm của chính bạn vào yêu thích");
        }
        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();
        wishlistItemRepository.save(item);
        log.debug("Wishlist add user={} product={}", userId, productId);
    }

    @Override
    public void remove(UUID userId, UUID productId) {
        wishlistItemRepository.deleteByUser_IdAndProduct_Id(userId, productId);
    }

    private WishlistCardResponse toCard(Product p, List<Review> reviews) {
        List<String> urls = deserializeImageUrls(p.getImageUrls());
        String firstImage = (urls != null && !urls.isEmpty()) ? urls.get(0) : p.getImageUrl();

        double avgRating = reviews.isEmpty() ? 0.0
                : Math.round(reviews.stream().mapToInt(Review::getRating).average().orElse(0.0) * 10.0) / 10.0;

        String seller = maskUsername(p.getUser() != null ? p.getUser().getUsername() : null);

        return new WishlistCardResponse(
                p.getId(),
                p.getName(),
                p.getPrice(),
                firstImage != null ? firstImage : "",
                p.getCategory() != null ? p.getCategory() : "",
                seller,
                avgRating,
                reviews.size()
        );
    }

    private List<String> deserializeImageUrls(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize imageUrls: {}", json);
            return Collections.emptyList();
        }
    }

}
