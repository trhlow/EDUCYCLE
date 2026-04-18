package com.educycle.transaction.application.service.impl;

import com.educycle.admin.api.dto.request.AdminResolveTransactionRequest;
import com.educycle.transaction.api.dto.request.CancelTransactionRequest;
import com.educycle.transaction.api.dto.request.CreateTransactionRequest;
import com.educycle.transaction.api.dto.request.DisputeTransactionRequest;
import com.educycle.transaction.api.dto.request.UpdateTransactionStatusRequest;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.application.service.TransactionService;
import com.educycle.transaction.application.usecase.CreateTransactionUseCase;
import com.educycle.transaction.application.usecase.TransactionDisputeUseCase;
import com.educycle.transaction.application.usecase.TransactionOtpUseCase;
import com.educycle.transaction.application.usecase.TransactionQueryUseCase;
import com.educycle.transaction.application.usecase.TransactionStatusUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final CreateTransactionUseCase createTransactionUseCase;
    private final TransactionQueryUseCase queryUseCase;
    private final TransactionStatusUseCase statusUseCase;
    private final TransactionOtpUseCase otpUseCase;
    private final TransactionDisputeUseCase disputeUseCase;

    @Override
    public TransactionResponse create(CreateTransactionRequest request, UUID buyerId) {
        return createTransactionUseCase.create(request, buyerId);
    }

    @Override
    public TransactionResponse getById(UUID id) {
        return queryUseCase.getById(id);
    }

    @Override
    public List<TransactionResponse> getAll() {
        return queryUseCase.getAll();
    }

    @Override
    public List<TransactionResponse> getMyTransactions(UUID userId) {
        return queryUseCase.getMyTransactions(userId);
    }

    @Override
    public TransactionResponse updateStatus(UUID id, UUID actorUserId, UpdateTransactionStatusRequest request) {
        return statusUseCase.updateStatus(id, actorUserId, request);
    }

    @Override
    public TransactionResponse cancelTransaction(UUID id, UUID actorUserId, CancelTransactionRequest request) {
        return statusUseCase.cancelTransaction(id, actorUserId, request);
    }

    @Override
    public Map<String, String> generateOtp(UUID id, UUID actorUserId) {
        return otpUseCase.generateOtp(id, actorUserId);
    }

    @Override
    public void verifyOtp(UUID id, String otp, UUID actorUserId) {
        otpUseCase.verifyOtp(id, otp, actorUserId);
    }

    @Override
    public TransactionResponse confirmReceipt(UUID id, UUID actorUserId) {
        return statusUseCase.confirmReceipt(id, actorUserId);
    }

    @Override
    public TransactionResponse openDispute(UUID id, UUID buyerId, DisputeTransactionRequest request) {
        return disputeUseCase.openDispute(id, buyerId, request);
    }

    @Override
    public List<TransactionResponse> listDisputedTransactions() {
        return queryUseCase.listDisputedTransactions();
    }

    @Override
    public TransactionResponse adminResolveDispute(UUID id, AdminResolveTransactionRequest request) {
        return disputeUseCase.adminResolveDispute(id, request);
    }
}
