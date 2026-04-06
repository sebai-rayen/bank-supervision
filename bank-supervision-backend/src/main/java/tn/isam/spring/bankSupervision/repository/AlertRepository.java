package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import tn.isam.spring.bankSupervision.entity.Alert;

public interface AlertRepository extends JpaRepository<Alert, Long> {

}
