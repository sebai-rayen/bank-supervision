package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import tn.isam.spring.bankSupervision.entity.Server;

import java.util.Optional;
import java.util.List;

public interface ServerRepository extends JpaRepository<Server, Long> {
    List<Server> findTop5ByOrderByLastCheckDesc();
    List<Server> findAllByOrderByLastCheckDesc();
    boolean existsByName(String name);
    boolean existsByIpAddress(String ipAddress);
    Optional<Server> findByNameIgnoreCase(String name);
}


