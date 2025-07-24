package siga.pfa.backend.entity;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "roles")
public class Role {
    public enum RoleName {
        ROLE_ADMIN,
        ROLE_AGENT,
        ROLE_CLIENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING) // Ajouté ici pour bien stocker l'enum en tant que texte
    @Column(unique = true, nullable = false)
    private RoleName name;

    @ManyToMany(mappedBy = "roles")
    private Set<User> users;


    // Constructeurs
    public Role() {}

    public Role(RoleName name) {
        this.name = name;
    }

    // Getters et setters
    public Long getId() {
        return id;
    }

    public RoleName getName() {
        return name;
    }

    public void setName(RoleName name) {
        this.name = name;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}
