package com.patito.sonidoVivo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detalle_pedidos")
@Getter
@Setter
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false, length = 30)
    private String productCode;

    @Column(nullable = false, length = 70)
    private String productName;

    @Column(length = 70)
    private String brand;

    @Column(nullable = false, length = 70)
    private String model;

    @Column(nullable = false)
    private Long unitPrice;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Long lineTotal;
}
