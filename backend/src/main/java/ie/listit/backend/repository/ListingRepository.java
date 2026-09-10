package ie.listit.backend.repository;

import ie.listit.backend.model.Listing;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    List<Listing> findByStatusAndPriceTypeIgnoreCaseOrderByCreatedAtDesc(String status, String priceType, Pageable pageable);
    List<Listing> findByStatusAndCategoryIgnoreCaseOrderByCreatedAtDesc(String status, String category, Pageable pageable);
    List<Listing> findByStatusAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String status, String title, Pageable pageable);
}
