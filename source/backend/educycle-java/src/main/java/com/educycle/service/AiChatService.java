package com.educycle.service;

import com.educycle.controller.AiChatController.MessageDto;
import com.educycle.exception.AppException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Calls Anthropic Claude API on behalf of the user.
 * API key is read from application.yml / environment variable — never exposed to FE.
 *
 * Model: claude-sonnet-4-20250514 (Claude Sonnet 4 — fast + smart)
 * Max tokens: 1024 (enough for chatbot replies, cost-controlled)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiChatService {

    @Value("${anthropic.api-key:}")
    private String apiKey;

    @Value("${anthropic.model:claude-sonnet-4-20250514}")
    private String model;

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
    private static final String ANTHROPIC_VERSION  = "2023-06-01";

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * System prompt — gives Claude full EduCycle context so it can answer
     * questions about the platform accurately.
     */
    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI của EduCycle — sàn giao dịch tài liệu học tập P2P dành cho sinh viên Việt Nam.
            
            ## Về EduCycle
            - Nền tảng P2P cho sinh viên mua bán sách giáo trình, tài liệu ôn thi, dụng cụ học tập
            - Giao dịch hoàn toàn trực tiếp giữa người mua và người bán (không qua trung gian)
            - Chỉ dành cho sinh viên có email .edu.vn (hoặc đăng nhập Google/Microsoft tổ chức)
            
            ## Quy trình giao dịch
            1. Người mua tìm sản phẩm → gửi yêu cầu mua
            2. Người bán chấp nhận hoặc từ chối
            3. Hai bên chat nội bộ để thống nhất địa điểm & giờ gặp
            4. Gặp mặt trực tiếp, kiểm tra sản phẩm
            5. Người MUA tạo mã OTP → đọc cho người BÁN nhập → xác nhận hoàn tất
            6. Đánh giá nhau sau khi hoàn thành
            
            ## OTP quan trọng
            - Người MUA tạo mã OTP, người BÁN nhập mã
            - Chưa nhập OTP = giao dịch chưa chốt — người mua vẫn được bảo vệ
            - Mã OTP có hiệu lực 10 phút
            - Nếu sản phẩm không đúng mô tả: báo tranh chấp TRƯỚC khi đưa mã OTP
            
            ## Các trạng thái giao dịch
            - PENDING: Chờ người bán xác nhận
            - ACCEPTED: Đã chấp nhận, đang hẹn gặp
            - MEETING: Đang gặp mặt, chờ OTP
            - COMPLETED: Hoàn thành
            - REJECTED: Người bán từ chối
            - CANCELLED: Người mua hủy (chỉ khi PENDING)
            - DISPUTED: Tranh chấp, chờ admin xử lý
            
            ## Đánh giá & Uy tín
            - Điểm uy tín là của người dùng, không phải sản phẩm
            - Hiển thị trên hồ sơ người bán
            - Người mới hiện "Chưa có đánh giá"
            
            ## Quy định đăng bán
            - Phải xác thực email .edu.vn trước khi đăng bán
            - Sản phẩm phải qua kiểm duyệt admin trước khi hiển thị công khai
            - Hỗ trợ "Giá liên hệ" nếu chưa biết giá cụ thể
            - Hủy giao dịch liên tục → cảnh cáo → khóa tài khoản
            
            ## Phong cách trả lời
            - Thân thiện, ngắn gọn, dùng tiếng Việt
            - Dùng emoji phù hợp để dễ đọc
            - Nếu câu hỏi không liên quan đến EduCycle, lịch sự từ chối và hướng dẫn về chủ đề EduCycle
            - Không bịa đặt thông tin không có trong context này
            - Câu trả lời tối đa 200 từ, ưu tiên ngắn gọn súc tích
            """;

    public String chat(List<MessageDto> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Anthropic API key not configured");
            return "Xin lỗi, tính năng chatbot chưa được cấu hình. Vui lòng liên hệ admin@educycle.com để được hỗ trợ.";
        }

        try {
            // Build message list for Anthropic
            var anthropicMessages = messages.stream()
                    .map(m -> Map.of("role", m.role(), "content", m.content()))
                    .toList();

            var requestBody = Map.of(
                    "model",      model,
                    "max_tokens", 1024,
                    "system",     SYSTEM_PROMPT,
                    "messages",   anthropicMessages
            );

            String bodyJson = MAPPER.writeValueAsString(requestBody);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(ANTHROPIC_API_URL))
                    .header("Content-Type",      "application/json")
                    .header("x-api-key",         apiKey)
                    .header("anthropic-version", ANTHROPIC_VERSION)
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(
                    httpRequest, HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() != 200) {
                log.error("Anthropic API error: status={}, body={}", response.statusCode(), response.body());
                return "Xin lỗi, có lỗi xảy ra khi kết nối AI. Vui lòng thử lại sau.";
            }

            // Parse response: data.content[0].text
            var responseMap = MAPPER.readValue(response.body(), Map.class);
            var content = (List<?>) responseMap.get("content");
            if (content == null || content.isEmpty()) return "Xin lỗi, không nhận được phản hồi.";

            var firstBlock = (Map<?, ?>) content.get(0);
            String text = (String) firstBlock.get("text");
            return text != null ? text : "Xin lỗi, không nhận được phản hồi.";

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("AI chat interrupted", e);
            return "Xin lỗi, yêu cầu bị gián đoạn. Vui lòng thử lại.";
        } catch (Exception e) {
            log.error("AI chat error", e);
            return "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";
        }
    }
}
