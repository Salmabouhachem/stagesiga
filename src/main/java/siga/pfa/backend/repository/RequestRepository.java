package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import siga.pfa.backend.entity.Request;

public interface RequestRepository extends JpaRepository<Request, Long> { }
