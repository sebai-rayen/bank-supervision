package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import tn.isam.spring.bankSupervision.entity.Server;


public interface ServerRepository extends JpaRepository<Server, Long> {

}


