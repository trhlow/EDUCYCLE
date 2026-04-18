package com.educycle.listing.application.usecase;

import com.educycle.listing.api.dto.request.CreateProductRequest;
import com.educycle.listing.api.dto.request.UpdateProductRequest;
import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.application.support.ProductImages;
import com.educycle.listing.application.support.ProductResponseMapper;
import com.educycle.listing.domain.Product;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductOwnerUseCase {

    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ProductImages productImages;
    private final ProductResponseMapper productResponseMapper;

    public ProductResponse create(CreateProductRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(productImages.primaryImage(request.imageUrl(), request.imageUrls()))
                .imageUrls(productImages.serialize(request.imageUrls()))
                .category(request.category())
                .condition(request.condition())
                .contactNote(request.contactNote())
                .user(user)
                .status(ProductStatus.PENDING)
                .build();

        productRepository.save(product);
        log.info("Product created: {} by user {}", product.getId(), userId);
        return productResponseMapper.toResponse(product, List.of());
    }

    public ProductResponse update(UUID id, UpdateProductRequest request, UUID userId) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));
        assertOwner(product, userId, "Bạn chỉ có thể chỉnh sửa sản phẩm của mình");

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setImageUrl(productImages.primaryImage(request.imageUrl(), request.imageUrls()));
        product.setImageUrls(productImages.serialize(request.imageUrls()));
        product.setCategory(request.category());
        product.setCondition(request.condition());
        product.setContactNote(request.contactNote());
        product.setStatus(ProductStatus.PENDING);
        product.setRejectReason(null);

        productRepository.save(product);
        return productResponseMapper.toResponse(product, List.of());
    }

    public void delete(UUID id, UUID userId) {
        Product product = productRepository.findByIdWithUser(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));
        assertOwner(product, userId, "Bạn chỉ có thể xóa sản phẩm của mình");

        if (transactionRepository.existsByProduct_Id(id)) {
            throw new BadRequestException("Không thể xóa sản phẩm đã có giao dịch liên quan.");
        }

        productRepository.delete(product);
        log.info("Product deleted: {} by user {}", id, userId);
    }

    private void assertOwner(Product product, UUID userId, String message) {
        if (product.getUser() == null || !product.getUser().getId().equals(userId)) {
            throw new UnauthorizedException(message);
        }
    }
}
