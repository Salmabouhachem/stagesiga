package siga.pfa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import siga.pfa.backend.entity.Devis;

public class DevisRequestDTO {
    public Long requestId;               // demandeId (UI: requestId)
    public Long agentId;                 // optionnel si vous le passez
    public Long centerId;                // optionnel
    public BigDecimal amount;
    public LocalDate date;
    public String status;                // "draft" | "sent" | "approved" | "rejected"
    public String description;
    public String currency;

    public String articlesBranchement;
    public String diametreBranchement;
    public String calibreCompteur;

    public String clientId;
    public String clientName;

    // ===== Getters & Setters =====
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
