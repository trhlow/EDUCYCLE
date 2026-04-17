#!/usr/bin/env python3
"""
One-shot BE-2 migration: flat packages -> domain-first under com.educycle.

Do NOT re-run on an already-migrated tree (paths will be wrong).

Run once from educycle-java: python scripts/migrate_domain_packages.py
"""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # educycle-java
MAIN = ROOT / "src/main/java/com/educycle"
TEST = ROOT / "src/test/java/com/educycle"

# (source relative to MAIN or TEST, destination relative to com/educycle)
MOVES_MAIN: list[tuple[str, str]] = [
    # auth (config/security/exception/util moved in earlier steps)
    ("controller/AuthController.java", "auth/api/AuthController.java"),
    ("service/AuthService.java", "auth/application/AuthService.java"),
    ("service/impl/AuthServiceImpl.java", "auth/application/AuthServiceImpl.java"),
    ("service/MailService.java", "shared/mail/MailService.java"),
    # user
    ("controller/UsersController.java", "user/api/UsersController.java"),
    ("controller/PublicProfileController.java", "user/api/PublicProfileController.java"),
    ("service/UserProfileService.java", "user/application/UserProfileService.java"),
    ("service/impl/UserProfileServiceImpl.java", "user/application/UserProfileServiceImpl.java"),
    ("model/User.java", "user/domain/User.java"),
    ("enums/Role.java", "user/domain/Role.java"),
    ("repository/UserRepository.java", "user/persistence/UserRepository.java"),
    # listing
    ("controller/ProductsController.java", "listing/api/ProductsController.java"),
    ("controller/CategoriesController.java", "listing/api/CategoriesController.java"),
    ("controller/FileUploadController.java", "listing/api/FileUploadController.java"),
    ("service/ProductService.java", "listing/application/ProductService.java"),
    ("service/impl/ProductServiceImpl.java", "listing/application/ProductServiceImpl.java"),
    ("service/CategoryService.java", "listing/application/CategoryService.java"),
    ("service/impl/CategoryServiceImpl.java", "listing/application/CategoryServiceImpl.java"),
    ("model/Product.java", "listing/domain/Product.java"),
    ("model/Category.java", "listing/domain/Category.java"),
    ("enums/ProductStatus.java", "listing/domain/ProductStatus.java"),
    ("repository/ProductRepository.java", "listing/persistence/ProductRepository.java"),
    ("repository/CategoryRepository.java", "listing/persistence/CategoryRepository.java"),
    ("repository/spec/ProductSpecifications.java", "listing/persistence/ProductSpecifications.java"),
    # transaction
    ("controller/TransactionsController.java", "transaction/api/TransactionsController.java"),
    ("controller/ChatController.java", "transaction/api/ChatController.java"),
    ("service/TransactionService.java", "transaction/application/TransactionService.java"),
    ("service/impl/TransactionServiceImpl.java", "transaction/application/TransactionServiceImpl.java"),
    ("service/MessageService.java", "transaction/application/MessageService.java"),
    ("service/impl/MessageServiceImpl.java", "transaction/application/MessageServiceImpl.java"),
    ("service/TransactionExpiryService.java", "transaction/application/TransactionExpiryService.java"),
    ("service/impl/TransactionExpiryServiceImpl.java", "transaction/application/TransactionExpiryServiceImpl.java"),
    ("model/Transaction.java", "transaction/domain/Transaction.java"),
    ("model/Message.java", "transaction/domain/Message.java"),
    ("enums/TransactionStatus.java", "transaction/domain/TransactionStatus.java"),
    ("repository/TransactionRepository.java", "transaction/persistence/TransactionRepository.java"),
    ("repository/MessageRepository.java", "transaction/persistence/MessageRepository.java"),
    ("scheduler/TransactionExpiryScheduler.java", "transaction/schedule/TransactionExpiryScheduler.java"),
    # review
    ("controller/ReviewsController.java", "review/api/ReviewsController.java"),
    ("service/ReviewService.java", "review/application/ReviewService.java"),
    ("service/impl/ReviewServiceImpl.java", "review/application/ReviewServiceImpl.java"),
    ("model/Review.java", "review/domain/Review.java"),
    ("repository/ReviewRepository.java", "review/persistence/ReviewRepository.java"),
    # admin
    ("controller/AdminController.java", "admin/api/AdminController.java"),
    ("service/AdminService.java", "admin/application/AdminService.java"),
    ("service/impl/AdminServiceImpl.java", "admin/application/AdminServiceImpl.java"),
    # wishlist
    ("controller/WishlistController.java", "wishlist/api/WishlistController.java"),
    ("service/WishlistService.java", "wishlist/application/WishlistService.java"),
    ("service/impl/WishlistServiceImpl.java", "wishlist/application/WishlistServiceImpl.java"),
    ("model/WishlistItem.java", "wishlist/domain/WishlistItem.java"),
    ("repository/WishlistItemRepository.java", "wishlist/persistence/WishlistItemRepository.java"),
    # notification
    ("controller/NotificationsController.java", "notification/api/NotificationsController.java"),
    ("service/NotificationService.java", "notification/application/NotificationService.java"),
    ("service/impl/NotificationServiceImpl.java", "notification/application/NotificationServiceImpl.java"),
    ("model/Notification.java", "notification/domain/Notification.java"),
    ("repository/NotificationRepository.java", "notification/persistence/NotificationRepository.java"),
    # bookwanted
    ("controller/BookWantedController.java", "bookwanted/api/BookWantedController.java"),
    ("controller/BookWantedInquiryController.java", "bookwanted/api/BookWantedInquiryController.java"),
    ("service/BookWantedService.java", "bookwanted/application/BookWantedService.java"),
    ("service/impl/BookWantedServiceImpl.java", "bookwanted/application/BookWantedServiceImpl.java"),
    ("service/BookWantedInquiryService.java", "bookwanted/application/BookWantedInquiryService.java"),
    ("service/impl/BookWantedInquiryServiceImpl.java", "bookwanted/application/BookWantedInquiryServiceImpl.java"),
    ("model/BookWantedPost.java", "bookwanted/domain/BookWantedPost.java"),
    ("model/BookWantedInquiry.java", "bookwanted/domain/BookWantedInquiry.java"),
    ("model/BookWantedInquiryMessage.java", "bookwanted/domain/BookWantedInquiryMessage.java"),
    ("enums/BookWantedStatus.java", "bookwanted/domain/BookWantedStatus.java"),
    ("repository/BookWantedPostRepository.java", "bookwanted/persistence/BookWantedPostRepository.java"),
    ("repository/BookWantedInquiryRepository.java", "bookwanted/persistence/BookWantedInquiryRepository.java"),
    ("repository/BookWantedInquiryMessageRepository.java", "bookwanted/persistence/BookWantedInquiryMessageRepository.java"),
    # media
    ("controller/MediaController.java", "media/api/MediaController.java"),
    ("service/UnsplashMediaService.java", "media/application/UnsplashMediaService.java"),
    ("service/impl/UnsplashMediaServiceImpl.java", "media/application/UnsplashMediaServiceImpl.java"),
    # ai
    ("controller/AiChatController.java", "ai/api/AiChatController.java"),
    ("service/AiChatService.java", "ai/application/AiChatService.java"),
    ("service/RagRetrievalService.java", "ai/application/RagRetrievalService.java"),
    ("service/OpenAiEmbeddingService.java", "ai/application/OpenAiEmbeddingService.java"),
    ("model/AiKnowledgeChunk.java", "ai/domain/AiKnowledgeChunk.java"),
    ("repository/AiKnowledgeChunkRepository.java", "ai/persistence/AiKnowledgeChunkRepository.java"),
    # public health -> shared
    ("controller/PublicHealthController.java", "shared/api/PublicHealthController.java"),
]

