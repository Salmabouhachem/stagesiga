package siga.pfa.backend.controller;

import org.springframework.web.bind.annotation.*;

import siga.pfa.backend.entity.DemandeBranchement;
import siga.pfa.backend.service.DemandeService;

import java.util.List;

@RestController
@RequestMapping("/api/demandes/interventions")
@CrossOrigin(origins = "http://localhost:64095")
public class DemandeController {
    private final DemandeService demandeService;

    public DemandeController(DemandeService demandeService) {
        this.demandeService = demandeService;
    }
    
    @GetMapping
    public List<DemandeBranchement> getAllDemandes() {
        return demandeService.getAllDemandes();
    }
}