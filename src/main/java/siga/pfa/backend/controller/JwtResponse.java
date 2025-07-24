package siga.pfa.backend.controller;

import java.util.List;

public class JwtResponse {
    private String token;
    private String email;
    private List<String> roles;
    private String nom;
    private String prenom;
    private String telephone;

    public JwtResponse(String token, String email, List<String> roles, String nom, String prenom, String telephone) {
        this.token = token;
        this.email = email;
        this.roles = roles;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
    }

    // Getters uniquement (optionnellement setters si besoin)
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public List<String> getRoles() { return roles; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getTelephone() { return telephone; }
}
