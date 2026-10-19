import { Suspense, lazy, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import { Spinner } from './components/ui';

import Home from './pages/public/Home';
import Vehicles from './pages/public/Vehicles';
import VehicleDetail from './pages/public/VehicleDetail';
import CategoryPage from './pages/public/CategoryPage';
import Services from './pages/public/Services';
import ServiceDetail from './pages/public/ServiceDetail';
import CityPage from './pages/public/CityPage';
import About from './pages/public/About';
import Gallery from './pages/public/Gallery';
import Reviews from './pages/public/Reviews';
import Contact from './pages/public/Contact';
import Book from './pages/public/Book';
import Offers from './pages/public/Offers';
import LegalPage from './pages/public/LegalPage';
import NotFound from './pages/public/NotFound';

/**
 * The admin panel is lazy-loaded. It pulls in the chart and drag-and-drop
 * libraries, and no public visitor should download those - it keeps the
 * public bundle small, which matters for the SEO work this site depends on.
 */
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const AdminEntry = lazy(() => import('./pages/admin/AdminEntry'));
const AdminVehicles = lazy(() => import('./pages/admin/Vehicles'));
const AdminVehicleForm = lazy(() => import('./pages/admin/VehicleForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminCategoryForm = lazy(() => import('./pages/admin/CategoryForm'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminServiceForm = lazy(() => import('./pages/admin/ServiceForm'));
const AdminCities = lazy(() => import('./pages/admin/Cities'));
const AdminCityForm = lazy(() => import('./pages/admin/CityForm'));
const AdminContent = lazy(() => import('./pages/admin/Content'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const AdminAlbumForm = lazy(() => import('./pages/admin/AlbumForm'));
const AdminPhotoForm = lazy(() => import('./pages/admin/PhotoForm'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));
const AdminTestimonialForm = lazy(() => import('./pages/admin/TestimonialForm'));
const AdminPromotions = lazy(() => import('./pages/admin/Promotions'));
const AdminPromotionForm = lazy(() => import('./pages/admin/PromotionForm'));
const AdminEnquiries = lazy(() => import('./pages/admin/Enquiries'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));

const adminFallback = (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--admin-bg)' }}>
    <Spinner label="Loading admin panel" />
  </div>
);

/** Wraps an admin screen in the lazy boundary, auth guard and admin shell. */
const guarded = (element) => (
  <Suspense fallback={adminFallback}>
    <ProtectedRoute>{element}</ProtectedRoute>
  </Suspense>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowButton(false);
  }, [pathname]);

  useEffect(() => {
    const updateVisibility = () => setShowButton(window.scrollY > 400);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  return showButton ? (
    <button
      type="button"
      className="scroll-top-button"
      aria-label="Scroll to top"
      onClick={() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 14 6-6 6 6" />
      </svg>
    </button>
  ) : null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ------------------------------------------------------ public site */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />

          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/category/:slug" element={<CategoryPage />} />
          <Route path="vehicles/:slug" element={<VehicleDetail />} />

          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />

          <Route path="chauffeur-service/:slug" element={<CityPage />} />

          <Route path="about" element={<About />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="contact" element={<Contact />} />
          <Route path="book" element={<Book />} />
          <Route path="offers" element={<Offers />} />

          <Route path="privacy" element={<LegalPage pageKey="privacy" />} />
          <Route path="terms" element={<LegalPage pageKey="terms" />} />
          <Route path="impressum" element={<LegalPage pageKey="impressum" />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ------------------------------------------------------ admin panel */}
        {/* /admin shows the login screen when signed out, the dashboard when
            signed in. Deeper routes bounce back here if the session is gone. */}
        <Route path="/admin" element={<Suspense fallback={adminFallback}><AdminEntry /></Suspense>} />
        <Route path="/admin/profile" element={guarded(<AdminProfile />)} />
        <Route path="/admin/vehicles" element={guarded(<AdminVehicles />)} />
        {/* Add/edit take over the page rather than opening over the list. */}
        <Route path="/admin/vehicles/new" element={guarded(<AdminVehicleForm />)} />
        <Route path="/admin/vehicles/:id" element={guarded(<AdminVehicleForm />)} />
        <Route path="/admin/categories" element={guarded(<AdminCategories />)} />
        <Route path="/admin/categories/new" element={guarded(<AdminCategoryForm />)} />
        <Route path="/admin/categories/:id" element={guarded(<AdminCategoryForm />)} />
        <Route path="/admin/services" element={guarded(<AdminServices />)} />
        <Route path="/admin/services/new" element={guarded(<AdminServiceForm />)} />
        <Route path="/admin/services/:id" element={guarded(<AdminServiceForm />)} />
        <Route path="/admin/cities" element={guarded(<AdminCities />)} />
        <Route path="/admin/cities/new" element={guarded(<AdminCityForm />)} />
        <Route path="/admin/cities/:id" element={guarded(<AdminCityForm />)} />
        <Route path="/admin/content" element={guarded(<AdminContent />)} />
        <Route path="/admin/gallery" element={guarded(<AdminGallery />)} />
        <Route path="/admin/gallery/albums/new" element={guarded(<AdminAlbumForm />)} />
        <Route path="/admin/gallery/albums/:id" element={guarded(<AdminAlbumForm />)} />
        <Route path="/admin/gallery/photos/:id" element={guarded(<AdminPhotoForm />)} />
        <Route path="/admin/testimonials" element={guarded(<AdminTestimonials />)} />
        <Route path="/admin/testimonials/new" element={guarded(<AdminTestimonialForm />)} />
        <Route path="/admin/testimonials/:id" element={guarded(<AdminTestimonialForm />)} />
        <Route path="/admin/promotions" element={guarded(<AdminPromotions />)} />
        <Route path="/admin/promotions/new" element={guarded(<AdminPromotionForm />)} />
        <Route path="/admin/promotions/:id" element={guarded(<AdminPromotionForm />)} />
        <Route path="/admin/enquiries" element={guarded(<AdminEnquiries />)} />
        <Route path="/admin/settings" element={guarded(<AdminSettings />)} />
      </Routes>
    </>
  );
}
