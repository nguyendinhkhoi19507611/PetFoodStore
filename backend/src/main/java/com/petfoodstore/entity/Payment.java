package com.petfoodstore.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(unique = true, nullable = false)
    private String paymentId; // ID từ MoMo

    @Column(nullable = false)
    private String transactionId; // Transaction ID từ MoMo

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    private String momoOrderId; // Order ID gửi tới MoMo

    private String momoRequestId; // Request ID từ MoMo

    private String momoSignature; // Signature từ MoMo

    private String responseCode; // Response code từ MoMo

    private String responseMessage; // Response message từ MoMo

    private String paymentUrl; // URL thanh toán MoMo

    @Column(columnDefinition = "TEXT")
    private String rawResponse; // Raw response từ MoMo để debug

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime paidAt;

    private LocalDateTime updatedAt;

    public enum PaymentMethod {
        CASH_ON_DELIVERY, // Thanh toán khi nhận hàng
        MOMO,            // Thanh toán MoMo
        BANK_TRANSFER    // Chuyển khoản ngân hàng
    }

    public enum PaymentStatus {
        PENDING,    // Chờ thanh toán
        PROCESSING, // Đang xử lý
        COMPLETED,  // Đã thanh toán thành công
        FAILED,     // Thanh toán thất bại
        CANCELLED,  // Đã hủy
        REFUNDED    // Đã hoàn tiền
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}