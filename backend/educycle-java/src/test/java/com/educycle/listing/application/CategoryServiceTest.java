package com.educycle.listing.application;

import com.educycle.listing.api.dto.response.CategoryResponse;
import com.educycle.listing.api.dto.request.CreateCategoryRequest;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.listing.domain.Category;
import com.educycle.listing.infrastructure.persistence.CategoryRepository;
import com.educycle.listing.application.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("should create and return category")
        void shouldCreateCategory() {
            CreateCategoryRequest request = new CreateCategoryRequest("Giáo Trình");
            Category saved = new Category(1, "Giáo Trình", List.of());
            given(categoryRepository.save(any(Category.class))).willReturn(saved);

            CategoryResponse result = categoryService.create(request);

            assertThat(result.name()).isEqualTo("Giáo Trình");
            verify(categoryRepository, times(1)).save(any(Category.class));
        }
    }

    @Nested
    @DisplayName("getById()")
    class GetById {

        @Test
        @DisplayName("should return category when exists")
        void shouldReturn_whenExists() {
            Category category = new Category(1, "Sách", List.of());
            given(categoryRepository.findById(1)).willReturn(Optional.of(category));

            CategoryResponse result = categoryService.getById(1);

            assertThat(result.id()).isEqualTo(1);
            assertThat(result.name()).isEqualTo("Sách");
        }

        @Test
        @DisplayName("should throw NotFoundException when not found")
        void shouldThrow_whenNotFound() {
            given(categoryRepository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> categoryService.getById(99))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    @Nested
    @DisplayName("getAll()")
    class GetAll {

        @Test
        @DisplayName("should return all categories")
        void shouldReturnAll() {
            given(categoryRepository.findAll()).willReturn(List.of(
                    new Category(1, "A", List.of()),
                    new Category(2, "B", List.of()),
                    new Category(3, "C", List.of())
            ));

            List<CategoryResponse> result = categoryService.getAll();

            assertThat(result).hasSize(3);
            assertThat(result).extracting(CategoryResponse::name)
                    .containsExactly("A", "B", "C");
        }
    }

    @Nested
    @DisplayName("delete()")
    class Delete {

        @Test
        @DisplayName("should delete when category exists")
        void shouldDelete_whenExists() {
            Category category = new Category(1, "To Delete", List.of());
            given(categoryRepository.findById(1)).willReturn(Optional.of(category));

            categoryService.delete(1);

            verify(categoryRepository, times(1)).delete(category);
        }

        @Test
        @DisplayName("should throw NotFoundException when category not found")
        void shouldThrow_whenNotFound() {
            given(categoryRepository.findById(99)).willReturn(Optional.empty());

            assertThatThrownBy(() -> categoryService.delete(99))
                    .isInstanceOf(NotFoundException.class);
        }
    }
}
