# MyPortfolioSPA — Certificates Section Checklist

## 1. Product Scope

* [ ] Add a dedicated `/certificates` page.
* [ ] Add a `certificates` link to the primary navigation.
* [ ] Add a featured certificates section to the home page.
* [ ] Show no more than three featured certificates on the home page.
* [ ] Add a `View all certificates` link below the featured section.
* [ ] Use a desktop grid and a horizontal mobile carousel.
* [ ] Do not use autoplay.
* [ ] Do not add a third-party carousel dependency.

## 2. Certificate Content

* [ ] Collect the original certificate images or PDFs.
* [ ] Collect the public verification URL for each certificate, when available.
* [ ] Record the certificate title.
* [ ] Record the issuing organization.
* [ ] Record the issue date.
* [ ] Record the credential ID, when available.
* [ ] Add a short description only when it provides useful context.
* [ ] Assign each certificate to one category.
* [ ] Add a small set of relevant skill tags.
* [ ] Mark the strongest certificates as featured.
* [ ] Sort certificates by professional relevance, then by issue date.
* [ ] Place backend, database, Docker, cloud, networking, and security certificates first.
* [ ] Keep introductory digital-literacy certificates lower in the list.

## 3. Django Model

* [ ] Add a `Certificate` model to `backend/api/models.py`.
* [ ] Add a `title` field.
* [ ] Add an `issuer` field.
* [ ] Add an optional `description` field.
* [ ] Add an `issued_at` field.
* [ ] Add an optional `credential_id` field.
* [ ] Add an optional `credential_url` field.
* [ ] Add an `image_url` field.
* [ ] Add a `category` field with explicit choices.
* [ ] Add a `skills` field or a documented tag format.
* [ ] Add an `is_featured` boolean field.
* [ ] Add an `is_published` boolean field.
* [ ] Add an indexed `sort_order` field.
* [ ] Add default ordering by `sort_order` and primary key.
* [ ] Add a readable `__str__` method.
* [ ] Generate the Django migration.
* [ ] Review the generated migration before applying it.
* [ ] Apply the migration locally.

## 4. Django Admin

* [ ] Register `Certificate` in `backend/api/admin.py`.
* [ ] Use `SortableAdminMixin` for manual ordering.
* [ ] Show title, issuer, issue date, category, featured status, and published status in `list_display`.
* [ ] Add filters for category, issuer, featured status, published status, and issue date.
* [ ] Add search by title, issuer, credential ID, and skills.
* [ ] Add an image preview to the change form.
* [ ] Add a clickable verification link to the change form.
* [ ] Validate that `image_url` is either an allowed relative path or an HTTP(S) URL.
* [ ] Prevent broken admin previews when the image URL is empty.
* [ ] Confirm that certificate ordering can be changed by drag and drop.

## 5. REST API

* [ ] Add `CertificateSerializer` to `backend/api/serializers.py`.
* [ ] Expose only fields required by the frontend.
* [ ] Add `CertificateViewSet` as a read-only viewset.
* [ ] Return only published certificates.
* [ ] Order the queryset by `sort_order` and primary key.
* [ ] Support `?featured=true` filtering.
* [ ] Register `/api/certificates/` in `backend/api/urls.py`.
* [ ] Return an empty list when no certificates are published.
* [ ] Keep the response shape consistent with the existing projects API.
* [ ] Verify that unpublished certificates are never returned.

## 6. Frontend Types and Data Fetching

* [ ] Add a `Certificate` TypeScript type.
* [ ] Define a narrow API response type.
* [ ] Validate or normalize the API response before rendering it.
* [ ] Add a reusable `getCertificates()` API function.
* [ ] Support fetching all certificates.
* [ ] Support fetching featured certificates.
* [ ] Add loading, empty, and error states.
* [ ] Avoid duplicating certificate normalization logic between pages.
* [ ] Abort or ignore stale requests when the component unmounts.

## 7. Certificate Card

* [ ] Create `CertificateCard.tsx`.
* [ ] Display the certificate preview image.
* [ ] Display the certificate title.
* [ ] Display the issuer.
* [ ] Display the issue month and year.
* [ ] Display the category or a small set of skill tags.
* [ ] Add a `View certificate` action.
* [ ] Add a `Verify credential` action only when a verification URL exists.
* [ ] Open external links in a new tab.
* [ ] Add `rel="noopener noreferrer"` to external links.
* [ ] Keep card heights visually consistent.
* [ ] Do not place long descriptions directly inside compact cards.
* [ ] Provide meaningful image alternative text.

