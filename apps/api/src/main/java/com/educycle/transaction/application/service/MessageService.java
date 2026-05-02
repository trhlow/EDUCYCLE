package com.educycle.transaction.application.service;

import com.educycle.transaction.api.dto.response.MessageResponse;
import com.educycle.transaction.api.dto.request.SendMessageRequest;

import java.util.List;
import java.util.UUID;

public interface MessageService {
    List<MessageResponse> getByTransactionId(UUID transactionId, UUID actorUserId, boolean admin);
    MessageResponse send(UUID transactionId, SendMessageRequest request, UUID senderId);
}
