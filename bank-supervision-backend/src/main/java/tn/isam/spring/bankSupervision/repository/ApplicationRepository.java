package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.isam.spring.bankSupervision.entity.Application;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    java.util.List<Application> findTop5ByOrderByLastCheckDesc();
    java.util.List<Application> findAllByOrderByLastCheckDesc();
}


