package com.educycle.ai.api;

import com.educycle.ai.application.service.AiChatService;
import com.educycle.shared.config.AiChatRateLimiter;
import com.educycle.shared.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.security.Principal;
import java.util.concurrent.ExecutorService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AiChatControllerHttpValidationTest {

    @Mock
    private AiChatService aiChatService;

    @Mock
    private AiChatRateLimiter aiChatRateLimiter;

    @Mock
    private ExecutorService aiChatSseExecutor;

    @Test
    @DisplayName("POST /api/ai/chat returns 400 for null message elements")
    void chatReturnsBadRequestForNullMessageElements() throws Exception {
        mvc().perform(post("/api/ai/chat")
                        .principal(principal("user-123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"messages":[null]}
                                """))
                .andExpect(status().isBadRequest());

        verify(aiChatRateLimiter, never()).consumeOrThrow(any());
        verifyNoInteractions(aiChatService);
    }

    private MockMvc mvc() {
        return MockMvcBuilders
                .standaloneSetup(new AiChatController(aiChatService, aiChatRateLimiter, aiChatSseExecutor))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new TestAuthenticationPrincipalResolver())
                .build();
    }

    private static Principal principal(String userId) {
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
