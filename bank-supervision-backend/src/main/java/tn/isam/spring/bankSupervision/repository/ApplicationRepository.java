package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.isam.spring.bankSupervision.entity.Application;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findTop5ByOrderByLastCheckDesc();
    List<Application> findAllByOrderByLastCheckDesc();
    List<Application> findAllByUser_EmailOrderByLastCheckDesc(String email);
}


