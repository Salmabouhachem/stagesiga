package siga.pfa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import siga.pfa.backend.entity.DemandeBranchement;
import siga.pfa.backend.repository.DemandeBranchementRepository;
import siga.pfa.backend.service.DemandeService;

import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/demandes/interventions")
@CrossOrigin(origins = "http://localhost:4200")
public class DemandeController {
    private final DemandeService demandeService;
    private final DemandeBranchementRepository demandeRepo;

    public DemandeController(DemandeService demandeService,DemandeBranchementRepository demqBranchementRepository) {
        this.demandeService = demandeService;
        this.demandeRepo = demqBranchementRepository;
    }
    @PostMapping
    public DemandeBranchement addDemande(@RequestBody DemandeBranchement demandeBranchement){
        return this.demandeService.addDemandeBranchement(demandeBranchement);
    }
    

    @GetMapping
    public List<DemandeBranchement> getAllDemandes() {
        return demandeService.getAllDemandes();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DemandeBranchement> editDemqnde(@PathVariable Long id, @RequestBody DemandeBranchement demandeBranchement) {
        //TODO: process PUT request
        DemandeBranchement dem = this.demandeRepo.getById(id);
        demandeRepo.save(demandeBranchement);
        return ResponseEntity.ok(demandeBranchement);
    }
}