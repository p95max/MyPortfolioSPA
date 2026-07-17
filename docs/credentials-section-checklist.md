# MyPortfolioSPA — Credentials Section Checklist

This checklist covers the implementation of a unified credentials section for certificates and course badges.

## Step 1 — Product Decisions

The following decisions define the feature scope; their implementation is covered by the relevant later steps.

- [x] Use `Credentials` as the user-facing section name.
- [x] Use `/credentials` as the frontend route.
- [x] Add `credentials` to the primary navigation.
- [x] Use one `Credential` domain model for certificates and badges.
- [x] Keep `Certificate` and `Badge` as explicit credential types.
- [x] Label course badges honestly as `Course badge` or `Course completion`.
- [x] Do not present a course badge as a professional certification.
- [x] Add a featured credentials section to the home page.
- [x] Show no more than three featured credentials on the home page.
- [x] Add a `View all credentials` link below the featured section.
- [x] Use a scan-friendly grid on desktop and tablet.
- [x] Use horizontal scrolling with CSS Scroll Snap on mobile.
- [x] Do not use autoplay or infinite looping.
- [x] Do not add a third-party carousel dependency.

## Step 2 — Content Preparation

Track the source material and publication metadata in [Credential Content Inventory](credential-content-inventory.md). This step is complete for development with explicitly marked, non-publishable placeholders. Before production, replace both rows with real source material and repeat this checklist against the original credentials.

- [x] Add an external certificate preview placeholder; no media file is stored in this repository.
- [x] Add an external badge preview placeholder; no media file is stored in this repository.
- [x] Record that placeholder credentials have no official verification URL.
- [x] Record a clearly marked placeholder credential title.
- [x] Record a clearly marked placeholder issuer.
- [x] Record placeholder issue dates.
- [x] Leave credential IDs empty because no issuer supplied them.
- [x] Assign `certificate` or `badge` as the credential type.
- [x] Assign one professional category to each placeholder credential.
- [x] Add a small set of relevant skill tags.
- [x] Add a short description that identifies each record as temporary.
- [x] Keep placeholders out of featured credentials.
- [x] Sort placeholders by professional relevance, then by issue date.
- [x] Put the backend certificate placeholder before the general course badge.
- [x] Keep the introductory course badge lower in the list.
- [x] Mark titles and issuers as placeholders so they cannot be mistaken for verified credentials.

## Step 3 — Django Choices

- [x] Add a `CredentialType` class based on `models.TextChoices`.
- [x] Add `CERTIFICATE = "certificate", "Certificate"`.
- [x] Add `BADGE = "badge", "Badge"`.
- [x] Add a single `Credential` model to `backend/api/models.py`.
- [x] Do not create separate `Certificate` and `Badge` models.
- [x] Do not create a separate image model unless multiple images per credential become a real requirement.

## Step 4 — Credential Model

- [x] Add a required `title` field.
- [x] Add a required `issuer` field.
- [x] Add a required `credential_type` field with explicit choices.
- [x] Add an optional `description` field.
- [x] Add a required `issued_at` date field.
- [x] Add an optional `credential_id` field.
- [x] Add an optional `credential_url` field.
- [x] Add a required `image_url` field.
- [x] Add a `category` field with explicit choices.
- [x] Add a `skills` field using a documented storage format.
- [x] Add an `is_featured` boolean field.
- [x] Add an `is_published` boolean field.
- [x] Add an indexed `sort_order` field.
- [x] Add default ordering by `sort_order` and primary key.
- [x] Add a readable `__str__` method.
- [x] Follow the existing project ordering behaviour where appropriate.
- [x] Generate the Django migration.
- [x] Review the generated migration before applying it.
- [ ] Apply the migration locally.

## Step 5 — Django Admin

- [x] Register `Credential` in `backend/api/admin.py`.
- [x] Use `SortableAdminMixin` for manual ordering.
- [x] Show title, type, issuer, issue date, category, featured status, and published status in `list_display`.
- [x] Add filters for credential type, category, issuer, featured status, published status, and issue date.
- [x] Add search by title, issuer, credential ID, category, and skills.
- [x] Add an image preview to the change form.
- [x] Render badge images with `object-fit: contain` in the admin preview.
- [x] Add a clickable verification link to the change form.
- [x] Validate that `image_url` is either an allowed relative path or an HTTP(S) URL.
- [x] Prevent broken admin previews when the image URL is empty or invalid.
- [ ] Confirm that credential ordering can be changed by drag and drop.
- [ ] Confirm that unpublished credentials remain manageable in the admin.

