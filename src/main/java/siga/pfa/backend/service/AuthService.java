package siga.pfa.backend.service;

import siga.pfa.backend.controller.LoginRequest;
import siga.pfa.backend.controller.JwtResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
}