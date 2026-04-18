package com.educycle.listing.application.usecase;

import com.educycle.listing.api.dto.request.AdminRejectProductRequest;
import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.listing.application.support.ProductResponseMapper;
import com.educycle.listing.domain.Product;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.notification.application.service.NotificationService;
import com.educycle.shared.exception.NotFoundException;
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
public class ProductModerationUseCase {

    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final ProductResponseMapper productResponseMapper;

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

        return productResponseMapper.toResponse(product, List.of());
    }

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

        return productResponseMapper.toResponse(product, List.of());
    }
}