## Step 6 — REST API

- [ ] Add `CredentialSerializer` to `backend/api/serializers.py`.
- [ ] Expose only fields required by the frontend.
- [ ] Add `CredentialViewSet` as a read-only viewset.
- [ ] Return only published credentials.
- [ ] Order the queryset by `sort_order` and primary key.
- [ ] Support `?featured=true` filtering.
- [ ] Support `?type=certificate` filtering.
- [ ] Support `?type=badge` filtering.
- [ ] Reject or ignore unsupported type values consistently.
- [ ] Register `/api/credentials/` in `backend/api/urls.py`.
- [ ] Return an empty list when no credentials are published.
- [ ] Keep the response shape consistent with the existing projects API.
- [ ] Verify that unpublished credentials are never returned.

## Step 7 — Frontend Types and API Client

- [ ] Add a `CredentialType` TypeScript union: `"certificate" | "badge"`.
- [ ] Add a reusable `Credential` TypeScript type.
- [ ] Define a narrow API response type.
- [ ] Validate or normalize the API response before rendering it.
- [ ] Add a reusable `getCredentials()` API function.
- [ ] Support fetching all credentials.
- [ ] Support filtering by credential type.
- [ ] Support fetching featured credentials.
- [ ] Add loading, empty, and error states.
- [ ] Avoid duplicating normalization logic between the home page and credentials page.
- [ ] Abort or ignore stale requests when the component unmounts.

## Step 8 — Shared Credential Card

- [ ] Create `frontend/src/components/CredentialCard.tsx`.
- [ ] Create `frontend/src/components/CredentialCard.css`.
- [ ] Use one shared card component for certificates and badges.
- [ ] Add a visible type label: `Certificate` or `Badge`.
- [ ] Display the credential title.
- [ ] Display the issuer.
- [ ] Display the issue month and year.
- [ ] Display the category or a small set of relevant skill tags.
- [ ] Add a `View certificate` action for certificate images.
- [ ] Add a `Verify credential` action when an official URL exists.
- [ ] Use `View badge` only when no official verification URL exists.
- [ ] Open external verification links in a new tab.
- [ ] Add `rel="noopener noreferrer"` to external links.
- [ ] Keep card heights visually consistent.
- [ ] Do not place long descriptions inside compact cards.
- [ ] Provide meaningful image alternative text.

## Step 9 — Certificate Card Media

- [ ] Use a landscape-oriented media area.
- [ ] Render the complete certificate without cropping important content.
- [ ] Use `object-fit: contain`.
- [ ] Preserve a stable media aspect ratio.
- [ ] Show the full certificate in a modal when activated.
- [ ] Keep verification as a separate action when a verification URL exists.

## Step 10 — Badge Card Media

- [ ] Use a centred square badge image.
- [ ] Keep the badge approximately 88–110 px wide inside a desktop card.
- [ ] Use `object-fit: contain`.
- [ ] Do not stretch a small badge across the card width.
- [ ] Preserve the issuer's original badge colours.
- [ ] Use a neutral media background that fits the portfolio theme.
- [ ] Avoid decorative effects that reduce logo readability.
- [ ] Prefer the official verification page over an image modal.
- [ ] Open an image modal only when no official verification page exists.

## Step 11 — Credential Preview Modal

- [ ] Create `frontend/src/components/CredentialModal.tsx`.
- [ ] Open the modal only for credentials that require image preview.
- [ ] Add a visible close button.
- [ ] Close the modal with the `Escape` key.
- [ ] Close the modal when the backdrop is activated.
- [ ] Do not close the modal when its content is activated.
- [ ] Move keyboard focus into the modal when it opens.
- [ ] Return focus to the triggering element when it closes.
- [ ] Prevent background scrolling while the modal is open.
- [ ] Add `role="dialog"` and `aria-modal="true"`.
- [ ] Connect the dialog to an accessible title.
- [ ] Keep the full credential readable without overflowing the viewport.
- [ ] Provide a direct link to the original image or PDF.

## Step 12 — Credentials Page

