package com.educycle.service;

import com.educycle.dto.transaction.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface TransactionService {
    TransactionResponse create(CreateTransactionRequest request, UUID buyerId);
    TransactionResponse getById(UUID id);
    List<TransactionResponse> getAll();
    List<TransactionResponse> getMyTransactions(UUID userId);
    TransactionResponse updateStatus(UUID id, UpdateTransactionStatusRequest request);
    Map<String, String> generateOtp(UUID id);
    void verifyOtp(UUID id, String otp);
    TransactionResponse confirmReceipt(UUID id);
}
