package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.isam.spring.bankSupervision.entity.Alert;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    @Query("""
            select a
            from Alert a
            join a.server s
            where lower(coalesce(s.status, '')) in :statuses
            order by a.date desc
            """)
    List<Alert> findIssueAlerts(@Param("statuses") List<String> statusesLower);

    @Query("""
            select a
            from Alert a
            join a.server s
            where lower(coalesce(s.status, '')) <> :healthy
              and coalesce(s.status, '') <> ''
            order by a.date desc
            """)
    List<Alert> findNonHealthyAlerts(@Param("healthy") String healthyLower);

    List<Alert> findAllByDestinataireEmailIgnoreCaseOrderByDateDesc(String email);

    @Query("""
            select a
            from Alert a
            where a.destinataire is not null
            order by a.date desc
            """)
    List<Alert> findSentAlertsOrderByDateDesc();
}