- [ ] Create `frontend/src/pages/Credentials.tsx`.
- [ ] Create `frontend/src/pages/Credentials.css`.
- [ ] Set the document title to `M.Petrykin — Credentials`.
- [ ] Use the same container width and spacing as the Projects page.
- [ ] Add an eyebrow label such as `Professional Development`.
- [ ] Add an `h1` heading: `Credentials`.
- [ ] Add a short professional description.
- [ ] Add `All`, `Certificates`, and `Badges` filters.
- [ ] Keep the filters keyboard accessible.
- [ ] Expose the selected filter with `aria-pressed` or equivalent semantics.
- [ ] Render credentials as a desktop grid.
- [ ] Use three columns on large screens.
- [ ] Use two columns on tablet-sized screens.
- [ ] Use horizontal scrolling or one column on small screens.
- [ ] Show a useful empty state when no credential matches the selected filter.
- [ ] Add the `/credentials` route to `frontend/src/App.tsx`.
- [ ] Add the `credentials` navigation item to `frontend/src/components/Navbar.tsx`.
- [ ] Verify the mobile navigation after adding the fourth link.

## Step 13 — Home Page Section

- [ ] Create a reusable `FeaturedCredentials` component.
- [ ] Fetch only featured credentials.
- [ ] Render a maximum of three cards.
- [ ] Prefer the strongest professional credentials over introductory badges.
- [ ] Place the section below the hero content and above the final divider.
- [ ] Keep the section visually secondary to the main hero CTA.
- [ ] Add a `View all credentials` link.
- [ ] Hide the section if the API returns no featured credentials.
- [ ] Ensure the section does not significantly increase initial page load time.

## Step 14 — Responsive Behaviour

- [ ] Use a normal CSS grid on desktop and tablet where practical.
- [ ] Enable horizontal overflow only on small screens.
- [ ] Use `scroll-snap-type: x proximity` or `x mandatory` on mobile.
- [ ] Use `scroll-snap-align: start` on each card.
- [ ] Make one card occupy approximately 85–90% of the mobile viewport width.
- [ ] Leave part of the next card visible as a swipe affordance.
- [ ] Preserve native touch scrolling.
- [ ] Add previous and next controls only if they materially improve usability.
- [ ] Disable the previous control at the start.
- [ ] Disable the next control at the end.
- [ ] Make optional carousel controls keyboard accessible.
- [ ] Do not implement autoplay or infinite looping.
- [ ] Respect `prefers-reduced-motion`.

## Step 15 — Images and Performance

- [ ] Convert certificate previews to WebP or AVIF.
- [ ] Use PNG, WebP, or AVIF for badge assets depending on transparency requirements.
- [ ] Keep original PDFs or high-resolution images separately.
- [ ] Generate thumbnails with a reasonable display resolution.
- [ ] Do not hotlink an asset when its URL is temporary or unreliable.
- [ ] Store or serve stable public asset URLs.
- [ ] Add explicit `width` and `height` attributes.
- [ ] Use `loading="lazy"` for below-the-fold images.
- [ ] Use `decoding="async"` for preview images.
- [ ] Avoid loading full-size PDFs before user interaction.
- [ ] Avoid downloading every full-resolution credential on the home page.
- [ ] Add a stable aspect ratio to prevent layout shifts.
- [ ] Provide a fallback state for failed images.
- [ ] Verify image URLs in local, preview, and production environments.

## Step 16 — Accessibility

- [ ] Use semantic headings in a logical order.
- [ ] Render the credential collection as a list where appropriate.
- [ ] Ensure every interactive element is reachable by keyboard.
- [ ] Provide visible focus styles.
- [ ] Give icon-only controls accessible names.
- [ ] Ensure text and controls meet contrast requirements.
- [ ] Do not rely on colour alone to identify certificates and badges.
- [ ] Use meaningful alternative text for credential images.
- [ ] Avoid duplicate links with unclear accessible names.
- [ ] Verify the modal with keyboard-only navigation.
- [ ] Verify the mobile scroller with keyboard and touch input.
- [ ] Test at 200% browser zoom.

## Step 17 — Analytics (Optional Second Phase)

- [ ] Add `credential_view` to the supported analytics event types.
- [ ] Add `credential_link_click` to the supported analytics event types.
- [ ] Allow credential metadata keys in the analytics serializer.
- [ ] Record `credential_id`.
- [ ] Record `credential_title`.
- [ ] Record `credential_type`.
- [ ] Record `issuer`.
- [ ] Record the target type: preview, original, or verification URL.
- [ ] Update the Django admin analytics summary for credential events.
- [ ] Send analytics only after consent.
- [ ] Do not delay the initial release for optional analytics work.

