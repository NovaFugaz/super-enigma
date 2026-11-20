package com.patito.sonidoVivo.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.patito.sonidoVivo.dto.reports.SalesReportResponse;
import com.patito.sonidoVivo.dto.reports.SalesReportResponse.SalesByDate;
import com.patito.sonidoVivo.dto.reports.SalesReportResponse.TopProduct;
import com.patito.sonidoVivo.enums.OrderStatus;
import com.patito.sonidoVivo.model.CustomerOrder;
import com.patito.sonidoVivo.model.OrderItem;
import com.patito.sonidoVivo.repository.CustomerOrderRepository;

import lombok.RequiredArgsConstructor;

// pero te odio imports

@Service 
@RequiredArgsConstructor 
public class ReportService {

    private static final ZoneId ZONE = ZoneId.of("America/Santiago");
    private static final DateTimeFormatter CSV_DATE = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final int TOP_PRODUCTS = 5;
    private static final int MAX_DAYS = 365;

    private final CustomerOrderRepository orders;

    @Transactional(readOnly = true)
    public SalesReportResponse sales(Integer days) {
        List<CustomerOrder> list = load(days);

        long totalSales = list.stream().mapToLong(o -> o.getTotal()).sum();
        long unitsSold = list.stream()
                .flatMap(o -> o.getItems().stream())
                .mapToLong(i -> i.getQuantity())
                .sum();

        return new SalesReportResponse(days, list.size(), totalSales, unitsSold,
                salesByDate(list), topProducts(list));
    }

    private List<SalesByDate> salesByDate(List<CustomerOrder> list) {
        Map<LocalDate, long[]> byDate = new TreeMap<>();
        for (CustomerOrder o : list) {
            LocalDate day = o.getCreatedAt().atZone(ZONE).toLocalDate();
            long[] acc = byDate.computeIfAbsent(day, k -> new long[2]);
            acc[0]++; 
            acc[1] += o.getTotal();   
        }
        return byDate.entrySet().stream()
                .map(e -> new SalesByDate(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();
    }

    private List<TopProduct> topProducts(List<CustomerOrder> list) {
        Map<String, TopProduct> totals = new LinkedHashMap<>();
        for (CustomerOrder o : list) {
            for (OrderItem i : o.getItems()) {
                totals.merge(i.getCode(),
                        new TopProduct(i.getCode(), i.getName(), i.getQuantity(), i.getLineTotal()),
                        (a, b) -> new TopProduct(a.code(), a.name(),
                                a.units() + b.units(), a.revenue() + b.revenue()));
            }
        }
        return totals.values().stream()
                .sorted(Comparator.comparingLong(TopProduct::revenue).reversed())
                .limit(TOP_PRODUCTS)
                .toList();
    }

    @Transactional(readOnly = true)
    public String salesCsv(Integer days) {
        List<CustomerOrder> list = load(days);

        Stream<List<String>> header = Stream.of(List.of(
                "Fecha", "Pedido", "Cliente", "Correo", "Estado", "Seguimiento", "Productos", "Total"));

        Stream<List<String>> rows = list.stream().map(o -> List.of(
                o.getCreatedAt().atZone(ZONE).format(CSV_DATE),
                o.getId(),
                o.getCustomer().getName(),
                o.getCustomer().getEmail(),
                o.getStatus().name().toLowerCase(),
                o.getTrackingNumber(),
                String.valueOf(o.getItems().stream().mapToLong(i -> i.getQuantity()).sum()),
                String.valueOf(o.getTotal())));

        return "\uFEFF" + Stream.concat(header, rows)
                .map(row -> row.stream().map(ReportService::csvCell).collect(Collectors.joining(";")))
                .collect(Collectors.joining("\r\n"));
    }

    private static String csvCell(String value) {
        String text = value == null ? "" : value;
        if (!text.isEmpty() && "=+-@\t\r".indexOf(text.charAt(0)) >= 0) {
            text = "'" + text;
        }
        return "\"" + text.replace("\"", "\"\"") + "\"";
    }
	
    private List<CustomerOrder> load(Integer days) {
        if (days != null && (days < 1 || days > MAX_DAYS)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "days debe estar entre 1 y " + MAX_DAYS);
        }
        Instant since = days == null ? Instant.EPOCH : Instant.now().minus(days, ChronoUnit.DAYS);
        return orders.findForReport(OrderStatus.RECHAZADO, since);
    }
}

