package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import siga.pfa.backend.entity.Centre;

public interface CentreRepository extends JpaRepository<Centre, Long> {
    boolean existsByCode(String code);
    boolean existsByNom(String nom);
}