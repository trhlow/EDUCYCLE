package com.educycle.transaction.application;

import com.educycle.transaction.dto.message.MessageResponse;
import com.educycle.transaction.dto.message.SendMessageRequest;

import java.util.List;
import java.util.UUID;

public interface MessageService {
    List<MessageResponse> getByTransactionId(UUID transactionId);
    MessageResponse send(UUID transactionId, SendMessageRequest request, UUID senderId);
}
