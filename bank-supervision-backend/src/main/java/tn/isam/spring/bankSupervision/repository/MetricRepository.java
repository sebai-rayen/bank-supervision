package tn.isam.spring.bankSupervision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.isam.spring.bankSupervision.entity.Metric;


public interface MetricRepository extends JpaRepository<Metric, Long> {

}


