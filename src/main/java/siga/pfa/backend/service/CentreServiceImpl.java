package siga.pfa.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import siga.pfa.backend.entity.Centre;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.repository.CentreRepository;
import siga.pfa.backend.repository.UserRepository;
import siga.pfa.backend.service.CentreService;

import java.util.List;

@Service
public class CentreServiceImpl implements CentreService {

    private final CentreRepository centreRepository;
    private final UserRepository userRepository;

    public CentreServiceImpl(CentreRepository centreRepository, UserRepository userRepository) {
        this.centreRepository = centreRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Centre createCentre(Centre centre) {
        if (centreRepository.existsByCode(centre.getCode())) {
            throw new RuntimeException("Le code du centre existe déjà");
        }
        return centreRepository.save(centre);
    }

    @Override
    public List<Centre> getAllCentres() {
        return centreRepository.findAll();
    }

    @Override
    public Centre getCentreById(Long id) {
        return centreRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Centre non trouvé"));
    }

    @Override
    @Transactional
    public void affecterUserToCentre(Long userId, Long centreId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Centre centre = centreRepository.findById(centreId)
                .orElseThrow(() -> new RuntimeException("Centre non trouvé"));
        
        user.addCentre(centre);
        userRepository.save(user);
    }
}