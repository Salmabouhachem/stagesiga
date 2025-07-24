package siga.pfa.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import siga.pfa.backend.entity.User;
import java.util.List;


public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
