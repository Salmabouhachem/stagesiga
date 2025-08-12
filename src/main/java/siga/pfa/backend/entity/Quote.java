package siga.pfa.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "quotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String client;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private QuoteStatus status;

    private Double amount;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Enum interne
    public enum QuoteStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}

