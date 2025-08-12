package siga.pfa.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import siga.pfa.backend.entity.CustomUserDetails;
import siga.pfa.backend.entity.User;
import siga.pfa.backend.entity.Role;
import siga.pfa.backend.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Méthode obligatoire pour Spring Security
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec email: " + username));

        // Convertis ton User en UserDetails (voir la classe CustomUserDetails ci-dessous)
        return new CustomUserDetails(user);
    }

    // Méthode existante, récupération des agents
    public List<User> getAllAgents() {
        return userRepository.findAllByRoleName(Role.RoleName.ROLE_AGENT);
    }
     public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

