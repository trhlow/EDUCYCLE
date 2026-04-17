package com.educycle.transaction.api;

import com.educycle.transaction.dto.message.MessageResponse;
import com.educycle.transaction.dto.message.SendMessageRequest;
import com.educycle.transaction.dto.transaction.*;
import com.educycle.transaction.application.MessageService;
import com.educycle.transaction.application.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Maps C# TransactionsController.cs
 *
 * Note: Entire controller requires authentication (all endpoints have [Authorize] in C#).
 * The SecurityConfig already enforces authenticated() for all non-public routes.
 *
 * Inner class TransactionVerifyOtpRequest from C# is now a proper record in dto/transaction package.
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionsController {

    private final TransactionService transactionService;
    private final MessageService     messageService;

    // POST /api/transactions
    @PostMapping
    public ResponseEntity<TransactionResponse> create(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody CreateTransactionRequest request) {

        return ResponseEntity.ok(transactionService.create(request, UUID.fromString(userId)));
    }

    // GET /api/transactions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.getById(id));
    }

    /**
     * Danh sách toàn bộ giao dịch — chỉ ADMIN (trước đây mọi user đăng nhập đều gọi được → lộ dữ liệu).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransactionResponse>> getAll() {
        return ResponseEntity.ok(transactionService.getAll());
    }

    // GET /api/transactions/mine
    @GetMapping("/mine")
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(transactionService.getMyTransactions(UUID.fromString(userId)));
    }

    // PATCH /api/transactions/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TransactionResponse> updateStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateTransactionStatusRequest request) {

        return ResponseEntity.ok(
                transactionService.updateStatus(id, UUID.fromString(userId), request));
    }

    /** Hủy giao dịch (PENDING: chỉ buyer; ACCEPTED/MEETING: buyer hoặc seller) — lý do tuỳ chọn. */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<TransactionResponse> cancelTransaction(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) CancelTransactionRequest body) {

        return ResponseEntity.ok(
                transactionService.cancelTransaction(id, UUID.fromString(userId), body));
    }

    // POST /api/transactions/{id}/otp
    @PostMapping("/{id}/otp")
    public ResponseEntity<Map<String, String>> generateOtp(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(transactionService.generateOtp(id, UUID.fromString(userId)));
    }

    // POST /api/transactions/{id}/verify-otp
    @PostMapping("/{id}/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody TransactionVerifyOtpRequest request) {

        transactionService.verifyOtp(id, request.otp(), UUID.fromString(userId));
        return ResponseEntity.ok(Map.of("message", "Xác thực mã OTP thành công"));
    }

    // POST /api/transactions/{id}/confirm
    @PostMapping("/{id}/confirm")
    public ResponseEntity<TransactionResponse> confirmReceipt(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId) {

        return ResponseEntity.ok(
                transactionService.confirmReceipt(id, UUID.fromString(userId)));
    }

    // POST /api/transactions/{id}/dispute — buyer only, status ACCEPTED (hoặc MEETING legacy)
    @PostMapping("/{id}/dispute")
    public ResponseEntity<TransactionResponse> openDispute(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) DisputeTransactionRequest body) {

        return ResponseEntity.ok(
                transactionService.openDispute(id, UUID.fromString(userId), body));
    }

    // ===== Messages sub-routes =====

    // GET /api/transactions/{transactionId}/messages
    @GetMapping("/{transactionId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable UUID transactionId) {
        return ResponseEntity.ok(messageService.getByTransactionId(transactionId));
    }

    // POST /api/transactions/{transactionId}/messages
    @PostMapping("/{transactionId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable UUID transactionId,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody SendMessageRequest request) {

        return ResponseEntity.ok(
                messageService.send(transactionId, request, UUID.fromString(userId)));
    }
}
