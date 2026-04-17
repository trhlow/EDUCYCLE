package com.educycle.bookwanted.application.service;

import com.educycle.bookwanted.api.dto.response.BookWantedInquiryMessageResponse;
import com.educycle.bookwanted.api.dto.response.BookWantedInquiryResponse;
import com.educycle.bookwanted.api.dto.response.BookWantedInquirySummaryResponse;
import com.educycle.transaction.api.dto.request.SendMessageRequest;

import java.util.List;
import java.util.UUID;

public interface BookWantedInquiryService {

    BookWantedInquiryResponse startOrGetInquiry(UUID postId, UUID responderId);

    List<BookWantedInquirySummaryResponse> listInquiriesForPost(UUID postId, UUID requesterId);

    BookWantedInquiryResponse getInquiry(UUID inquiryId, UUID userId);

    List<BookWantedInquiryMessageResponse> listMessages(UUID inquiryId, UUID userId);

    BookWantedInquiryMessageResponse sendMessage(UUID inquiryId, UUID senderId, SendMessageRequest request);
}
