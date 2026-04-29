package com.educycle.integration;

import com.educycle.auth.api.dto.request.LoginRequest;
import com.educycle.auth.api.dto.request.RegisterRequest;
import com.educycle.auth.api.dto.request.VerifyOtpRequest;
import com.educycle.auth.api.dto.response.AuthResponse;
import com.educycle.listing.api.dto.request.CreateProductRequest;
import com.educycle.listing.api.dto.request.UpdateProductRequest;
import com.educycle.listing.api.dto.response.ProductResponse;
import com.educycle.review.api.dto.request.CreateReviewRequest;
import com.educycle.review.api.dto.response.ReviewResponse;
import com.educycle.transaction.api.dto.request.CreateTransactionRequest;
import com.educycle.transaction.api.dto.request.UpdateTransactionStatusRequest;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("ci")
@Tag("integration")
class CoreFlowIntegrationTest {

    private static final String FIXED_OTP = "123456";
    private static final String ADMIN_EMAIL = "admin@educycle.com";
    private static final String ADMIN_PASSWORD = "admin@1";

    static final IntegrationPostgres postgres = IntegrationPostgres.start();

    @DynamicPropertySource
    static void datasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::jdbcUrl);
        registry.add("spring.datasource.username", postgres::username);
        registry.add("spring.datasource.password", postgres::password);
        registry.add("jwt.secret", () -> "integration-test-jwt-secret-at-least-32-chars");
        registry.add("educycle.e2e-fixed-otp", () -> FIXED_OTP);
    }

    @AfterAll
    static void stopPostgres() {
        postgres.stop();
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerVerifyOtpAndLogin() throws Exception {
        String email = uniqueEmail("auth");
        register(email, "Auth User");
        verifyOtp(email);

        UserSession login = login(email, "Password123");

        assertThat(login.token()).isNotBlank();
        assertThat(login.userId()).isNotNull();
    }

    @Test
    void createListAndUpdateProduct() throws Exception {
        UserSession seller = registerVerifiedUser("seller-product");

        ProductResponse created = createProduct(
                seller,
                "Calculus Book",
                "Original edition",
                new BigDecimal("120000"));

        JsonNode mine = getJson("/api/products/mine", seller.token());
        assertThat(mine.get("content")).hasSizeGreaterThanOrEqualTo(1);

        ProductResponse updated = updateProduct(
                seller,
                created.id(),
                "Calculus Book Updated",
                "Clean pages",
                new BigDecimal("99000"));

        assertThat(updated.id()).isEqualTo(created.id());
        assertThat(updated.name()).isEqualTo("Calculus Book Updated");
        assertThat(updated.status()).isEqualTo("PENDING");
    }

    @Test
    void createTransactionChangeStatusAndReview() throws Exception {
        UserSession seller = registerVerifiedUser("seller-transaction");
        UserSession buyer = registerVerifiedUser("buyer-transaction");
        UserSession admin = loginAdmin();

        ProductResponse product = createProduct(
                seller,
                "Physics Notes",
                "Exam prep notes",
                new BigDecimal("50000"));
        ProductResponse approved = approveProduct(admin, product.id());
        assertThat(approved.status()).isEqualTo("APPROVED");

        TransactionResponse transaction = createTransaction(buyer, approved, seller);
        assertThat(transaction.status()).isEqualTo("PENDING");

        TransactionResponse accepted = updateTransactionStatus(seller, transaction.id(), "ACCEPTED");
        assertThat(accepted.status()).isEqualTo("ACCEPTED");

        ReviewResponse review = createReview(
                buyer,
                approved.id(),
                seller.userId(),
                accepted.id());

        assertThat(review.rating()).isEqualTo(5);
        assertThat(review.productId()).isEqualTo(approved.id());
        assertThat(review.targetUserId()).isEqualTo(seller.userId());
        assertThat(review.transactionId()).isEqualTo(accepted.id());
    }

    private UserSession registerVerifiedUser(String prefix) throws Exception {
        String email = uniqueEmail(prefix);
        register(email, prefix);
        verifyOtp(email);
        return login(email, "Password123");
    }

    private void register(String email, String username) throws Exception {
        postJson("/api/auth/register",
                new RegisterRequest(username + "-" + UUID.randomUUID().toString().substring(0, 8), email, "Password123"),
                null)
                .andExpect(status().isOk());
    }

    private void verifyOtp(String email) throws Exception {
        AuthResponse response = readResponse(
                postJson("/api/auth/verify-otp", new VerifyOtpRequest(email, FIXED_OTP), null)
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                AuthResponse.class);
        assertThat(response.token()).isNotBlank();
    }

    private UserSession login(String email, String password) throws Exception {
        AuthResponse response = readResponse(
                postJson("/api/auth/login", new LoginRequest(email, password), null)
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                AuthResponse.class);
        return new UserSession(response.userId(), response.token());
    }

    private UserSession loginAdmin() throws Exception {
        return login(ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    private ProductResponse createProduct(
            UserSession seller,
            String name,
            String description,
            BigDecimal price) throws Exception {
        CreateProductRequest request = new CreateProductRequest(
                name,
                description,
                price,
                null,
                List.of("/api/files/test-image.jpg"),
                "Giáo Trình",
                "GOOD",
                "Meet on campus",
                1);
        return readResponse(
                postJson("/api/products", request, seller.token())
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                ProductResponse.class);
    }

    private ProductResponse updateProduct(
            UserSession seller,
            UUID productId,
            String name,
            String description,
            BigDecimal price) throws Exception {
        UpdateProductRequest request = new UpdateProductRequest(
                name,
                description,
                price,
                null,
                List.of("/api/files/test-image-updated.jpg"),
                "Sách Chuyên Ngành",
                "LIKE_NEW",
                "Updated contact note",
                2);
        return readResponse(
                putJson("/api/products/" + productId, request, seller.token())
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                ProductResponse.class);
    }

    private ProductResponse approveProduct(UserSession admin, UUID productId) throws Exception {
        return readResponse(
                mockMvc.perform(patch("/api/products/{id}/approve", productId)
                                .header(HttpHeaders.AUTHORIZATION, bearer(admin.token())))
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                ProductResponse.class);
    }

    private TransactionResponse createTransaction(
            UserSession buyer,
            ProductResponse product,
            UserSession seller) throws Exception {
        CreateTransactionRequest request = new CreateTransactionRequest(
                product.id(),
                seller.userId(),
                product.price());
        return readResponse(
                postJson("/api/transactions", request, buyer.token())
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                TransactionResponse.class);
    }

    private TransactionResponse updateTransactionStatus(
            UserSession seller,
            UUID transactionId,
            String status) throws Exception {
        return readResponse(
                patchJson("/api/transactions/" + transactionId + "/status",
                        new UpdateTransactionStatusRequest(status),
                        seller.token())
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                TransactionResponse.class);
    }

    private ReviewResponse createReview(
            UserSession reviewer,
            UUID productId,
            UUID targetUserId,
            UUID transactionId) throws Exception {
        CreateReviewRequest request = new CreateReviewRequest(
                productId,
                targetUserId,
                transactionId,
                5,
                "Smooth exchange and accurate description.");
        return readResponse(
                postJson("/api/reviews", request, reviewer.token())
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString(),
                ReviewResponse.class);
    }

    private JsonNode getJson(String path, String token) throws Exception {
        String body = mockMvc.perform(get(path).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body);
    }

    private org.springframework.test.web.servlet.ResultActions postJson(
            String path,
            Object body,
            String token) throws Exception {
        var builder = post(path)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
        if (token != null) {
            builder.header(HttpHeaders.AUTHORIZATION, bearer(token));
        }
        return mockMvc.perform(builder);
    }

    private org.springframework.test.web.servlet.ResultActions putJson(
            String path,
            Object body,
            String token) throws Exception {
        return mockMvc.perform(put(path)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private org.springframework.test.web.servlet.ResultActions patchJson(
            String path,
            Object body,
            String token) throws Exception {
        return mockMvc.perform(patch(path)
                .header(HttpHeaders.AUTHORIZATION, bearer(token))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private <T> T readResponse(String body, Class<T> type) throws Exception {
        return objectMapper.readValue(body, type);
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    private static String uniqueEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID() + "@student.edu.vn";
    }

    private record UserSession(UUID userId, String token) {
    }
}
