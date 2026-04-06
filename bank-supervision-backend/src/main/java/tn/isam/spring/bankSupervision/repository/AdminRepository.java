package tn.isam.spring.bankSupervision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.isam.spring.bankSupervision.entity.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

}


