package siga.pfa.backend.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import siga.pfa.backend.dto.UserResponseDTO;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.service.UserService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint pour récupérer tous les utilisateurs (restreint aux admins)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
            List<UserResponseDTO> users = userService.getAllUsers().stream()
                    .map(UserResponseDTO::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(users);
        }

    // Endpoint pour récupérer tous les agents
    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllAgents() {
        return userService.getAllAgents();
    }
}