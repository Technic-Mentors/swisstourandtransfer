import { useCallback } from 'react';
import { publicApi } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import Seo from '../../components/seo/Seo';
import { PageHead } from '../../components/layout/PublicLayout';
import { Alert, Container, Section, Spinner } from '../../components/ui';
import s from './pages.module.css';

const TITLES = {
  privacy: 'Privacy policy',
  terms: 'Terms and conditions',
  impressum: 'Impressum',
};

/** Privacy, Terms and Impressum all render from content_blocks. */
export default function LegalPage({ pageKey }) {
  const load = useCallback(() => publicApi.page(pageKey), [pageKey]);
  const { data, loading, error } = useFetch(load, [pageKey]);

  const content = data?.content ?? {};
  const heading = content.heading || TITLES[pageKey] || 'Legal';

  return (
    <>
      <Seo
        title={heading}
        description={`${heading} for Swiss Tour & Transfer, a private chauffeur and transfer company in Switzerland.`}
        path={`/${pageKey}`}
      />

      <PageHead trail={[{ name: heading }]} eyebrow="Legal" title={heading} />

      <Section>
        <Container>
          {loading && <Spinner label="Loading" />}
          {error && <Alert tone="error">{error.message}</Alert>}

          {!loading && !error && (
            <div className={s.prose}>
              {(content.body || '').split('\n\n').map((para, i) => (
                <p key={i} style={{ whiteSpace: 'pre-line' }}>
                  {para}
                </p>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
