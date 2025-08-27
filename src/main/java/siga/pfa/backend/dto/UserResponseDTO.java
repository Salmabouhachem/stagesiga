package siga.pfa.backend.dto;

import lombok.Data;
import siga.pfa.backend.entity.Centre;
import siga.pfa.backend.entity.User;

import java.util.Set;
import java.util.stream.Collectors;

@Data
public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
    private Set<String> roles; // Rôles simplifiés (sans "ROLE_")
    private Set<String> authorities; // Authorities complètes (avec "ROLE_")
    private Set<String> centres; // Noms des centres

    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.nom = user.getNom();
        this.prenom = user.getPrenom();
        this.telephone = user.getTelephone();
        
        // Rôles simplifiés (pour l'affichage frontend)
        this.roles = user.getRoles().stream()
                .map(role -> role.getName().name().replace("ROLE_", ""))
                .collect(Collectors.toSet());
        
        // Authorities complètes (pour la sécurité Spring)
        this.authorities = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
        
        // Centres
        this.centres = user.getCentres().stream()
                .map(Centre::getNom)
                .collect(Collectors.toSet());
    }
}