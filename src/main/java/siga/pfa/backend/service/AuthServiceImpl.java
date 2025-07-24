package siga.pfa.backend.service;


import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.security.JwtUtils;
import siga.pfa.backend.controller.LoginRequest;
import siga.pfa.backend.controller.JwtResponse;
import siga.pfa.backend.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthServiceImpl(AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Override
 public JwtResponse authenticateUser(LoginRequest loginRequest) {
    // 1. Authentifier avec email et password
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            loginRequest.getEmail(),
            loginRequest.getPassword()
        )
    );

    // 2. Stocker dans le contexte
    SecurityContextHolder.getContext().setAuthentication(authentication);

    // 3. Générer le JWT
    String jwt = jwtUtils.generateToken(authentication);

    // 4. Récupérer les infos utilisateur
    User user = (User) authentication.getPrincipal(); // ⚠️ Il faut que User implémente UserDetails

    // 5. Extraire les rôles
    List<String> roles = user.getRoles().stream()
                             .map(role -> role.getName().name())
                             .toList();

    // 6. Retourner réponse
    return new JwtResponse(
        jwt,
        user.getEmail(),
        roles,
        user.getNom(),
        user.getPrenom(),
        user.getTelephone()
    );
 }
}
