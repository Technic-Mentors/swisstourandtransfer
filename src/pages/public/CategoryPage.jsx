import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import { useSite } from '../../context/SiteContext';
import Seo from '../../components/seo/Seo';
import { breadcrumbSchema, localBusiness } from '../../components/seo/schemas';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Container, EmptyState, Section, Spinner } from '../../components/ui';
import { VehicleGrid } from '../../components/vehicles';
import vehicleStyles from '../../components/vehicles/vehicles.module.css';
import NotFound from './NotFound';

export default function CategoryPage() {
  const { slug } = useParams();
  const { settings } = useSite();

  const load = useCallback(() => publicApi.category(slug), [slug]);
  const { data, loading, error } = useFetch(load, [slug]);

  if (loading) return <Spinner label="Loading category" />;
  if (error?.status === 404) return <NotFound />;
  if (error) {
    return (
      <Container>
        <div style={{ padding: '80px 0' }}>
          <Alert tone="error">{error.message}</Alert>
        </div>
      </Container>
    );
  }

  const { category, vehicles } = data;

  return (
    <>
      <Seo
        title={`${category.name} Vehicles with Chauffeur in Switzerland`}
        description={
          category.description ||
          `Browse our ${category.name.toLowerCase()} vehicles with professional chauffeurs across Switzerland. Fixed prices, flight tracking and 24/7 WhatsApp booking.`
        }
        path={`/vehicles/category/${category.slug}`}
        jsonLd={[
          localBusiness(settings),
          breadcrumbSchema([
            { name: 'Vehicles', path: '/vehicles' },
            { name: category.name, path: `/vehicles/category/${category.slug}` },
          ]),
        ]}
      />

      <PageHead
        trail={[{ name: 'Vehicles', path: '/vehicles' }, { name: category.name }]}
        eyebrow="Vehicle category"
        title={category.name}
        text={category.description}
      />

      <Section>
        <Container>
          {vehicles.length ? (
            <VehicleGrid vehicles={vehicles} pageType="category" className={vehicleStyles.pageGrid} />
          ) : (
            <EmptyState title="No vehicles in this category yet">
              Message us on WhatsApp and we will find the right car for your journey.
            </EmptyState>
          )}
        </Container>
      </Section>
    </>
  );
}
