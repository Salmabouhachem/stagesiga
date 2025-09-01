package siga.pfa.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "devis")
public class Devis {

    public enum Status {
        DRAFT, SENT, APPROVED, REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "demande_id")
    private DemandeBranchement demande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id")
    private Centre centre;

    @Column(precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Status status = Status.DRAFT;

    @Column(length = 3, nullable = false)
    private String currency = "TND";

    @Column(columnDefinition = "TEXT")
    private String description;

    private String articlesBranchement;
    private String diametreBranchement;
    private String calibreCompteur;

    private String clientId;
    private String clientName;

    /* =================== GETTERS & SETTERS =================== */

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public DemandeBranchement getDemande() {
        return demande;
    }
    public void setDemande(DemandeBranchement demande) {
        this.demande = demande;
    }

    public User getAgent() {
        return agent;
    }
    public void setAgent(User agent) {
        this.agent = agent;
    }

    public Centre getCentre() {
        return centre;
    }
    public void setCentre(Centre centre) {
        this.centre = centre;
    }

    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }

    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public String getArticlesBranchement() {
        return articlesBranchement;
    }
    public void setArticlesBranchement(String articlesBranchement) {
        this.articlesBranchement = articlesBranchement;
    }

    public String getDiametreBranchement() {
        return diametreBranchement;
    }
    public void setDiametreBranchement(String diametreBranchement) {
        this.diametreBranchement = diametreBranchement;
    }

    public String getCalibreCompteur() {
        return calibreCompteur;
    }
    public void setCalibreCompteur(String calibreCompteur) {
        this.calibreCompteur = calibreCompteur;
    }

    public String getClientId() {
        return clientId;
    }
    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientName() {
        return clientName;
    }
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
}
