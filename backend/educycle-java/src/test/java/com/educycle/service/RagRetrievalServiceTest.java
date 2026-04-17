package com.educycle.service;

import com.educycle.ai.application.RagRetrievalService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RagRetrievalServiceTest {

    @Test
    void cosineIdenticalIsOne() {
        double[] v = { 0.6, 0.8, 0 };
        assertEquals(1.0, RagRetrievalService.cosineSimilarity(v, v), 1e-9);
    }

    @Test
    void cosineOrthogonalIsZero() {
        assertEquals(0.0, RagRetrievalService.cosineSimilarity(
                new double[] { 1, 0, 0 },
                new double[] { 0, 1, 0 }
        ), 1e-9);
    }

    @Test
    void cosineOppositeIsNegativeOne() {
        assertEquals(-1.0, RagRetrievalService.cosineSimilarity(
                new double[] { 1, 0 },
                new double[] { -1, 0 }
        ), 1e-9);
    }

    @Test
    void cosineMismatchedLengthReturnsNegative() {
        assertTrue(RagRetrievalService.cosineSimilarity(new double[] { 1 }, new double[] { 1, 0 }) < 0);
    }
}
