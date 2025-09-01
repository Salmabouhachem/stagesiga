package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.entity.Role;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    // CORRECTION : Utiliser une requête JPQL au lieu de la méthode dérivée
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findAllByRoleName(@Param("roleName") Role.RoleName roleName);
    
    @Query("SELECT u FROM User u JOIN u.centres c WHERE c.id = :centreId")
    List<User> findByCentresId(@Param("centreId") Long centreId);
    
    @Query("SELECT u FROM User u JOIN u.roles r JOIN u.centres c WHERE r.name = :roleName AND c.id = :centreId")
    List<User> findByRoleAndCentre(@Param("roleName") Role.RoleName roleName, @Param("centreId") Long centreId);
    
    boolean existsByEmail(String email);
}