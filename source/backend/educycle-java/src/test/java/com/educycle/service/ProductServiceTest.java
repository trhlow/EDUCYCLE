package com.educycle.service;

import com.educycle.dto.common.PageResponse;
import com.educycle.dto.product.CreateProductRequest;
import com.educycle.dto.product.ProductResponse;
import com.educycle.dto.product.UpdateProductRequest;
import com.educycle.enums.ProductStatus;
import com.educycle.exception.NotFoundException;
import com.educycle.exception.UnauthorizedException;
import com.educycle.model.Product;
import com.educycle.model.User;
import com.educycle.repository.ProductRepository;
import com.educycle.repository.ReviewRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.impl.ProductServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Maps C# ProductServiceTests.cs (xUnit + Moq) → JUnit 5 + Mockito
 *
 * Notes on C# → Java test mapping:
 *  new List<Product> { new() { ... } }      → List.of(buildProduct(...))
 *  _reviewRepoMock.Setup().ReturnsAsync([]) → given(reviewRepo.findByProductId(any())).willReturn(List.of())
 *  @InjectMocks with @Spy ObjectMapper      → real ObjectMapper injected (not mocked)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ProductServiceImpl productService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@example.com")
                .role(com.educycle.enums.Role.USER)
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        // Default: reviews always return empty (matches C# constructor setup)
        lenient().when(reviewRepository.findByProductId(any())).thenReturn(Collections.emptyList());
    }

    // ===================================================================
    // CREATE
    // ===================================================================

    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("should create and return ProductResponse")
        void shouldCreateProduct() {
            // Arrange — maps C# CreateAsync_ShouldReturnProduct
            UUID userId = testUser.getId();
            CreateProductRequest request = new CreateProductRequest(
                    "Test Product", "A test product", new BigDecimal("100.50"),
                    null, null, null, null, null, null);

            given(userRepository.findById(userId)).willReturn(Optional.of(testUser));

            // Act
            ProductResponse result = productService.create(request, userId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.name()).isEqualTo("Test Product");
            assertThat(result.description()).isEqualTo("A test product");
            assertThat(result.price()).isEqualByComparingTo("100.50");
            assertThat(result.userId()).isEqualTo(userId);
            verify(productRepository, times(1)).save(any(Product.class));
        }
    }

    // ===================================================================
    // GET BY ID
    // ===================================================================

    @Nested
    @DisplayName("getById()")
    class GetById {

        @Test
        @DisplayName("should return product when exists")
        void shouldReturnProduct_whenExists() {
            // Arrange — maps C# GetByIdAsync_ShouldReturnProduct_WhenExists
            UUID productId = UUID.randomUUID();
            Product product = buildProduct(productId, testUser, "Existing Product", "50.00");

            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.of(product));

            // Act
            ProductResponse result = productService.getById(productId);

            // Assert
            assertThat(result.id()).isEqualTo(productId);
            assertThat(result.name()).isEqualTo("Existing Product");
        }

        @Test
        @DisplayName("should throw NotFoundException when product not found")
        void shouldThrow_whenNotFound() {
            // Arrange — maps C# GetByIdAsync_ShouldThrow_WhenNotFound
            UUID productId = UUID.randomUUID();
            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> productService.getById(productId))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    // ===================================================================
    // GET ALL
    // ===================================================================

    @Nested
    @DisplayName("getAll()")
    class GetAll {

        @Test
        @DisplayName("should return all approved products")
        void shouldReturnAllProducts() {
            // Arrange — maps C# GetAllAsync_ShouldReturnAllProducts
            List<Product> products = List.of(
                    buildProduct(UUID.randomUUID(), testUser, "P1", "10.00"),
                    buildProduct(UUID.randomUUID(), testUser, "P2", "20.00")
            );
            Pageable pageable = PageRequest.of(0, 20);
            given(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .willReturn(new PageImpl<>(products, pageable, products.size()));

            // Act
            PageResponse<ProductResponse> result = productService.getAll(pageable, null, null, null, null);

            // Assert
            assertThat(result.content()).hasSize(2);
        }

        @Test
        @DisplayName("should return empty list when no products exist")
        void shouldReturnEmpty_whenNoProducts() {
            // Arrange — maps C# GetAllAsync_ShouldReturnEmpty_WhenNoProducts
            Pageable pageable = PageRequest.of(0, 20);
            given(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .willReturn(new PageImpl<>(Collections.emptyList(), pageable, 0));

            // Act
            PageResponse<ProductResponse> result = productService.getAll(pageable, null, null, null, null);

            // Assert
            assertThat(result.content()).isEmpty();
        }
    }

    // ===================================================================
    // UPDATE
    // ===================================================================

    @Nested
    @DisplayName("update()")
    class Update {

        @Test
        @DisplayName("should update product when caller is the owner")
        void shouldUpdateProduct_whenOwner() {
            // Arrange — maps C# UpdateAsync_ShouldUpdateProduct_WhenOwner
            UUID productId = UUID.randomUUID();
            Product product = buildProduct(productId, testUser, "Old Name", "10.00");

            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.of(product));

            UpdateProductRequest request = new UpdateProductRequest(
                    "New Name", "Updated desc", new BigDecimal("99.99"),
                    null, null, null, null, null, null);

            // Act
            ProductResponse result = productService.update(productId, request, testUser.getId());

            // Assert
            assertThat(result.name()).isEqualTo("New Name");
            assertThat(result.price()).isEqualByComparingTo("99.99");
            verify(productRepository, times(1)).save(any(Product.class));
        }

        @Test
        @DisplayName("should throw UnauthorizedException when caller is not the owner")
        void shouldThrow_whenNotOwner() {
            // Arrange — maps C# UpdateAsync_ShouldThrow_WhenNotOwner
            UUID productId = UUID.randomUUID();
            UUID otherUserId = UUID.randomUUID();
            Product product = buildProduct(productId, testUser, "Product", "10.00");

            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.of(product));

            UpdateProductRequest request = new UpdateProductRequest(
                    "Hacked", null, BigDecimal.ZERO,
                    null, null, null, null, null, null);

            // Act + Assert
            assertThatThrownBy(() -> productService.update(productId, request, otherUserId))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("should throw NotFoundException when product not found")
        void shouldThrow_whenNotFound() {
            // Arrange — maps C# UpdateAsync_ShouldThrow_WhenNotFound
            UUID productId = UUID.randomUUID();
            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.empty());

            UpdateProductRequest request = new UpdateProductRequest(
                    "X", null, BigDecimal.ONE,
                    null, null, null, null, null, null);

            // Act + Assert
            assertThatThrownBy(() -> productService.update(productId, request, UUID.randomUUID()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    // ===================================================================
    // DELETE
    // ===================================================================

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("should delete product when caller is the owner")
        void shouldDelete_whenOwner() {
            // Arrange — maps C# DeleteAsync_ShouldDelete_WhenOwner
            UUID productId = UUID.randomUUID();
            Product product = buildProduct(productId, testUser, "Product", "10.00");

            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.of(product));

            // Act
            productService.delete(productId, testUser.getId());

            // Assert
            verify(productRepository, times(1)).delete(product);
        }

        @Test
        @DisplayName("should throw UnauthorizedException when caller is not the owner")
        void shouldThrow_whenNotOwner() {
            // Arrange — maps C# DeleteAsync_ShouldThrow_WhenNotOwner
            UUID productId = UUID.randomUUID();
            Product product = buildProduct(productId, testUser, "Product", "10.00");

            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.of(product));

            // Act + Assert
            assertThatThrownBy(() -> productService.delete(productId, UUID.randomUUID()))
                    .isInstanceOf(UnauthorizedException.class);
        }

        @Test
        @DisplayName("should throw NotFoundException when product not found")
        void shouldThrow_whenNotFound() {
            // Arrange — maps C# DeleteAsync_ShouldThrow_WhenNotFound
            UUID productId = UUID.randomUUID();
            given(productRepository.findByIdWithUser(productId)).willReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> productService.delete(productId, UUID.randomUUID()))
                    .isInstanceOf(NotFoundException.class);
        }
    }

    // ===================================================================
    // Helpers
    // ===================================================================

    private Product buildProduct(UUID id, User user, String name, String price) {
        return Product.builder()
                .id(id)
                .name(name)
                .price(new BigDecimal(price))
                .user(user)
                .status(ProductStatus.APPROVED)
                .createdAt(Instant.now())
                .build();
    }
}