# Whole directories under dto/
DTO_DIRS = [
    ("dto/auth", "auth/dto"),
    ("dto/user", "user/dto"),
    ("dto/product", "listing/dto/product"),
    ("dto/category", "listing/dto/category"),
    ("dto/transaction", "transaction/dto/transaction"),
    ("dto/message", "transaction/dto/message"),
    ("dto/review", "review/dto"),
    ("dto/admin", "admin/dto"),
    ("dto/wishlist", "wishlist/dto"),
    ("dto/notification", "notification/dto"),
    ("dto/bookwanted", "bookwanted/dto"),
    ("dto/media", "media/dto"),
    ("dto/common", "shared/dto/common"),
]


def collect_dir_moves() -> list[tuple[Path, Path]]:
    out: list[tuple[Path, Path]] = []
    for src_dir, dst_dir in DTO_DIRS:
        s = MAIN / src_dir
        if not s.is_dir():
            continue
        for f in s.glob("*.java"):
            rel = f.relative_to(MAIN)
            name = f.name
            out.append((f, MAIN / dst_dir / name))
    return out


def ensure_parent(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)


def move_file(src: Path, dst: Path) -> None:
    ensure_parent(dst)
    if dst.exists():
        dst.unlink()
    shutil.move(str(src), str(dst))


