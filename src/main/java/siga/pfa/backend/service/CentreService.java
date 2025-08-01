package siga.pfa.backend.service;

import siga.pfa.backend.entity.Centre;
import java.util.List;

public interface CentreService {
    Centre createCentre(Centre centre);
    List<Centre> getAllCentres();
    Centre getCentreById(Long id);
    void affecterUserToCentre(Long userId, Long centreId);
}