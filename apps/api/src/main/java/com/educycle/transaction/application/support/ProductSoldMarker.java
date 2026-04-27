package com.educycle.transaction.application.support;

import com.educycle.listing.domain.ProductStatus;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductSoldMarker {

    private final ProductRepository productRepository;

    public void markSold(UUID productId) {
        productRepository.findById(productId).ifPresent(product -> {
            if (product.getStatus() == ProductStatus.SOLD) {
                return;
            }
            product.setStatus(ProductStatus.SOLD);
            productRepository.save(product);
            log.info("Product {} marked as SOLD", productId);
        });
    }
}