def package_for_path(rel_under_educycle: str) -> str:
    parts = Path(rel_under_educycle.replace("\\", "/")).parts
    if len(parts) <= 1:
        return "com.educycle"
    return "com.educycle." + ".".join(parts[:-1]).replace("/", ".")


def rewrite_java(content: str, new_package: str) -> str:
    content = re.sub(
        r"^package\s+com\.educycle(?:\.[\w.]+)?;",
        f"package {new_package};",
        content,
        count=1,
        flags=re.MULTILINE,
    )
    return content


# Ordered replacements (longest / most specific first)
IMPORT_REPLACEMENTS: list[tuple[str, str]] = [
    ("com.educycle.repository.spec.ProductSpecifications", "com.educycle.listing.persistence.ProductSpecifications"),
    ("com.educycle.repository.WishlistItemRepository", "com.educycle.wishlist.persistence.WishlistItemRepository"),
    ("com.educycle.repository.BookWantedInquiryMessageRepository", "com.educycle.bookwanted.persistence.BookWantedInquiryMessageRepository"),
    ("com.educycle.repository.BookWantedInquiryRepository", "com.educycle.bookwanted.persistence.BookWantedInquiryRepository"),
    ("com.educycle.repository.BookWantedPostRepository", "com.educycle.bookwanted.persistence.BookWantedPostRepository"),
    ("com.educycle.repository.AiKnowledgeChunkRepository", "com.educycle.ai.persistence.AiKnowledgeChunkRepository"),
    ("com.educycle.repository.NotificationRepository", "com.educycle.notification.persistence.NotificationRepository"),
    ("com.educycle.repository.MessageRepository", "com.educycle.transaction.persistence.MessageRepository"),
    ("com.educycle.repository.TransactionRepository", "com.educycle.transaction.persistence.TransactionRepository"),
    ("com.educycle.repository.ReviewRepository", "com.educycle.review.persistence.ReviewRepository"),
    ("com.educycle.repository.CategoryRepository", "com.educycle.listing.persistence.CategoryRepository"),
    ("com.educycle.repository.ProductRepository", "com.educycle.listing.persistence.ProductRepository"),
    ("com.educycle.repository.UserRepository", "com.educycle.user.persistence.UserRepository"),
    ("com.educycle.model.WishlistItem", "com.educycle.wishlist.domain.WishlistItem"),
    ("com.educycle.model.BookWantedInquiryMessage", "com.educycle.bookwanted.domain.BookWantedInquiryMessage"),
    ("com.educycle.model.BookWantedInquiry", "com.educycle.bookwanted.domain.BookWantedInquiry"),
    ("com.educycle.model.BookWantedPost", "com.educycle.bookwanted.domain.BookWantedPost"),
    ("com.educycle.model.AiKnowledgeChunk", "com.educycle.ai.domain.AiKnowledgeChunk"),
    ("com.educycle.model.Notification", "com.educycle.notification.domain.Notification"),
    ("com.educycle.model.Message", "com.educycle.transaction.domain.Message"),
    ("com.educycle.model.Transaction", "com.educycle.transaction.domain.Transaction"),
    ("com.educycle.model.Review", "com.educycle.review.domain.Review"),
    ("com.educycle.model.Category", "com.educycle.listing.domain.Category"),
    ("com.educycle.model.Product", "com.educycle.listing.domain.Product"),
    ("com.educycle.model.User", "com.educycle.user.domain.User"),
    ("com.educycle.enums.TransactionStatus", "com.educycle.transaction.domain.TransactionStatus"),
    ("com.educycle.enums.ProductStatus", "com.educycle.listing.domain.ProductStatus"),
    ("com.educycle.enums.BookWantedStatus", "com.educycle.bookwanted.domain.BookWantedStatus"),
    ("com.educycle.enums.Role", "com.educycle.user.domain.Role"),
    ("com.educycle.dto.common.", "com.educycle.shared.dto.common."),
    ("com.educycle.dto.media.", "com.educycle.media.dto."),
    ("com.educycle.dto.bookwanted.", "com.educycle.bookwanted.dto."),
    ("com.educycle.dto.notification.", "com.educycle.notification.dto."),
    ("com.educycle.dto.wishlist.", "com.educycle.wishlist.dto."),
    ("com.educycle.dto.admin.", "com.educycle.admin.dto."),
    ("com.educycle.dto.review.", "com.educycle.review.dto."),
    ("com.educycle.dto.message.", "com.educycle.transaction.dto.message."),
    ("com.educycle.dto.transaction.", "com.educycle.transaction.dto.transaction."),
    ("com.educycle.dto.category.", "com.educycle.listing.dto.category."),
    ("com.educycle.dto.product.", "com.educycle.listing.dto.product."),
    ("com.educycle.dto.user.", "com.educycle.user.dto."),
    ("com.educycle.dto.auth.", "com.educycle.auth.dto."),
    ("com.educycle.config.", "com.educycle.shared.config."),
    ("com.educycle.security.", "com.educycle.shared.security."),
    ("com.educycle.exception.", "com.educycle.shared.exception."),
    ("com.educycle.util.", "com.educycle.shared.util."),
]

