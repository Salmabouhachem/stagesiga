// CentreController.java
package siga.pfa.backend.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import siga.pfa.backend.entity.Centre;
import siga.pfa.backend.repository.CentreRepository;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import siga.pfa.backend.entity.Centre;
import siga.pfa.backend.service.CentreService;

import java.util.List;

@RestController
@RequestMapping("/api/centres")
@CrossOrigin(origins = "http://localhost:4200")
public class CentreController {

    private final CentreService centreService;

    public CentreController(CentreService centreService) {
        this.centreService = centreService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Centre createCentre(@RequestBody Centre centre) {
        return centreService.createCentre(centre);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Centre> getAllCentres() {
        return centreService.getAllCentres();
    }

    @PostMapping("/{centreId}/affecter/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public void affecterUserToCentre(@PathVariable Long centreId, @PathVariable Long userId) {
        centreService.affecterUserToCentre(userId, centreId);
    }
}