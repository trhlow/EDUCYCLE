package com.educycle.transaction.application.service;

import com.educycle.admin.api.dto.request.AdminResolveTransactionRequest;
import com.educycle.shared.dto.common.PageResponse;
import com.educycle.transaction.api.dto.request.*;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import java.util.Map;
import java.util.UUID;

public interface TransactionService {
    TransactionResponse create(CreateTransactionRequest request, UUID buyerId);
    TransactionResponse getById(UUID id, UUID actorUserId, boolean admin);
    PageResponse<TransactionResponse> getAll(int page, int size, String direction);
    PageResponse<TransactionResponse> getMyTransactions(UUID userId, int page, int size, String direction);
    TransactionResponse updateStatus(UUID id, UUID actorUserId, UpdateTransactionStatusRequest request);

    TransactionResponse cancelTransaction(UUID id, UUID actorUserId, CancelTransactionRequest request);
    Map<String, String> generateOtp(UUID id, UUID actorUserId);
    void verifyOtp(UUID id, String otp, UUID actorUserId);
    TransactionResponse confirmReceipt(UUID id, UUID actorUserId);

    TransactionResponse openDispute(UUID id, UUID buyerId, DisputeTransactionRequest request);

    PageResponse<TransactionResponse> listDisputedTransactions(int page, int size, String direction);

    TransactionResponse adminResolveDispute(UUID id, AdminResolveTransactionRequest request);
}
