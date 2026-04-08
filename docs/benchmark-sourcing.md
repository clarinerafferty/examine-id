# Benchmark Sourcing Plan

This note documents how `Examine.ID` can move from prototype benchmark values to source-based benchmark values using official Indonesian statistics where possible.

## Current status

The current prototype stores benchmark records in `CategoryBenchmark`, but the values in [seed.sql](/C:/Users/clari/OneDrive%20-%20Queen's%20University%20Belfast/CSC3023%20BIT%20Project/examine.id/server/sql/seed.sql) are seeded demonstration values rather than numbers automatically imported from live external sources.

## Recommended source strategy

Use official `BPS-Statistics Indonesia` publications as the primary benchmark source because they are:

- official and citable
- national in scope
- category-based
- suitable for dissertation documentation

## Category mapping

| Examine.ID category | Recommended benchmark source | Method |
| --- | --- | --- |
| `Travel and Accommodation` | BPS `Consumer Price of Selected Goods and Services for Health, Transportation, and Education Groups of 150 Regencies/Municipalities in Indonesia 2024` | Use transport-related average prices as the benchmark basis. If accommodation is needed separately, combine with a documented lodging proxy from the national consumer price publication. |
| `Constituency Office Operations` | BPS `Consumer Price of Selected Goods and Services for Housing, Water, Electricity, and Household Fuel Group of 150 Regencies/Municipalities in Indonesia 2024` | Use rental and utilities-related price items as a proxy for office running costs. |
| `Staff and Research Support` | No clean single BPS consumer-price item | Keep as a documented prototype proxy unless a separate wage or salary dataset is chosen. |
| `Community Outreach` | BPS `National Consumer Price of Selected Goods and Services 2024` | Use printed materials or communications-related consumer price items as a proxy. |
| `Digital Communications` | BPS `National Consumer Price of Selected Goods and Services 2024` | Use internet, phone-credit, or communication-service items as a proxy. |

## Draft replacement benchmark table

This table gives one benchmark item choice per allowance category and shows the current seeded monthly proxy value already in the prototype. These are the values now referenced in `source_name` and `source_url`, but they should still be treated as provisional until the exact figure is extracted from the cited publication.

| Examine.ID category | Recommended benchmark item to extract | Current seeded monthly proxy in `seed.sql` for Apr 2025 | Source basis | Notes |
| --- | --- | --- | --- | --- |
| `Travel and Accommodation` | Transport-cost basket using an airfare or intercity transport item, optionally combined with a lodging proxy | `Rp 48,000,000` | BPS health, transportation, and education price publication | Best candidate for a source-based benchmark; still needs exact item selection. |
| `Constituency Office Operations` | Monthly rent plus utilities proxy | `Rp 31,500,000` | BPS housing, water, electricity, and fuel price publication | Strongest direct proxy for office running costs. |
| `Staff and Research Support` | Research assistant or admin wage proxy | `Rp 44,500,000` | No single direct BPS price item chosen yet | Keep clearly labelled as a prototype proxy until a wage dataset is selected. |
| `Community Outreach` | Printed materials, communication, or event-support proxy | `Rp 20,000,000` | BPS national selected consumer prices | Suitable for leaflets, promotional materials, and public-contact spending. |
| `Digital Communications` | Internet/data/telecom services proxy | `Rp 13,250,000` | BPS national selected consumer prices | Most defensible proxy for web, social, and online publication costs. |

## What was updated in the prototype

- `CategoryBenchmark.source_name` now uses real-source labels instead of the old prototype placeholder text.
- `CategoryBenchmark.source_url` now points to official BPS publication pages where possible.
- The benchmark numeric values in the seed file were not replaced with claimed real extracted figures yet, because that would require item-level extraction from the cited publications.
- This keeps the prototype honest: the app now stores real benchmark provenance, while the values remain clearly provisional proxies until verified extraction is completed.

## Primary sources

1. BPS, `Consumer Price of Selected Goods and Services for Housing, Water, Electricity, and Household Fuel Group of 150 Regencies/Municipalities in Indonesia 2024`, released April 28, 2025  
   https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html

2. BPS, `Consumer Price of Selected Goods and Services for Health, Transportation, and Education Groups of 150 Regencies/Municipalities in Indonesia 2024`, released April 28, 2025  
   https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html

3. BPS, `National Consumer Price of Selected Goods and Services 2024`, released May 16, 2025  
   https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html

## Practical import method

The cleanest dissertation-safe workflow is:

1. Choose one benchmark item per allowance category.
2. Extract the national average or an explicitly documented average from the BPS publication.
3. Convert the number into a monthly benchmark where needed.
4. Store the value in `CategoryBenchmark`.
5. Record the publication title in `source_name`.
6. Record the publication URL in `source_url`.

## Example benchmark interpretation rules

- `Travel and Accommodation`: use a transport benchmark item and document that the category is represented by a transport-cost proxy rather than the full real travel bundle.
- `Constituency Office Operations`: use rent and utilities as the benchmark proxy because they reflect recurring office operating costs.
- `Digital Communications`: use internet or telecom-related prices as the benchmark proxy.
- `Community Outreach`: use printing or communication-service prices as the benchmark proxy.
- `Staff and Research Support`: keep as a prototype-only benchmark until a defensible labour-cost dataset is selected.

## Recommended dissertation wording

The benchmark comparison feature was designed to support real external reference values. In the current prototype, benchmark records are stored in the `CategoryBenchmark` table and can be populated from official Indonesian statistics. BPS-Statistics Indonesia publications were identified as the preferred source because they provide category-based consumer price data across Indonesian regencies and municipalities. Where an allowance category did not have a direct published equivalent, a documented proxy measure was proposed, such as rental and utility costs for office operations or telecom prices for digital communications. This approach preserves transparency by storing both the benchmark source title and source URL alongside each benchmark record.

## Suggested next implementation step

If we want to replace the current seed values, the next task should be:

- extract one real benchmark figure per category
- update the `CategoryBenchmark` rows in [seed.sql](/C:/Users/clari/OneDrive%20-%20Queen's%20University%20Belfast/CSC3023%20BIT%20Project/examine.id/server/sql/seed.sql)
- keep any remaining unsupported categories clearly labelled as proxy values
