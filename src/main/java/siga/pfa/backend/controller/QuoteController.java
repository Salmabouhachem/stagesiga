package siga.pfa.backend.controller;
 
import org.springframework.web.bind.annotation.*;

import siga.pfa.backend.entity.Quote;
import siga.pfa.backend.service.QuoteService;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
@CrossOrigin(origins = "http://localhost:4200")
public class QuoteController {
    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @GetMapping
    public List<Quote> getAllQuotes() {
        return quoteService.getAllQuotes();
    }
}