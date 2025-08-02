package siga.pfa.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import siga.pfa.backend.entity.Role;
import siga.pfa.backend.entity.Role.RoleName;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.repository.RoleRepository;
import siga.pfa.backend.repository.UserRepository;
import siga.pfa.backend.security.JwtUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:64095") // Port Angular personnalisé
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    @Autowired
    public AuthController(UserRepository userRepository,
                         RoleRepository roleRepository,
                         PasswordEncoder passwordEncoder,JwtUtils jwtUtils ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

@PostMapping("/signup")
public ResponseEntity<Map<String, Object>> registerUser(
        @RequestBody Map<String, Object> request,
        HttpServletRequest httpRequest) {
    
    // Debug des headers
    System.out.println("=== HEADERS ===");
    Collections.list(httpRequest.getHeaderNames())
              .forEach(header -> System.out.println(header + ": " + httpRequest.getHeader(header)));
    
    // Debug du body
    System.out.println("=== BODY ===");
    System.out.println(request);
    
    // Debug des champs
    System.out.println("=== CHAMPS ===");
    System.out.println("Email: " + request.get("email"));
    System.out.println("Nom: " + request.get("nom"));
    System.out.println("Téléphone: " + request.get("telephone"));

    
    
    Map<String, Object> response = new HashMap<>();
    
    try {
        // 1. Validation des données
        if (!request.containsKey("email") || !request.containsKey("password")) {
            response.put("status", "error");
            response.put("message", "Email et mot de passe requis");
            return ResponseEntity.badRequest().body(response);
        }
        
        // 2. Logique d'inscription
        User user = new User();
        user.setEmail(request.get("email").toString());
        user.setPassword(request.get("password").toString());       
        user.setNom(request.get("nom").toString());
        user.setPrenom(request.get("prenom").toString());
        user.setTelephone(request.get("telephone").toString());
        
        // 3. Gestion des rôles
        String role = request.getOrDefault("role", "CLIENT").toString();
        Role userRole = roleRepository.findByName(RoleName.valueOf("ROLE_" + role))
            .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));
        user.setRoles(Collections.singleton(userRole));
        
        // 4. Sauvegarde
        userRepository.save(user);
        
        // 5. Réponse JSON structurée
        response.put("status", "success");
        response.put("message", "Inscription réussie");
        response.put("data", Map.of(
            "email", user.getEmail(),
            "role", role
        ));
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        System.err.println("ERREUR COMPLÈTE:");
        e.printStackTrace();
        
        response.put("status", "error");
        response.put("message", e.getMessage());
        return ResponseEntity.internalServerError().body(response);
    }
}
@PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
    String email = loginRequest.get("email");
    String password = loginRequest.get("password");
    Optional<User> userOpt = userRepository.findByEmail(email);

    if (userOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    User user = userOpt.get();
    if (!user.getPassword().equals(password)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // 🔍 Affiche les rôles dans la console pour tester
    System.out.println("Roles de l'utilisateur connecté : " + user.getRoles());

    Map<String, Object> response = new HashMap<>();
    response.put("token", "fake-jwt-token");
    response.put("prenom", user.getPrenom());
    response.put("nom", user.getNom());
    response.put("telephone", user.getTelephone());

    if (!user.getRoles().isEmpty()) {
        response.put("role", user.getRoles().iterator().next().getName().name());
    }

    return ResponseEntity.ok(response);
}

}
