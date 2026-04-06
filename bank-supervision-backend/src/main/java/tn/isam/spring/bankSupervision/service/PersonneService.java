package tn.isam.spring.bankSupervision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.isam.spring.bankSupervision.entity.Personne;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;

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

    @Transactional
    public void deactivateAccount(Long userId) {
        Personne personne = personneRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        // Ici on pourrait ajouter un champ enabled si vous voulez
        // personne.setEnabled(false);

        // pour l'instant juste un print
        System.out.println("Compte désactivé pour : " + personne.getEmail());
    }

    @Transactional
    public void reactivateAccount(Long userId) {
        Personne personne = personneRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));

        // personne.setEnabled(true);

        System.out.println("Compte réactivé pour : " + personne.getEmail());
    }

    @Transactional
    public void deleteAccount(Long userId) {
        // Ici, on peut soit supprimer l'utilisateur,
        // soit juste le marquer pour suppression selon votre logique
        personneRepository.deleteById(userId);
    }
}