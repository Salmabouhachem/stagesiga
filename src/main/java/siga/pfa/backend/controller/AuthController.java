package siga.pfa.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import siga.pfa.backend.dto.UserResponseDTO;
import siga.pfa.backend.entity.Role;
import siga.pfa.backend.entity.Role.RoleName;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.repository.RoleRepository;
import siga.pfa.backend.repository.UserRepository;
import siga.pfa.backend.security.JwtUtils;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils,
                          AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/signup")
    public ResponseEntity<ResponseDTO> registerUser(@Valid @RequestBody SignupRequest request) {
        try {
            // Check if email already exists
            if (userRepository.findByEmail(request.email()).isPresent()) {
                return ResponseEntity.badRequest().body(new ResponseDTO("error", "Email already exists", null));
            }

            // Create user
            User user = User.builder()
                    .email(request.email())
                    .password(passwordEncoder.encode(request.password()))
                    .nom(request.nom())
                    .prenom(request.prenom())
                    .telephone(request.telephone())
                    .build();

            // Assign role
            RoleName roleName = RoleName.valueOf(request.role() != null ? request.role() : "ROLE_CLIENT");
            Role userRole = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
            user.setRoles(Collections.singleton(userRole));

            // Save user
            userRepository.save(user);

            // Build response
            Map<String, Object> data = new HashMap<>();
            data.put("email", user.getEmail());
            data.put("role", userRole.getName().name());
            logger.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok(new ResponseDTO("success", "Registration successful", data));
        } catch (IllegalArgumentException e) {
            logger.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ResponseDTO("error", e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO("error", "Registration failed", null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtils.generateToken(userDetails);

            // Fetch user to include additional details
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalStateException("User not found after authentication"));
            UserResponseDTO userResponse = new UserResponseDTO(user);

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("user",userResponse);
            if (!user.getRoles().isEmpty()) {
                data.put("role", user.getRoles().iterator().next().getName().name());
            }

            logger.info("User logged in successfully: {}", user.getEmail());
            return ResponseEntity.ok(new ResponseDTO("success", "Login successful", data));
        } catch (AuthenticationException e) {
            logger.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponseDTO("error", "Invalid credentials", null));
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO("error", "Login failed", null));
        }
    }

    // DTOs
    public record SignupRequest(
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email String email,
            @jakarta.validation.constraints.NotBlank String password,
            String nom,
            String prenom,
            String telephone,
            String role) {
    }

    public record LoginRequest(
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Email String email,
            @jakarta.validation.constraints.NotBlank String password) {
    }

    public record ResponseDTO(String status, String message, Map<String, Object> data) {
    }
    @PostMapping("/logout")
public ResponseEntity<?> logout(HttpServletRequest request) {
    String authHeader = request.getHeader("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        // Ajouter le token dans une blacklist (Redis, DB, in-memory, etc.)
    }
    return ResponseEntity.ok().build();
}

}