# Fix service.impl -> domain paths (the blind replace com.educycle.service.impl. is wrong)
# We already moved files so service.impl no longer exists; IMPORT_REPLACEMENTS must map old imports only.

SERVICE_IMPL_MAP = [
    ("com.educycle.service.impl.AuthServiceImpl", "com.educycle.auth.application.AuthServiceImpl"),
    ("com.educycle.service.impl.UserProfileServiceImpl", "com.educycle.user.application.UserProfileServiceImpl"),
    ("com.educycle.service.impl.ProductServiceImpl", "com.educycle.listing.application.ProductServiceImpl"),
    ("com.educycle.service.impl.CategoryServiceImpl", "com.educycle.listing.application.CategoryServiceImpl"),
    ("com.educycle.service.impl.TransactionServiceImpl", "com.educycle.transaction.application.TransactionServiceImpl"),
    ("com.educycle.service.impl.MessageServiceImpl", "com.educycle.transaction.application.MessageServiceImpl"),
    ("com.educycle.service.impl.TransactionExpiryServiceImpl", "com.educycle.transaction.application.TransactionExpiryServiceImpl"),
    ("com.educycle.service.impl.ReviewServiceImpl", "com.educycle.review.application.ReviewServiceImpl"),
    ("com.educycle.service.impl.AdminServiceImpl", "com.educycle.admin.application.AdminServiceImpl"),
    ("com.educycle.service.impl.WishlistServiceImpl", "com.educycle.wishlist.application.WishlistServiceImpl"),
    ("com.educycle.service.impl.NotificationServiceImpl", "com.educycle.notification.application.NotificationServiceImpl"),
    ("com.educycle.service.impl.BookWantedServiceImpl", "com.educycle.bookwanted.application.BookWantedServiceImpl"),
    ("com.educycle.service.impl.BookWantedInquiryServiceImpl", "com.educycle.bookwanted.application.BookWantedInquiryServiceImpl"),
    ("com.educycle.service.impl.UnsplashMediaServiceImpl", "com.educycle.media.application.UnsplashMediaServiceImpl"),
]