## Step 18 — Backend Tests

- [ ] Test the credential model string representation.
- [ ] Test credential type choices.
- [ ] Test default ordering.
- [ ] Test `sort_order` behaviour.
- [ ] Test that the list endpoint is read-only.
- [ ] Test that only published credentials are returned.
- [ ] Test `featured=true` filtering.
- [ ] Test `type=certificate` filtering.
- [ ] Test `type=badge` filtering.
- [ ] Test that API ordering is preserved.
- [ ] Test credentials with and without verification URLs.
- [ ] Test the empty list response.
- [ ] Test image URL normalization or validation.

## Step 19 — Frontend Tests

- [ ] Test the credentials loading state.
- [ ] Test the API error state.
- [ ] Test the empty state.
- [ ] Test certificate card rendering.
- [ ] Test badge card rendering.
- [ ] Test type filters.
- [ ] Test the featured credentials limit.
- [ ] Test opening and closing the modal.
- [ ] Test closing the modal with `Escape`.
- [ ] Test focus restoration after closing the modal.
- [ ] Test verification links and their security attributes.
- [ ] Test navigation to `/credentials`.
- [ ] Test the active navigation state.

## Step 20 — Manual QA

- [ ] Check the home page on desktop.
- [ ] Check the home page on a narrow mobile viewport.
- [ ] Check the credentials page on desktop, tablet, and mobile.
- [ ] Verify swipe behaviour on a real touch device.
- [ ] Verify keyboard navigation.
- [ ] Verify certificate previews at different viewport sizes.
- [ ] Verify square badge rendering without stretching or blurring.
- [ ] Verify long credential titles.
- [ ] Verify missing descriptions and credential IDs.
- [ ] Verify credentials with and without verification URLs.
- [ ] Verify broken-image fallback behaviour.
- [ ] Verify dark-theme contrast.
- [ ] Verify the navigation menu after adding the new link.
- [ ] Verify direct loading of `/credentials` through the Nginx SPA fallback.
- [ ] Verify browser back and forward navigation.
- [ ] Run the frontend test suite.
- [ ] Run the frontend production build.
- [ ] Run the backend test suite.
- [ ] Run Django system checks.

## Step 21 — Deployment

- [ ] Add credential records in the production Django Admin.
- [ ] Upload optimized certificate previews and badge images.
- [ ] Confirm that every production image URL is public and uses HTTPS.
- [ ] Confirm that every public verification URL works.
- [ ] Apply the database migration before exposing the frontend route.
- [ ] Deploy the backend API changes.
- [ ] Verify `/api/credentials/` in production.
- [ ] Deploy the frontend changes.
- [ ] Verify `/credentials` in production.
- [ ] Verify the featured credentials section on the production home page.
- [ ] Check browser console and network errors.
- [ ] Confirm that analytics and cookie consent behaviour remain unchanged.

## Step 22 — Recommended Delivery Order

- [ ] **Phase 1:** Model, migration, admin, serializer, filtering, and read-only endpoint.
- [ ] **Phase 2:** Credentials page, shared card, route, navigation, and responsive grid.
- [ ] **Phase 3:** Certificate preview modal and mobile scroll-snap behaviour.
- [ ] **Phase 4:** Featured credentials section on the home page.
- [ ] **Phase 5:** Tests, accessibility review, performance checks, and production QA.
- [ ] **Phase 6:** Optional credential analytics.

## Step 23 — Definition of Done

- [ ] Certificates and badges share one maintainable `Credential` model.
- [ ] Credentials can be created, edited, published, featured, and reordered in Django Admin.
- [ ] Only published credentials are exposed by the API.
- [ ] The full credential list is available at `/credentials`.
- [ ] Users can filter between all credentials, certificates, and badges.
- [ ] Featured credentials appear on the home page.
- [ ] Desktop users receive a scan-friendly grid.
- [ ] Mobile users receive a usable swipeable list without autoplay.
- [ ] Square badges are not stretched or cropped.
- [ ] Certificates and verification links are accessible.
- [ ] Images are optimized and do not cause significant layout shifts.
- [ ] Backend and frontend tests pass.
- [ ] The frontend production build and Django system checks pass.
- [ ] The feature is verified in production on desktop and mobile.
