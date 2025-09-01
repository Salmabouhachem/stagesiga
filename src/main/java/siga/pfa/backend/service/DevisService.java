package siga.pfa.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import siga.pfa.backend.dto.DevisRequestDTO;
import siga.pfa.backend.dto.DevisResponseDTO;
import siga.pfa.backend.entity.Centre;
import siga.pfa.backend.entity.DemandeBranchement;
import siga.pfa.backend.entity.Devis;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.repository.CentreRepository;
import siga.pfa.backend.repository.DemandeBranchementRepository;
import siga.pfa.backend.repository.DevisRepository;
import siga.pfa.backend.repository.UserRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DevisService {

    private final DevisRepository devisRepo;
    private final DemandeBranchementRepository demandeRepo;
    private final UserRepository userRepo;
    private final CentreRepository centreRepo;

    public DevisService(
            DevisRepository devisRepo,
            DemandeBranchementRepository demandeRepo,
            UserRepository userRepo,
            CentreRepository centreRepo
    ) {
        this.devisRepo = devisRepo;
        this.demandeRepo = demandeRepo;
        this.userRepo = userRepo;
        this.centreRepo = centreRepo;
    }

    /** ✅ Créer un devis */
    public DevisResponseDTO createDevis(DevisRequestDTO dto) {
        Devis devis = new Devis();

        // rattacher la demande
        if (dto.requestId != null) {
            Optional<DemandeBranchement> demande = demandeRepo.findById(dto.requestId);
            demande.ifPresent(devis::setDemande);
        }

        // rattacher l’agent
        if (dto.agentId != null) {
            userRepo.findById(dto.agentId).ifPresent(devis::setAgent);
        }

        // rattacher le centre
        if (dto.centerId != null) {
            centreRepo.findById(dto.centerId).ifPresent(devis::setCentre);
        }

        devis.setAmount(dto.amount);
        devis.setDate(dto.date);
        devis.setStatus(Devis.Status.valueOf(dto.status.toUpperCase())); // "draft" → DRAFT
        devis.setDescription(dto.description);
        devis.setCurrency(dto.currency != null ? dto.currency : "TND");

        devis.setArticlesBranchement(dto.articlesBranchement);
        devis.setDiametreBranchement(dto.diametreBranchement);
        devis.setCalibreCompteur(dto.calibreCompteur);

        devis.setClientId(dto.clientId);
        devis.setClientName(dto.clientName);

        Devis saved = devisRepo.save(devis);
        return DevisResponseDTO.fromEntity(saved);
    }

    /** ✅ Mettre à jour un devis */
    public DevisResponseDTO updateDevis(Long id, DevisRequestDTO dto) {
        Devis devis = devisRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable: " + id));

        devis.setAmount(dto.amount);
        devis.setDate(dto.date);
        devis.setStatus(Devis.Status.valueOf(dto.status.toUpperCase()));
        devis.setDescription(dto.description);
        devis.setCurrency(dto.currency != null ? dto.currency : "TND");

        devis.setArticlesBranchement(dto.articlesBranchement);
        devis.setDiametreBranchement(dto.diametreBranchement);
        devis.setCalibreCompteur(dto.calibreCompteur);

        devis.setClientId(dto.clientId);
        devis.setClientName(dto.clientName);

        return DevisResponseDTO.fromEntity(devisRepo.save(devis));
    }

    /** ✅ Lister tous les devis */
    public List<DevisResponseDTO> getAllDevis() {
        return devisRepo.findAll()
                .stream()
                .map(DevisResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** ✅ Lister les devis par centre */
    public List<DevisResponseDTO> getDevisByCentre(Long centreId) {
        return devisRepo.findById(centreId)
                .stream()
                .map(DevisResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /** ✅ Lister les devis par agent */
    public List<DevisResponseDTO> getDevisByAgent(Long agentId) {
        return devisRepo.findByAgent_Id(agentId)
                .stream()
                .map(DevisResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Devis create(DevisRequestDTO req) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'create'");
    }
    /** ✅ Lister les devis par demande */
public List<DevisResponseDTO> getDevisByDemande(Long demandeId) {
    return devisRepo.findByDemande_Id(demandeId)
            .stream()
            .map(DevisResponseDTO::fromEntity)
            .collect(Collectors.toList());
}

   
}
