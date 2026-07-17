# Credential Content Inventory

Use one row per certificate or course badge before adding records to Django Admin. Do not publish a credential until its title, issuer, date, and public asset URL have been verified against the original source. Media is stored outside this repository; use public HTTPS URLs in `image_url`.

## Data format

| Field | Required | Format / rule |
| --- | --- | --- |
| `title` | Yes | Exact title shown by the issuer. |
| `issuer` | Yes | Official organization name. |
| `credential_type` | Yes | `certificate` or `badge`. |
| `issued_at` | Yes | ISO date: `YYYY-MM-DD`. Use the first day of the issue month only when the exact day is unavailable. |
| `credential_id` | No | Issuer-provided identifier; leave empty when unavailable. |
| `credential_url` | No | Official public verification URL. |
| `source_asset` | Yes | Path to the original certificate PDF/image or the high-resolution badge asset. Keep this private until a public delivery URL is ready. |
| `image_url` | Yes | Stable public HTTPS URL for the optimized preview image. |
| `category` | Yes | One primary category: `backend`, `python`, `database`, `docker`, `cloud`, `linux`, `networking`, `security`, or `other`. |
| `skills` | Yes | Comma-separated, concise tags, for example `Python, Django, PostgreSQL`. |
| `description` | No | One short sentence only when it gives useful professional context. |
| `is_featured` | Yes | `yes` only for the strongest professional credentials. |
| `sort_order` | Yes | Positive integer. Rank backend, Python, database, Docker, cloud, Linux, networking, and security credentials before introductory badges; use issue date as the tie-breaker. |
| `verification_status` | Yes | `verified`, `no-public-url`, or `pending`. Only `verified` and `no-public-url` records may be published. |

## Inventory

| title | issuer | credential_type | issued_at | credential_id | credential_url | source_asset | image_url | category | skills | description | is_featured | sort_order | verification_status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Backend Development Certificate (placeholder) | Portfolio placeholder | `certificate` | `2026-01-01` |  |  | External media | `https://placehold.co/1200x850/0f172a/e2e8f0?text=Certificate+Preview` | `backend` | Python, Django, REST API | Temporary development record; replace with a verified credential. | `no` | 1 | `pending` |
| Course Completion Badge (placeholder) | Portfolio placeholder | `badge` | `2026-01-01` |  |  | External media | `https://placehold.co/512x512/1e293b/e2e8f0?text=Course+Badge` | `other` | Professional development | Temporary development record; replace with a verified course badge. | `no` | 2 | `pending` |

## Asset checklist

- Retain the original PDF or high-resolution image separately from the web preview.
- Use a WebP or AVIF preview for certificates; use PNG, WebP, or AVIF for badges depending on whether transparency is needed.
- Confirm that every public URL is stable, accessible over HTTPS, and is owned or approved for portfolio use.
- Describe course completions as `Course badge` or `Course completion`; do not call them professional certifications.
