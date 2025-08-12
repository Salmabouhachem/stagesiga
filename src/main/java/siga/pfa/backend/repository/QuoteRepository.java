package siga.pfa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import siga.pfa.backend.entity.Quote;

public interface QuoteRepository extends JpaRepository<Quote, Long> { }