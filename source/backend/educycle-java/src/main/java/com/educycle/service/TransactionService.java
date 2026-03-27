package com.educycle.service;

import com.educycle.dto.admin.AdminResolveTransactionRequest;
import com.educycle.dto.transaction.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface TransactionService {
    TransactionResponse create(CreateTransactionRequest request, UUID buyerId);
    TransactionResponse getById(UUID id);
    List<TransactionResponse> getAll();
    List<TransactionResponse> getMyTransactions(UUID userId);
    TransactionResponse updateStatus(UUID id, UUID actorUserId, UpdateTransactionStatusRequest request);

    TransactionResponse cancelTransaction(UUID id, UUID actorUserId, CancelTransactionRequest request);
    Map<String, String> generateOtp(UUID id, UUID actorUserId);
    void verifyOtp(UUID id, String otp, UUID actorUserId);
    TransactionResponse confirmReceipt(UUID id);

    TransactionResponse openDispute(UUID id, UUID buyerId, DisputeTransactionRequest request);

    List<TransactionResponse> listDisputedTransactions();

    TransactionResponse adminResolveDispute(UUID id, AdminResolveTransactionRequest request);
}
