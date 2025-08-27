package siga.pfa.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "demande_branchement") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeBranchement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String client;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private DemandeStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String nom;
    private String prenom;
    private String email;
    private String cin;
    private String telephone;
    private String adresse;

    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private NatureClient natureClient;

    @Enumerated(EnumType.STRING)
    @Column(name = "usage_type")
    private Usage usage;

    public enum DemandeStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
     public enum NatureClient {
        PARTICULIER,
        ENTREPRISE,
        ADMINISTRATION,
        AUTRE
    }
    public enum Usage {
        DOMESTIQUE,
        COMMERCIAL,
        INDUSTRIEL,
        AGRICOLE
    }
}