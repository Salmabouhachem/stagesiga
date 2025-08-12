package siga.pfa.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Endpoint pour récupérer tous les agents
    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllAgents() {
        return userService.getAllAgents();
    }
}
