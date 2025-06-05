package com.petfoodstore.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roomId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private User staff; // Admin or Employee handling the chat

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType = RoomType.SUPPORT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastMessageAt;

    private LocalDateTime closedAt;

    // Subject or title of the conversation
    private String subject;

    // Priority level
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.NORMAL;

    public enum RoomType {
        SUPPORT,    // Customer support
        ORDER,      // Order-related chat
        GENERAL     // General inquiries
    }

    public enum RoomStatus {
        ACTIVE,     // Active conversation
        WAITING,    // Waiting for staff response
        CLOSED,     // Conversation closed
        RESOLVED    // Issue resolved
    }

    public enum Priority {
        LOW, NORMAL, HIGH, URGENT
    }

    public void updateLastMessageTime() {
        this.lastMessageAt = LocalDateTime.now();
    }
}