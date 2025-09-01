package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import siga.pfa.backend.entity.Centre;
import java.util.Set;
import java.util.List;
import java.util.Optional;

public interface CentreRepository extends JpaRepository<Centre, Long> {
    Optional<Centre> findByCode(String code);
    Optional<Centre> findByNom(String nom);
    
    @Query("SELECT c FROM Centre c WHERE c.id IN :ids")
    Set<Centre> findAllByIdIn(@Param("ids") Set<Long> ids);
    
    List<Centre> findByVille(String ville);
    boolean existsByCode(String code);
}