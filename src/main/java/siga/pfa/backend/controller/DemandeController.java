package siga.pfa.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import siga.pfa.backend.entity.DemandeBranchement;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.repository.DemandeBranchementRepository;
import siga.pfa.backend.service.DemandeService;

import java.util.List;



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
    @GetMapping("/centre/{centreId}")
    public ResponseEntity<List<DemandeBranchement>> getDemandesByCentre(@PathVariable Long centreId) {
        return ResponseEntity.ok(demandeService.getDemandesByCentre(centreId));
    }
    @GetMapping("/mes")
    @PreAuthorize("hasAnyRole('AGENT','ADMIN')")
    public ResponseEntity<List<DemandeBranchement>> getDemandesPourAgent(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(401).build();
        }
        User currentUser = (User) authentication.getPrincipal();
        // currentUser.getCentres() suppose que User a une relation ManyToMany< Centre >
        return ResponseEntity.ok(demandeService.getDemandesByCentres(currentUser.getCentres()));
    }
}