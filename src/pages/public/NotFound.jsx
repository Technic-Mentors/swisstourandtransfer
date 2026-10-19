import Seo from '../../components/seo/Seo';
import { Button, Container, Section } from '../../components/ui';
import WhatsAppButton from '../../components/ui/WhatsAppButton';
import s from './pages.module.css';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="The page you are looking for does not exist." noindex />

      <Section>
        <Container>
          <div className={s.notFound}>
            <div className={s.notFoundCode}>404</div>
            <h1>This road does not go anywhere</h1>
            <p style={{ maxWidth: 480, margin: '16px auto 0' }}>
              The page you are looking for has moved or never existed. Let us get you back on route.
            </p>

            <div className={s.notFoundActions}>
              <Button to="/">Back to home</Button>
              <Button to="/vehicles" variant="outline">
                View our vehicles
              </Button>
              <WhatsAppButton pageType="404" variant="outline">
                Message us
              </WhatsAppButton>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
