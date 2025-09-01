package siga.pfa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import siga.pfa.backend.entity.Devis;

public class DevisResponseDTO {
    private Long id;
    private Long requestId;
    private Long agentId;
    private Long centerId;
    private BigDecimal amount;
    private LocalDate date;
    private String status;
    private String description;
    private String currency;
    private String articlesBranchement;
    private String diametreBranchement;
    private String calibreCompteur;
    private String clientId;
    private String clientName;

    // ===== Mapping depuis l'entité =====
    public static DevisResponseDTO fromEntity(Devis d) {
        DevisResponseDTO dto = new DevisResponseDTO();
        dto.id = d.getId();
        dto.requestId = d.getDemande() != null ? d.getDemande().getId() : null;
        dto.agentId = d.getAgent() != null ? d.getAgent().getId() : null;
        dto.centerId = d.getCentre() != null ? d.getCentre().getId() : null;
        dto.amount = d.getAmount();
        dto.date = d.getDate();
        dto.status = d.getStatus().name().toLowerCase();
        dto.description = d.getDescription();
        dto.currency = d.getCurrency();
        dto.articlesBranchement = d.getArticlesBranchement();
        dto.diametreBranchement = d.getDiametreBranchement();
        dto.calibreCompteur = d.getCalibreCompteur();
        dto.clientId = d.getClientId();
        dto.clientName = d.getClientName();
        return dto;
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public Long getCenterId() { return centerId; }
    public void setCenterId(Long centerId) { this.centerId = centerId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getArticlesBranchement() { return articlesBranchement; }
    public void setArticlesBranchement(String articlesBranchement) { this.articlesBranchement = articlesBranchement; }

    public String getDiametreBranchement() { return diametreBranchement; }
    public void setDiametreBranchement(String diametreBranchement) { this.diametreBranchement = diametreBranchement; }

    public String getCalibreCompteur() { return calibreCompteur; }
    public void setCalibreCompteur(String calibreCompteur) { this.calibreCompteur = calibreCompteur; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
}
