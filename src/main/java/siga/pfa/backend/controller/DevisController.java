package siga.pfa.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import siga.pfa.backend.dto.DevisRequestDTO;
import siga.pfa.backend.dto.DevisResponseDTO;
import siga.pfa.backend.service.DevisService;

@RestController
@RequestMapping("/api/devis")
@CrossOrigin(origins = "http://localhost:4200")
public class DevisController {

    private final DevisService devisService;

    public DevisController(DevisService devisService) {
        this.devisService = devisService;
    }

    /** ✅ Créer un devis */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    public ResponseEntity<DevisResponseDTO> create(@RequestBody DevisRequestDTO req) {
        return ResponseEntity.ok(devisService.createDevis(req));
    }

    /** ✅ Mettre à jour un devis */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    public ResponseEntity<DevisResponseDTO> update(@PathVariable Long id,
                                                   @RequestBody DevisRequestDTO req) {
        return ResponseEntity.ok(devisService.updateDevis(id, req));
    }

    /** ✅ Tous les devis */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    public List<DevisResponseDTO> getAll() {
        return devisService.getAllDevis();
    }

    /** ✅ Par agent */
    @GetMapping("/agent/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    public List<DevisResponseDTO> byAgent(@PathVariable Long agentId) {
        return devisService.getDevisByAgent(agentId);
    }

    /** ✅ Par demande */
    @GetMapping("/demande/{demandeId}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    public List<DevisResponseDTO> byDemande(@PathVariable Long demandeId) {
    return devisService.getDevisByDemande(demandeId);
}


    /** ✅ Par centre */
    @GetMapping("/centre/{centreId}")
    @PreAuthorize("hasAnyRole('ADMIN','AGENT')")
    public List<DevisResponseDTO> byCentre(@PathVariable Long centreId) {
        return devisService.getDevisByCentre(centreId);
    }
}
