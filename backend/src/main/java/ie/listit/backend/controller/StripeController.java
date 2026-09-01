package ie.listit.backend.controller;

import com.stripe.Stripe;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.model.checkout.Session;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import ie.listit.backend.model.Listing;
import ie.listit.backend.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class StripeController {

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Autowired
    private ListingRepository listingRepository;

    private void initStripe() {
        Stripe.apiKey = stripeApiKey;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> payload) {
        initStripe();
        UUID userId = UUID.fromString(jwt.getSubject());
        String listingIdStr = payload.get("listingId");

        if (listingIdStr == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Listing ID required"));
        }

        Optional<Listing> listingOpt = listingRepository.findById(UUID.fromString(listingIdStr));
        if (listingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Listing not found"));
        }
        Listing listing = listingOpt.get();

        if (listing.getSellerId().equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot buy your own listing"));
        }

        try {
            long priceInCents = listing.getPrice().multiply(new BigDecimal(100)).longValue();
            
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:3000/listing/" + listing.getId())
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("eur")
                                .setUnitAmount(priceInCents)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(listing.getTitle())
                                        .build())
                                .build())
                        .build())
                .build();

            Session session = Session.create(params);
            return ResponseEntity.ok(Map.of("sessionId", session.getId(), "url", session.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/connect")
    public ResponseEntity<?> createAccountLink(@AuthenticationPrincipal Jwt jwt) {
        initStripe();
        try {
            AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .build();
            Account account = Account.create(params);

            AccountLinkCreateParams linkParams = AccountLinkCreateParams.builder()
                .setAccount(account.getId())
                .setRefreshUrl("http://localhost:3000/stripe-setup")
                .setReturnUrl("http://localhost:3000/stripe-setup/success")
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

            AccountLink accountLink = AccountLink.create(linkParams);
            return ResponseEntity.ok(Map.of("url", accountLink.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
