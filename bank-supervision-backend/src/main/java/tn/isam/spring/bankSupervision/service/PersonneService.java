package tn.isam.spring.bankSupervision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.isam.spring.bankSupervision.dto.request.RegistrationRequest;
import tn.isam.spring.bankSupervision.entity.Admin;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonneService {

    private final PersonneRepository personneRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(final String email) throws UsernameNotFoundException {
        return personneRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));
    }

    @Transactional(readOnly = true)
    public List<Personne> findAllUsers() {
        return personneRepository.findAll();
    }

    @Transactional
    public Personne createUser(RegistrationRequest request) {
        if (personneRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce compte existe déjà");
        }

        final Personne personne = isAdminRequest(request) ? new Admin() : new User();

        personne.setNom(request.getName());
        personne.setEmail(request.getEmail());
        personne.setPassword(passwordEncoder.encode(request.getPassword()));

        boolean active = request.getActive() == null || request.getActive();
        personne.setActive(active);

        return personneRepository.save(personne);
    }

    @Transactional
    public Personne updatePersonne(Long userId, String nom, String email, Boolean active) {
        Personne personne = personneRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        if (nom != null && !nom.isBlank()) {
            personne.setNom(nom);
        }
        if (email != null && !email.isBlank()) {
            if (!email.equals(personne.getEmail()) && personneRepository.findByEmail(email).isPresent()) {
                throw new IllegalArgumentException("Cet e-mail est déjà utilisé");
            }
            personne.setEmail(email);
        }
        if (active != null) {
            personne.setActive(active);
        }

        return personneRepository.save(personne);
    }

    @Transactional
    public void setActive(Long userId, boolean active) {
        Personne personne = personneRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        personne.setActive(active);
        personneRepository.save(personne);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        personneRepository.deleteById(userId);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Le nouveau mot de passe et la confirmation ne correspondent pas");
        }

        Personne personne = personneRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(currentPassword, personne.getPassword())) {
            throw new IllegalArgumentException("Mot de passe actuel invalide");
        }

        personne.setPassword(passwordEncoder.encode(newPassword));
        personneRepository.save(personne);
    }

    private boolean isAdminRequest(RegistrationRequest request) {
        return request.getRoleType() != null && "ADMIN".equalsIgnoreCase(request.getRoleType());
    }
}