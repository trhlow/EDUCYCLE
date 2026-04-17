package com.educycle.bookwanted.application;

import com.educycle.bookwanted.dto.BookWantedPostResponse;
import com.educycle.bookwanted.dto.CreateBookWantedRequest;
import com.educycle.bookwanted.dto.UpdateBookWantedRequest;
import com.educycle.shared.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface BookWantedService {

    PageResponse<BookWantedPostResponse> listOpen(String q, Pageable pageable);

    PageResponse<BookWantedPostResponse> listMine(UUID userId, Pageable pageable);

    BookWantedPostResponse getById(UUID id);

    BookWantedPostResponse create(UUID userId, CreateBookWantedRequest request);

    BookWantedPostResponse update(UUID id, UUID userId, UpdateBookWantedRequest request);

    void delete(UUID id, UUID userId);
}
