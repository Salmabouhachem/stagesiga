package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import siga.pfa.backend.entity.DemandeBranchement;
import siga.pfa.backend.entity.Centre;

import java.util.List;
import java.util.Set;

public interface DemandeBranchementRepository extends JpaRepository<DemandeBranchement, Long> {
    
    // Trouver les demandes par centres
    List<DemandeBranchement> findByCentreIn(Set<Centre> centres);
    
    // Ou avec une requête personnalisée
    @Query("SELECT d FROM DemandeBranchement d WHERE d.centre IN :centres")
    List<DemandeBranchement> findDemandesByAgentCentres(@Param("centres") Set<Centre> centres);
    
    // Trouver les demandes par ID de centre
    List<DemandeBranchement> findByCentreId(Long centreId);
}