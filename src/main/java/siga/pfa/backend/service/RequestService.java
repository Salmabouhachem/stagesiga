package siga.pfa.backend.service;



import org.springframework.stereotype.Service;

import siga.pfa.backend.entity.Request;
import siga.pfa.backend.repository.RequestRepository;

import java.util.List;

@Service
public class RequestService {
    private final RequestRepository requestRepository;

    public RequestService(RequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }
}
