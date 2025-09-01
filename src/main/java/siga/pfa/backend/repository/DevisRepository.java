package siga.pfa.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import siga.pfa.backend.entity.Devis;

public interface DevisRepository extends JpaRepository<Devis, Long> {

    List<Devis> findByAgent_Id(Long agentId);

    List<Devis> findByDemande_Id(Long demandeId);
    List<Devis> findByCentre_Id(Long centreId); 
}
