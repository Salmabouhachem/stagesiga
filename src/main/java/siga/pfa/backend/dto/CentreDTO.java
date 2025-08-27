package siga.pfa.backend.dto;

import lombok.Data;
import siga.pfa.backend.entity.Centre;

@Data
public class CentreDTO {
    private Long id;
    private String code;
    private String nom;
    private String ville;
    private String adresse;

    public CentreDTO(Centre centre) {
        this.id = centre.getId();
        this.code = centre.getCode();
        this.nom = centre.getNom();
        this.ville = centre.getVille();
        this.adresse = centre.getAdresse();
    }
}