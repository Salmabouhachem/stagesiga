package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import siga.pfa.backend.entity.DemandeBranchement;

public interface DemandeBranchementRepository extends JpaRepository<DemandeBranchement, Long> { }