## 8. Certificate Preview Modal

* [ ] Create `CertificateModal.tsx`.
* [ ] Open the modal when the certificate preview is activated.
* [ ] Add a visible close button.
* [ ] Close the modal with the `Escape` key.
* [ ] Close the modal when the backdrop is clicked.
* [ ] Do not close it when the modal content itself is clicked.
* [ ] Move keyboard focus into the modal when it opens.
* [ ] Return focus to the triggering element when it closes.
* [ ] Prevent background scrolling while the modal is open.
* [ ] Add `role="dialog"` and `aria-modal="true"`.
* [ ] Connect the dialog to an accessible title.
* [ ] Keep the full certificate readable without overflowing the viewport.
* [ ] Provide a direct link to the original image or PDF.

## 9. Certificates Page

* [ ] Create `frontend/src/pages/Certificates.tsx`.
* [ ] Create `frontend/src/pages/Certificates.css`.
* [ ] Set the document title to `M.Petrykin — Certificates`.
* [ ] Use the same container width and spacing as the Projects page.
* [ ] Add an eyebrow label such as `Credentials`.
* [ ] Add an `h1` heading: `Certifications`.
* [ ] Add a short professional description.
* [ ] Render certificates as a desktop grid.
* [ ] Use three columns on large screens.
* [ ] Use two columns on tablet-sized screens.
* [ ] Use one column or horizontal scroll on small screens.
* [ ] Add category filters only if the list becomes large enough to need them.
* [ ] Show a useful empty state when no certificate matches a filter.
* [ ] Add the `/certificates` route to `frontend/src/App.tsx`.
* [ ] Add the navigation item to `frontend/src/components/Navbar.tsx`.

## 10. Home Page Section

* [ ] Create a reusable `FeaturedCertificates` component.
* [ ] Fetch only featured certificates.
* [ ] Render a maximum of three cards.
* [ ] Place the section below the hero content and above the final divider.
* [ ] Keep the section visually secondary to the main hero CTA.
* [ ] Add a `View all certificates` link.
* [ ] Hide the entire section if the API returns no featured certificates.
* [ ] Ensure the section does not significantly increase initial page load time.

## 11. Responsive Carousel Behaviour

* [ ] Use a normal CSS grid on desktop and tablet where practical.
* [ ] Enable horizontal overflow only on small screens.
* [ ] Use `scroll-snap-type: x proximity` or `x mandatory` on mobile.
* [ ] Use `scroll-snap-align: start` on each card.
* [ ] Make one card occupy approximately 85–90% of the mobile viewport width.
* [ ] Leave part of the next card visible as a swipe affordance.
* [ ] Preserve native touch scrolling.
* [ ] Add previous and next controls only if they improve usability.
* [ ] Disable the previous control at the start.
* [ ] Disable the next control at the end.
* [ ] Make controls keyboard accessible.
* [ ] Do not implement autoplay or infinite looping.
* [ ] Respect `prefers-reduced-motion`.

## 12. Images and Performance

* [ ] Convert certificate previews to WebP or AVIF.
* [ ] Keep the original PDF or high-resolution image separately.
* [ ] Generate thumbnails with a reasonable display resolution.
* [ ] Add explicit `width` and `height` attributes.
* [ ] Use `loading="lazy"` for below-the-fold images.
* [ ] Use `decoding="async"` for preview images.
* [ ] Avoid loading full-size PDFs before user interaction.
* [ ] Avoid downloading every full-resolution certificate on the home page.
* [ ] Add a stable aspect ratio to prevent layout shifts.
* [ ] Provide a fallback state for failed images.
* [ ] Verify that image URLs work in local, preview, and production environments.

## 13. Accessibility

* [ ] Use semantic headings in a logical order.
* [ ] Render the certificate collection as a list where appropriate.
* [ ] Ensure every interactive element is reachable by keyboard.
* [ ] Provide visible focus styles.
* [ ] Give icon-only controls accessible names.
* [ ] Ensure text and controls meet contrast requirements.
* [ ] Do not rely on colour alone to communicate status or category.
* [ ] Use meaningful alternative text for certificate images.
* [ ] Avoid duplicate links with unclear accessible names.
* [ ] Verify the modal with keyboard-only navigation.
* [ ] Verify the mobile carousel with keyboard and touch input.
* [ ] Test at 200% browser zoom.

