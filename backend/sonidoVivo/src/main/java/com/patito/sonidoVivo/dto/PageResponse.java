package com.patito.sonidoVivo.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema
public class PageResponse<T>
{
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}