SERVICE_MAP = [
    ("com.educycle.service.AuthService", "com.educycle.auth.application.AuthService"),
    ("com.educycle.service.UserProfileService", "com.educycle.user.application.UserProfileService"),
    ("com.educycle.service.ProductService", "com.educycle.listing.application.ProductService"),
    ("com.educycle.service.CategoryService", "com.educycle.listing.application.CategoryService"),
    ("com.educycle.service.TransactionService", "com.educycle.transaction.application.TransactionService"),
    ("com.educycle.service.MessageService", "com.educycle.transaction.application.MessageService"),
    ("com.educycle.service.TransactionExpiryService", "com.educycle.transaction.application.TransactionExpiryService"),
    ("com.educycle.service.ReviewService", "com.educycle.review.application.ReviewService"),
    ("com.educycle.service.AdminService", "com.educycle.admin.application.AdminService"),
    ("com.educycle.service.WishlistService", "com.educycle.wishlist.application.WishlistService"),
    ("com.educycle.service.NotificationService", "com.educycle.notification.application.NotificationService"),
    ("com.educycle.service.BookWantedService", "com.educycle.bookwanted.application.BookWantedService"),
    ("com.educycle.service.BookWantedInquiryService", "com.educycle.bookwanted.application.BookWantedInquiryService"),
    ("com.educycle.service.UnsplashMediaService", "com.educycle.media.application.UnsplashMediaService"),
    ("com.educycle.service.MailService", "com.educycle.shared.mail.MailService"),
    ("com.educycle.service.AiChatService", "com.educycle.ai.application.AiChatService"),
    ("com.educycle.service.RagRetrievalService", "com.educycle.ai.application.RagRetrievalService"),
    ("com.educycle.service.OpenAiEmbeddingService", "com.educycle.ai.application.OpenAiEmbeddingService"),
]

CONTROLLER_MAP = [
    ("com.educycle.controller.AuthController", "com.educycle.auth.api.AuthController"),
    ("com.educycle.controller.UsersController", "com.educycle.user.api.UsersController"),
    ("com.educycle.controller.PublicProfileController", "com.educycle.user.api.PublicProfileController"),
    ("com.educycle.controller.ProductsController", "com.educycle.listing.api.ProductsController"),
    ("com.educycle.controller.CategoriesController", "com.educycle.listing.api.CategoriesController"),
    ("com.educycle.controller.FileUploadController", "com.educycle.listing.api.FileUploadController"),
    ("com.educycle.controller.TransactionsController", "com.educycle.transaction.api.TransactionsController"),
    ("com.educycle.controller.ChatController", "com.educycle.transaction.api.ChatController"),
    ("com.educycle.controller.ReviewsController", "com.educycle.review.api.ReviewsController"),
    ("com.educycle.controller.AdminController", "com.educycle.admin.api.AdminController"),
    ("com.educycle.controller.WishlistController", "com.educycle.wishlist.api.WishlistController"),
    ("com.educycle.controller.NotificationsController", "com.educycle.notification.api.NotificationsController"),
    ("com.educycle.controller.BookWantedController", "com.educycle.bookwanted.api.BookWantedController"),
    ("com.educycle.controller.BookWantedInquiryController", "com.educycle.bookwanted.api.BookWantedInquiryController"),
    ("com.educycle.controller.MediaController", "com.educycle.media.api.MediaController"),
    ("com.educycle.controller.AiChatController", "com.educycle.ai.api.AiChatController"),
    ("com.educycle.controller.PublicHealthController", "com.educycle.shared.api.PublicHealthController"),
]

SCHEDULER_MAP = [
    ("com.educycle.scheduler.TransactionExpiryScheduler", "com.educycle.transaction.schedule.TransactionExpiryScheduler"),
]


def full_import_replacements() -> list[tuple[str, str]]:
    # Explicit service/controller/scheduler maps before generic dto/config replacements
    return (
        SERVICE_IMPL_MAP
        + SERVICE_MAP
        + CONTROLLER_MAP
        + SCHEDULER_MAP
        + IMPORT_REPLACEMENTS
    )


def apply_imports(content: str) -> str:
    for old, new in full_import_replacements():
        content = content.replace(old, new)
    return content


