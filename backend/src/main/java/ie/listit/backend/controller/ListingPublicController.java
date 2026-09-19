package ie.listit.backend.controller;

import ie.listit.backend.model.Listing;
import ie.listit.backend.repository.ListingRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/listings")
public class ListingPublicController {

    private final ListingRepository listingRepository;

    public ListingPublicController(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    
    @GetMapping("/home")
    @Cacheable(value = "homeListings", unless = "#result == null")
    public Map<String, Object> getHomeListings() {
        Map<String, Object> result = new HashMap<>();
        PageRequest limit4 = PageRequest.of(0, 4);

        List<Listing> latest = listingRepository.findByStatusOrderByCreatedAtDesc("active", limit4);
        List<Listing> auctions = listingRepository.findByStatusAndPriceTypeIgnoreCaseOrderByCreatedAtDesc("active", "auction", limit4);

        result.put("latest", latest);
        result.put("auctions", auctions);
        return result;
    }

    
    @GetMapping
    @Cacheable(value = "publicListings", key = "{#category, #priceType, #q, #limit}", unless = "#result == null")
    public List<Listing> getPublicListings(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priceType,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "20") int limit
    ) {
        int boundedLimit = Math.min(Math.max(limit, 1), 100);
        PageRequest pageRequest = PageRequest.of(0, boundedLimit);

        if (q != null && !q.trim().isEmpty()) {
            return listingRepository.findByStatusAndTitleContainingIgnoreCaseOrderByCreatedAtDesc("active", q.trim(), pageRequest);
        }

        if (category != null && !category.trim().isEmpty()) {
            return listingRepository.findByStatusAndCategoryIgnoreCaseOrderByCreatedAtDesc("active", category.trim(), pageRequest);
        }

        if (priceType != null && !priceType.trim().isEmpty()) {
            return listingRepository.findByStatusAndPriceTypeIgnoreCaseOrderByCreatedAtDesc("active", priceType.trim(), pageRequest);
        }

        return listingRepository.findByStatusOrderByCreatedAtDesc("active", pageRequest);
    }

    
    @GetMapping("/{id}")
    @Cacheable(value = "singleListing", key = "#id", unless = "#result == null")
    public ResponseEntity<Listing> getListingById(@PathVariable UUID id) {
        return listingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
