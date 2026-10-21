import { useCallback, useMemo, useState } from 'react';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Container, EmptyState, Pagination, Section, Spinner, cx } from '../../components/ui';
import { CategoryPills, VehicleGrid } from '../../components/vehicles';
import { reveal } from '../../components/home/sections';
import hs from '../../components/home/home.module.css';
import vehicleStyles from '../../components/vehicles/vehicles.module.css';

/**
 * The full vehicle listing. Called "Vehicles" throughout - never "Fleet".
 */
export default function Vehicles() {
  const { settings } = useSite();
  const [active, setActive] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  const load = useCallback(() => Promise.all([publicApi.vehicles(), publicApi.categories()]), []);
  const { data, loading, error } = useFetch(load, []);

  const vehicles = data?.[0]?.vehicles ?? [];
  const categories = data?.[1]?.categories ?? [];

  const filtered = useMemo(
    () => (active === 'all' ? vehicles : vehicles.filter((v) => v.category_slug === active)),
    [vehicles, active],
  );

  // The whole list arrives in one response, so paging happens here. Changing
  // the category or the page size always returns to the first page.
  const shown = useMemo(
    () => filtered.slice((page - 1) * perPage, page * perPage),
    [filtered, page, perPage],
  );

  const chooseCategory = (slug) => {
    setActive(slug);
    setPage(1);
  };

  return (
    <>
      <Seo
        title="Our Vehicles — Chauffeur-Driven Mercedes, SUVs & Vans"
        description="Browse our chauffeur-driven vehicles in Switzerland: Mercedes S-Class and E-Class, V-Class vans, Range Rover SUVs, Sprinter minibuses and the Maybach. Book any vehicle via WhatsApp."
        path="/vehicles"
        jsonLd={[
          localBusiness(settings),
          breadcrumbSchema([{ name: 'Vehicles', path: '/vehicles' }]),
        ]}
      />

      <PageHead
        trail={[{ name: 'Vehicles' }]}
        eyebrow="Our Vehicles"
        title="Vehicles kept to Swiss standards"
        text="Every car is late model, immaculate and driven by a vetted professional chauffeur. Choose a vehicle and book it in one WhatsApp message."
      />

      <Section>
        <Container>
          {loading && <Spinner label="Loading vehicles" />}
          {error && <Alert tone="error">{error.message}</Alert>}

          {!loading && !error && (
            <>
              <div ref={reveal} className={hs.xReveal}>
                <CategoryPills categories={categories} active={active} onChange={chooseCategory} />
              </div>

              {filtered.length ? (
                <>
                  {/* The cards arrive one after another as the grid is
                      scrolled to, the same way the homepage does it. */}
                  <div ref={reveal} className={hs.xReveal} key={`${active}-${page}-${perPage}`}>
                    <VehicleGrid
                      vehicles={shown}
                      pageType="vehicles-list"
                      className={cx(vehicleStyles.pageGrid, hs.xStagger)}
                    />
                  </div>
                  <Pagination
                    page={page}
                    perPage={perPage}
                    total={filtered.length}
                    onPageChange={setPage}
                    onPerPageChange={(n) => {
                      setPerPage(n);
                      setPage(1);
                    }}
                  />
                </>
              ) : (
                <EmptyState title="No vehicles in this category">
                  Try another category, or message us on WhatsApp and we will find the right car.
                </EmptyState>
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
