package siga.pfa.backend.service;

import org.springframework.stereotype.Service;

import siga.pfa.backend.entity.Centre;
import siga.pfa.backend.entity.DemandeBranchement;
import siga.pfa.backend.repository.DemandeBranchementRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class DemandeService {
    private final DemandeBranchementRepository demandeRepo;

    public DemandeService(DemandeBranchementRepository demandeRepo) {
        this.demandeRepo = demandeRepo;
    }
    public DemandeBranchement addDemandeBranchement(DemandeBranchement demandeBranchement){
        return demandeRepo.save(demandeBranchement);
    }
    
    public List<DemandeBranchement> getAllDemandes() {
        return demandeRepo.findAll();
    }
    
    public Optional<DemandeBranchement> findById(Long id) {
        return demandeRepo.findById(id);
    }

    public DemandeBranchement updateDemande(Long id, DemandeBranchement payload) {
        return demandeRepo.findById(id).map(d -> {
            // mets à jour les champs nécessaires
            d.setClient(payload.getClient());
            d.setNom(payload.getNom());
            d.setPrenom(payload.getPrenom());
            d.setEmail(payload.getEmail());
            d.setTelephone(payload.getTelephone());
            d.setAdresse(payload.getAdresse());
            d.setDescription(payload.getDescription());
            d.setDate(payload.getDate());
            d.setStatus(payload.getStatus());
            d.setNatureClient(payload.getNatureClient());
            d.setUsage(payload.getUsage());
            d.setLatitude(payload.getLatitude());
            d.setLongitude(payload.getLongitude());
            d.setCentre(payload.getCentre());
            return demandeRepo.save(d);
        }).orElseThrow(() -> new IllegalArgumentException("Demande introuvable id=" + id));
    }

    public List<DemandeBranchement> getDemandesByCentre(Long centreId) {
        return demandeRepo.findByCentreId(centreId);
    }

    public List<DemandeBranchement> getDemandesByCentres(Set<Centre> centres) {
        return centres == null || centres.isEmpty() ? List.of() : demandeRepo.findByCentreIn(centres);
    }
}
