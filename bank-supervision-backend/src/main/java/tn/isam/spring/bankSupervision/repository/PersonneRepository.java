package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.isam.spring.bankSupervision.entity.Personne;

import java.util.Optional;


import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PersonneRepository extends JpaRepository<Personne, Long> {
    Optional<Personne> findByEmail(String username);
    boolean existsByEmail(String email);

    @Query("SELECT p FROM Personne p WHERE TYPE(p) = User")
    List<Personne> findAllUsersOnly();

}



