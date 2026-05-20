package com.educycle.wishlist.api;

import com.educycle.wishlist.api.dto.response.WishlistCardResponse;
import com.educycle.wishlist.application.service.WishlistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class WishlistControllerTest {

    @Mock
    private WishlistService wishlistService;

    @Test
    @DisplayName("GET /api/wishlist returns current user's wishlist")
    void listReturnsCurrentUserWishlist() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        given(wishlistService.listMine(userId)).willReturn(List.of(new WishlistCardResponse(
                productId,
                "Clean Architecture",
                new BigDecimal("120000"),
                "/api/files/book.webp",
                "Books",
                "seller***",
                4.5,
                2)));

        mvc().perform(get("/api/wishlist").principal(principal(userId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(productId.toString()))
                .andExpect(jsonPath("$[0].name").value("Clean Architecture"));

        verify(wishlistService).listMine(userId);
    }

    @Test
    @DisplayName("POST /api/wishlist/{productId} delegates add")
    void addDelegatesToService() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        mvc().perform(post("/api/wishlist/{productId}", productId)
                        .principal(principal(userId))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(wishlistService).add(eq(userId), eq(productId));
    }

    @Test
    @DisplayName("DELETE /api/wishlist/{productId} delegates remove")
    void removeDelegatesToService() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        mvc().perform(delete("/api/wishlist/{productId}", productId).principal(principal(userId)))
                .andExpect(status().isNoContent());

        verify(wishlistService).remove(eq(userId), eq(productId));
    }

    private MockMvc mvc() {
        return MockMvcBuilders
                .standaloneSetup(new WishlistController(wishlistService))
                .setCustomArgumentResolvers(new TestAuthenticationPrincipalResolver())
                .build();
    }

    private static Principal principal(UUID userId) {
        return userId::toString;
    }

    private static final class TestAuthenticationPrincipalResolver implements HandlerMethodArgumentResolver {

        @Override
        public boolean supportsParameter(MethodParameter parameter) {
            return parameter.hasParameterAnnotation(AuthenticationPrincipal.class)
                    && String.class.equals(parameter.getParameterType());
        }

        @Override
        public Object resolveArgument(
                MethodParameter parameter,
                ModelAndViewContainer mavContainer,
                NativeWebRequest webRequest,
                WebDataBinderFactory binderFactory) {
            Principal principal = webRequest.getUserPrincipal();
            return principal != null ? principal.getName() : null;
        }
    }
}
