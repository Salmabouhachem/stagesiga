package siga.pfa.backend.service;

import org.springframework.stereotype.Service;

import siga.pfa.backend.entity.DemandeBranchement;
import siga.pfa.backend.repository.DemandeBranchementRepository;

import java.util.List;

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
}