## 14. Analytics — Optional Second Phase

* [ ] Add `certificate_view` to the supported analytics event types.
* [ ] Add `certificate_link_click` to the supported analytics event types.
* [ ] Allow certificate metadata keys in the analytics serializer.
* [ ] Record `certificate_id`.
* [ ] Record `certificate_title`.
* [ ] Record `issuer`.
* [ ] Record the target type: preview, original, or verification URL.
* [ ] Update the Django admin analytics summary for certificate events.
* [ ] Send analytics only after consent.
* [ ] Do not delay the initial release for optional analytics work.

## 15. Backend Tests

* [ ] Test the certificate model string representation.
* [ ] Test default ordering.
* [ ] Test automatic or manual `sort_order` behaviour.
* [ ] Test that the list endpoint is read-only.
* [ ] Test that only published certificates are returned.
* [ ] Test `featured=true` filtering.
* [ ] Test that ordering is preserved by the API.
* [ ] Test certificates with and without verification URLs.
* [ ] Test the empty list response.
* [ ] Test image URL normalization or validation.

## 16. Frontend Tests

* [ ] Test the certificates loading state.
* [ ] Test the API error state.
* [ ] Test the empty state.
* [ ] Test rendering certificate data.
* [ ] Test that unpublished data cannot appear through normal API usage.
* [ ] Test the featured certificates limit.
* [ ] Test opening and closing the modal.
* [ ] Test closing the modal with `Escape`.
* [ ] Test focus restoration after closing the modal.
* [ ] Test verification links and their security attributes.
* [ ] Test navigation to `/certificates`.
* [ ] Test the active navigation state.

## 17. Manual QA

* [ ] Check the home page on desktop.
* [ ] Check the home page on a narrow mobile viewport.
* [ ] Check the certificates page on desktop, tablet, and mobile.
* [ ] Verify swipe behaviour on a real touch device.
* [ ] Verify keyboard navigation.
* [ ] Verify the lightbox at different viewport sizes.
* [ ] Verify long certificate titles.
* [ ] Verify missing descriptions and credential IDs.
* [ ] Verify cards with and without verification URLs.
* [ ] Verify broken-image fallback behaviour.
* [ ] Verify dark-theme contrast.
* [ ] Verify navigation menu layout after adding the new link.
* [ ] Verify direct loading of `/certificates` through Nginx SPA fallback.
* [ ] Verify browser back and forward navigation.
* [ ] Run the frontend test suite.
* [ ] Run the frontend production build.
* [ ] Run the backend test suite.
* [ ] Run Django system checks.

## 18. Deployment

* [ ] Add certificate records in the production Django Admin.
* [ ] Upload optimized preview images to the chosen image host.
* [ ] Confirm that every production image URL is public and uses HTTPS.
* [ ] Confirm that every public credential URL works.
* [ ] Apply the database migration before exposing the frontend route.
* [ ] Deploy the backend API changes.
* [ ] Verify `/api/certificates/` in production.
* [ ] Deploy the frontend changes.
* [ ] Verify `/certificates` in production.
* [ ] Verify the featured section on the production home page.
* [ ] Check browser console and network errors.
* [ ] Confirm that analytics and cookie consent behaviour remain unchanged.

## Recommended Delivery Order

* [ ] **Phase 1:** Model, migration, admin, serializer, and read-only endpoint.
* [ ] **Phase 2:** Certificates page, card, route, navigation, and responsive grid.
* [ ] **Phase 3:** Preview modal and mobile scroll-snap behaviour.
* [ ] **Phase 4:** Featured certificates section on the home page.
* [ ] **Phase 5:** Tests, accessibility review, performance checks, and production QA.
* [ ] **Phase 6:** Optional certificate analytics.

## Definition of Done

* [ ] Certificates can be created, edited, published, featured, and reordered in Django Admin.
* [ ] Only published certificates are exposed by the API.
* [ ] The full certificate list is available at `/certificates`.
* [ ] Featured certificates appear on the home page.
* [ ] Desktop users receive a scan-friendly grid.
* [ ] Mobile users receive a usable swipeable list without autoplay.
* [ ] Certificate previews and verification links are accessible.
* [ ] Images are optimized and do not cause significant layout shifts.
* [ ] Backend and frontend tests pass.
* [ ] The production build and Django system checks pass.
* [ ] The feature is verified in production on desktop and mobile.
