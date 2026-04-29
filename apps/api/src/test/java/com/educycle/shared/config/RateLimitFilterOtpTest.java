package com.educycle.shared.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

/**
 * HTTP-layer OTP rate limits live in {@link RateLimitFilter}; exercise buckets without full MVC/security stack.
 */
@ExtendWith(MockitoExtension.class)
class RateLimitFilterOtpTest {

    private RateLimitFilter filter;

    @Mock
    private FilterChain chain;

    @BeforeEach
    void setUp() {
        TransactionOtpProperties props = new TransactionOtpProperties();
        props.setHttpVerifyPerMinute(2);
        props.setHttpGeneratePerWindow(2);
        props.setHttpGenerateWindowMinutes(5);
        filter = new RateLimitFilter(props);
    }

    @Test
    void verifyOtpPost_returns429WithRetryAfterWhenOverLimit() throws ServletException, IOException {
        UUID txId = UUID.randomUUID();
        String path = "/api/transactions/" + txId + "/verify-otp";

        doAnswer(inv -> null).when(chain).doFilter(any(), any());

        for (int i = 0; i < 2; i++) {
            MockHttpServletResponse res = new MockHttpServletResponse();
            MockHttpServletRequest req = new MockHttpServletRequest("POST", path);
            req.setRemoteAddr("203.0.113.1");
            filter.doFilterInternal(req, res, chain);
            assertThat(res.getStatus()).isNotEqualTo(429);
        }

        reset(chain);
        MockHttpServletResponse resThird = new MockHttpServletResponse();
        MockHttpServletRequest reqThird = new MockHttpServletRequest("POST", path);
        reqThird.setRemoteAddr("203.0.113.1");
        filter.doFilterInternal(reqThird, resThird, chain);

        assertThat(resThird.getStatus()).isEqualTo(429);
        assertThat(resThird.getHeader("Retry-After")).isEqualTo("60");
        verify(chain, never()).doFilter(any(), any());
    }

    @Test
    void generateOtpPost_returns429WithRetryAfterWindowWhenOverLimit() throws ServletException, IOException {
        UUID txId = UUID.randomUUID();
        String path = "/api/transactions/" + txId + "/otp";

        doAnswer(inv -> null).when(chain).doFilter(any(), any());

        for (int i = 0; i < 2; i++) {
            MockHttpServletResponse res = new MockHttpServletResponse();
            MockHttpServletRequest req = new MockHttpServletRequest("POST", path);
            req.setRemoteAddr("203.0.113.2");
            filter.doFilterInternal(req, res, chain);
            assertThat(res.getStatus()).isNotEqualTo(429);
        }

        reset(chain);
        MockHttpServletResponse resThird = new MockHttpServletResponse();
        MockHttpServletRequest reqThird = new MockHttpServletRequest("POST", path);
        reqThird.setRemoteAddr("203.0.113.2");
        filter.doFilterInternal(reqThird, resThird, chain);

        assertThat(resThird.getStatus()).isEqualTo(429);
        assertThat(resThird.getHeader("Retry-After")).isEqualTo("300");
        verify(chain, never()).doFilter(any(), any());
    }
}
