package com.educycle.bookwanted.application;

import com.educycle.bookwanted.dto.BookWantedPostResponse;
import com.educycle.bookwanted.dto.CreateBookWantedRequest;
import com.educycle.bookwanted.dto.UpdateBookWantedRequest;
import com.educycle.shared.dto.common.PageResponse;
import com.educycle.bookwanted.domain.BookWantedStatus;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.bookwanted.domain.BookWantedPost;
import com.educycle.user.domain.User;
import com.educycle.bookwanted.persistence.BookWantedPostRepository;
import com.educycle.user.persistence.UserRepository;
import com.educycle.bookwanted.application.BookWantedService;
import com.educycle.shared.util.MessageConstants;
import com.educycle.shared.util.PrivacyHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BookWantedServiceImpl implements BookWantedService {

    private final BookWantedPostRepository bookWantedPostRepository;
    private final UserRepository           userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookWantedPostResponse> listOpen(String q, Pageable pageable) {
        Page<BookWantedPost> page = bookWantedPostRepository.findPublicPage(
                BookWantedStatus.OPEN, blankToNull(q), pageable);
        return toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookWantedPostResponse> listMine(UUID userId, Pageable pageable) {
        Page<BookWantedPost> page = bookWantedPostRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        return toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public BookWantedPostResponse getById(UUID id) {
        BookWantedPost post = bookWantedPostRepository.findWithUserById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tin tìm sách"));
        return map(post);
    }

    @Override
    public BookWantedPostResponse create(UUID userId, CreateBookWantedRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.USER_NOT_FOUND));

        BookWantedPost post = BookWantedPost.builder()
                .user(user)
                .title(request.title().trim())
                .description(blankToNull(request.description()))
                .category(blankToNull(request.category()))
                .status(BookWantedStatus.OPEN)
                .build();
        bookWantedPostRepository.save(post);
        log.info("Book wanted post created: {} by user {}", post.getId(), userId);
        return map(post);
    }

    @Override
    public BookWantedPostResponse update(UUID id, UUID userId, UpdateBookWantedRequest request) {
        BookWantedPost post = loadOwnedPost(id, userId);

        if (request.title() != null && !request.title().isBlank()) {
            post.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            post.setDescription(blankToNull(request.description()));
        }
        if (request.category() != null) {
            post.setCategory(blankToNull(request.category()));
        }
        if (request.status() != null && !request.status().isBlank()) {
            String s = request.status().trim().toUpperCase(Locale.ROOT);
            if (!"CLOSED".equals(s)) {
                throw new BadRequestException("Chỉ có thể đặt trạng thái CLOSED để đóng tin.");
            }
            post.setStatus(BookWantedStatus.CLOSED);
        }

        bookWantedPostRepository.save(post);
        return map(post);
    }

    @Override
    public void delete(UUID id, UUID userId) {
        BookWantedPost post = loadOwnedPost(id, userId);
        bookWantedPostRepository.delete(post);
        log.info("Book wanted post deleted: {} by user {}", id, userId);
    }

    private BookWantedPost loadOwnedPost(UUID id, UUID userId) {
        BookWantedPost post = bookWantedPostRepository.findWithUserById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tin tìm sách"));
        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Bạn chỉ có thể sửa tin của chính mình");
        }
        return post;
    }

    private static String blankToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private PageResponse<BookWantedPostResponse> toPageResponse(Page<BookWantedPost> page) {
        List<BookWantedPostResponse> content = page.getContent().stream().map(this::map).toList();
        return new PageResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast());
    }

    private BookWantedPostResponse map(BookWantedPost w) {
        User u = w.getUser();
        return new BookWantedPostResponse(
                w.getId(),
                w.getTitle(),
                w.getDescription(),
                w.getCategory(),
                w.getStatus().name(),
                w.getCreatedAt(),
                w.getUpdatedAt(),
                u != null ? u.getId() : null,
                PrivacyHelper.maskUsername(u != null ? u.getUsername() : null));
    }
}