def main() -> None:
    # 1) Move whole config dir
    cfg_src = MAIN / "config"
    cfg_dst = MAIN / "shared/config"
    if cfg_src.exists():
        for f in sorted(cfg_src.rglob("*.java")):
            rel = f.relative_to(cfg_src)
            move_file(f, cfg_dst / rel)
        # remove empty dirs
        shutil.rmtree(cfg_src, ignore_errors=True)

    # 2) Move security, exception, util dirs
    for dirname, target in [
        ("security", "shared/security"),
        ("exception", "shared/exception"),
        ("util", "shared/util"),
    ]:
        src = MAIN / dirname
        if not src.exists():
            continue
        for f in src.glob("*.java"):
            move_file(f, MAIN / target / f.name)
        src.rmdir()

    # 3) Individual file moves
    for src_rel, dst_rel in MOVES_MAIN:
        src = MAIN / src_rel
        dst = MAIN / dst_rel
        if src.exists():
            move_file(src, dst)

    # 4) DTO dir moves
    for src, dst in collect_dir_moves():
        move_file(src, dst)

    # Remove empty dto tree
    dto_root = MAIN / "dto"
    if dto_root.exists():
        shutil.rmtree(dto_root, ignore_errors=True)

    # Remove empty controller, service, model, repository, enums, scheduler
    for d in ["controller", "service", "model", "repository", "enums", "scheduler"]:
        p = MAIN / d
        if p.exists():
            shutil.rmtree(p, ignore_errors=True)

    # 5) Create shared.response.ApiErrorBody + update GlobalExceptionHandler
    resp_dir = MAIN / "shared/response"
    resp_dir.mkdir(parents=True, exist_ok=True)
    api_error = resp_dir / "ApiErrorBody.java"
    api_error.write_text(
        """package com.educycle.shared.response;

import java.util.List;

/**
 * Canonical JSON error shape for API errors ({@code success=false}).
 */
public record ApiErrorBody(boolean success, String message, List<String> errors) {

    public static ApiErrorBody of(String message, List<String> errors) {
        return new ApiErrorBody(false, message, errors);
    }

    public static ApiErrorBody of(String message) {
        return of(message, List.of());
    }
}
""",
        encoding="utf-8",
    )

    # 6) Rewrite all Java under main + test
    java_roots = [MAIN, TEST]
    for root in java_roots:
        if not root.exists():
            continue
        for path in sorted(root.rglob("*.java")):
            rel = path.relative_to(root)
            text = path.read_text(encoding="utf-8")
            if root == MAIN:
                pkg = package_for_path(str(rel))
            else:
                pkg = (
                    "com.educycle." + ".".join(rel.parts[:-1]).replace("\\", ".")
                    if len(rel.parts) > 1
                    else "com.educycle"
                )
            text = rewrite_java(text, pkg)
            text = apply_imports(text)
            path.write_text(text, encoding="utf-8")

    # GlobalExceptionHandler: use public ApiErrorBody instead of inner record
    gh = MAIN / "shared/exception/GlobalExceptionHandler.java"
    if gh.exists():
        t = gh.read_text(encoding="utf-8")
        t = re.sub(
            r"\n\s*private record ErrorResponse\(boolean success, String message, List<String> errors\) \{.*?\n\s*\}\s*\n",
            "\n",
            t,
            count=1,
            flags=re.DOTALL,
        )
        t = t.replace("ErrorResponse", "ApiErrorBody")
        if "import com.educycle.shared.response.ApiErrorBody;" not in t:
            t = t.replace(
                "import com.educycle.shared.util.MessageConstants;",
                "import com.educycle.shared.response.ApiErrorBody;\nimport com.educycle.shared.util.MessageConstants;",
            )
        gh.write_text(t, encoding="utf-8")

    # 7) EduCycleApplication imports
    app = MAIN / "EduCycleApplication.java"
    t = app.read_text(encoding="utf-8")
    t = t.replace("com.educycle.config.", "com.educycle.shared.config.")
    app.write_text(t, encoding="utf-8")

    print("Done. Run: mvn -f educycle-java/pom.xml -q compile")


if __name__ == "__main__":
    main()
