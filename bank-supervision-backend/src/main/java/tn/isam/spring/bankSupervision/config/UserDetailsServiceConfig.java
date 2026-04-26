package tn.isam.spring.bankSupervision.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import tn.isam.spring.bankSupervision.repository.PersonneRepository;

@Configuration
@RequiredArgsConstructor
public class UserDetailsServiceConfig {

    private final PersonneRepository personneRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> personneRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + username));
    }
}