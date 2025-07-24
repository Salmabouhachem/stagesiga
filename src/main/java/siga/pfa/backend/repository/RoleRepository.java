package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import siga.pfa.backend.entity.Role;
import siga.pfa.backend.entity.Role.RoleName;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName roleName);
}