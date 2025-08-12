package siga.pfa.backend.service;

import org.springframework.stereotype.Service;

import siga.pfa.backend.entity.Quote;
import siga.pfa.backend.repository.QuoteRepository;

import java.util.List;

@Service
public class QuoteService {
    private final QuoteRepository quoteRepository;

    public QuoteService(QuoteRepository quoteRepository) {
        this.quoteRepository = quoteRepository;
    }

    public List<Quote> getAllQuotes() {
        return quoteRepository.findAll();
    }
}