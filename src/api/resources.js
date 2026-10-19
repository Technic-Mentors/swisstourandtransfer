import { api, adminApi } from './client';
import stand from './placeholders';

const qs = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const str = search.toString();
  return str ? `?${str}` : '';
};

/* ----------------------------------------------------------- fallback ---
   Every public read goes through withFallback. When the API answers with
   content, that content wins. When it cannot answer - server down, empty
   database, a table with no rows yet - the matching builder in
   placeholders.js answers instead, in the same shape. The result: the public
   site is never blank and never shows an API error to a visitor.

   Admin reads are deliberately NOT wrapped: the panel must always show the
   real state of the database.                                             */

const emptyValue = (value) => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * @param request  the live call
 * @param builder  the placeholder builder, given the same arguments
 * @param keys     response keys that must carry content for it to count as a
 *                 real answer (e.g. 'vehicles', or ['city', 'vehicles'])
 */
function withFallback(request, builder, keys) {
  const required = Array.isArray(keys) ? keys : [keys];

  return async (...args) => {
    let data = null;

    try {
      data = await request(...args);
    } catch (err) {
      // An aborted request is a cancelled render, not a failure.
      if (err?.name === 'AbortError') throw err;
      const filled = builder(...args);
      if (filled) return filled;
      throw err;
    }

    const thin = !data || required.every((key) => emptyValue(data[key]));
    if (!thin) return data;

    return builder(...args) || data;
  };
}

/* ------------------------------------------------------------- public API */

export const publicApi = {
  settings: withFallback(() => api.get('/settings'), stand.settings, 'settings'),
  home: withFallback(() => api.get('/content/home'), stand.home, ['content', 'sections']),
  page: withFallback((key) => api.get(`/content/${key}`), stand.page, 'content'),
  faqs: withFallback(() => api.get('/faqs'), stand.faqs, 'faqs'),

  categories: withFallback(() => api.get('/categories'), stand.categories, 'categories'),
  category: withFallback((slug) => api.get(`/categories/${slug}`), stand.category, 'category'),
  vehicles: withFallback((params) => api.get(`/vehicles${qs(params)}`), stand.vehicles, 'vehicles'),
  vehicle: withFallback((slug) => api.get(`/vehicles/${slug}`), stand.vehicle, 'vehicle'),

  services: withFallback((params) => api.get(`/services${qs(params)}`), stand.services, 'services'),
  service: withFallback((slug) => api.get(`/services/${slug}`), stand.service, 'service'),

  cities: withFallback(() => api.get('/cities'), stand.cities, 'cities'),
  city: withFallback((slug) => api.get(`/cities/${slug}`), stand.city, 'city'),

  albums: withFallback(() => api.get('/gallery/albums'), stand.albums, 'albums'),
  photos: withFallback((params) => api.get(`/gallery${qs(params)}`), stand.photos, 'photos'),

  testimonials: withFallback(
    (params) => api.get(`/testimonials${qs(params)}`),
    stand.testimonials,
    'testimonials',
  ),
  promotions: withFallback(
    (params) => api.get(`/promotions/active${qs(params)}`),
    stand.promotions,
    'promotions',
  ),

  // Writes have no stand-in - a form must fail loudly if it cannot send.
  createEnquiry: (body) => api.post('/enquiries', body),
  trackWhatsApp: (body) => api.post('/whatsapp-clicks', body),
};

/* -------------------------------------------------------------- admin API */

export const admin = {
  login: (email, password) => api.post('/admin/auth/login', { email, password }),
  me: () => adminApi.get('/admin/auth/me'),
  updateProfile: (body) => adminApi.put('/admin/auth/profile', body),
  changePassword: (body) => adminApi.post('/admin/auth/change-password', body),

  dashboard: (params) => adminApi.get(`/admin/dashboard${qs(params)}`),
  stats: () => adminApi.get('/admin/dashboard/stats'),
  chart: (days = 30) => adminApi.get(`/admin/dashboard/chart?days=${days}`),
  topVehicles: () => adminApi.get('/admin/dashboard/top-vehicles'),
  latestEnquiries: () => adminApi.get('/admin/dashboard/latest-enquiries'),

  vehicles: (params) => adminApi.get(`/admin/vehicles${qs(params)}`),
  vehicle: (id) => adminApi.get(`/admin/vehicles/${id}`),
  createVehicle: (body) => adminApi.post('/admin/vehicles', body),
  updateVehicle: (id, body) => adminApi.put(`/admin/vehicles/${id}`, body),
  deleteVehicle: (id) => adminApi.delete(`/admin/vehicles/${id}`),
  toggleVehicle: (id, is_visible) => adminApi.patch(`/admin/vehicles/${id}/visibility`, { is_visible }),
  featureVehicle: (id, is_featured) => adminApi.patch(`/admin/vehicles/${id}/feature`, { is_featured }),
  reorderVehicles: (ids, start = 0) => adminApi.put('/admin/vehicles/reorder', { ids, start }),
  uploadVehiclePhotos: (id, formData) => adminApi.post(`/admin/vehicles/${id}/photos`, formData),
  deleteVehiclePhoto: (id, photoId) => adminApi.delete(`/admin/vehicles/${id}/photos/${photoId}`),
  reorderVehiclePhotos: (id, ids) => adminApi.put(`/admin/vehicles/${id}/photos/reorder`, { ids }),
  setVehicleCover: (id, photoId) => adminApi.patch(`/admin/vehicles/${id}/photos/${photoId}/cover`),

  categories: (params) => adminApi.get(`/admin/categories${qs(params)}`),
  createCategory: (body) => adminApi.post('/admin/categories', body),
  updateCategory: (id, body) => adminApi.put(`/admin/categories/${id}`, body),
  deleteCategory: (id) => adminApi.delete(`/admin/categories/${id}`),
  reorderCategories: (ids, start = 0) => adminApi.put('/admin/categories/reorder', { ids, start }),
  toggleCategory: (id, is_visible) => adminApi.patch(`/admin/categories/${id}/visibility`, { is_visible }),
  category: (id) => adminApi.get(`/admin/categories/${id}`),
  uploadCategoryPhotos: (id, formData) => adminApi.post(`/admin/categories/${id}/photos`, formData),
  deleteCategoryPhoto: (id, photoId) => adminApi.delete(`/admin/categories/${id}/photos/${photoId}`),
  reorderCategoryPhotos: (id, ids) => adminApi.put(`/admin/categories/${id}/photos/reorder`, { ids }),
  setCategoryCover: (id, photoId) => adminApi.patch(`/admin/categories/${id}/photos/${photoId}/cover`),

  services: (params) => adminApi.get(`/admin/services${qs(params)}`),
  service: (id) => adminApi.get(`/admin/services/${id}`),
  createService: (body) => adminApi.post('/admin/services', body),
  updateService: (id, body) => adminApi.put(`/admin/services/${id}`, body),
  deleteService: (id) => adminApi.delete(`/admin/services/${id}`),
  reorderServices: (ids, start = 0) => adminApi.put('/admin/services/reorder', { ids, start }),
  uploadServicePhotos: (id, formData) => adminApi.post(`/admin/services/${id}/photos`, formData),
  deleteServicePhoto: (id, photoId) => adminApi.delete(`/admin/services/${id}/photos/${photoId}`),
  reorderServicePhotos: (id, ids) => adminApi.put(`/admin/services/${id}/photos/reorder`, { ids }),
  setServiceCover: (id, photoId) => adminApi.patch(`/admin/services/${id}/photos/${photoId}/cover`),
  toggleService: (id, is_visible) => adminApi.patch(`/admin/services/${id}/visibility`, { is_visible }),
  toggleServiceHome: (id, show_on_homepage) =>
    adminApi.patch(`/admin/services/${id}/homepage`, { show_on_homepage }),

  cities: (params) => adminApi.get(`/admin/cities${qs(params)}`),
  createCity: (body) => adminApi.post('/admin/cities', body),
  updateCity: (id, body) => adminApi.put(`/admin/cities/${id}`, body),
  deleteCity: (id) => adminApi.delete(`/admin/cities/${id}`),
  reorderCities: (ids, start = 0) => adminApi.put('/admin/cities/reorder', { ids, start }),
  toggleCity: (id, is_visible) => adminApi.patch(`/admin/cities/${id}/visibility`, { is_visible }),

  sections: () => adminApi.get('/admin/sections'),
  reorderSections: (ids) => adminApi.put('/admin/sections/reorder', { ids }),
  toggleSection: (key, is_visible) => adminApi.patch(`/admin/sections/${key}/visibility`, { is_visible }),

  content: (pageKey) => adminApi.get(`/admin/content/${pageKey}`),
  saveContent: (pageKey, blocks) => adminApi.put(`/admin/content/${pageKey}`, { blocks }),

  faqs: () => adminApi.get('/admin/faqs'),
  createFaq: (body) => adminApi.post('/admin/faqs', body),
  updateFaq: (id, body) => adminApi.put(`/admin/faqs/${id}`, body),
  deleteFaq: (id) => adminApi.delete(`/admin/faqs/${id}`),
  reorderFaqs: (ids, start = 0) => adminApi.put('/admin/faqs/reorder', { ids, start }),

  albums: (params) => adminApi.get(`/admin/gallery/albums${qs(params)}`),
  createAlbum: (body) => adminApi.post('/admin/gallery/albums', body),
  updateAlbum: (id, body) => adminApi.put(`/admin/gallery/albums/${id}`, body),
  deleteAlbum: (id) => adminApi.delete(`/admin/gallery/albums/${id}`),
  reorderAlbums: (ids, start = 0) => adminApi.put('/admin/gallery/albums/reorder', { ids, start }),

  photos: (params) => adminApi.get(`/admin/gallery/photos${qs(params)}`),
  uploadPhotos: (formData) => adminApi.post('/admin/gallery/photos', formData),
  updatePhoto: (id, body) => adminApi.put(`/admin/gallery/photos/${id}`, body),
  deletePhoto: (id) => adminApi.delete(`/admin/gallery/photos/${id}`),
  reorderPhotos: (ids, start = 0) => adminApi.put('/admin/gallery/photos/reorder', { ids, start }),

  testimonials: (params) => adminApi.get(`/admin/testimonials${qs(params)}`),
  createTestimonial: (body) => adminApi.post('/admin/testimonials', body),
  updateTestimonial: (id, body) => adminApi.put(`/admin/testimonials/${id}`, body),
  deleteTestimonial: (id) => adminApi.delete(`/admin/testimonials/${id}`),
  approveTestimonial: (id, is_approved) =>
    adminApi.patch(`/admin/testimonials/${id}/approve`, { is_approved }),
  featureTestimonial: (id, is_featured) =>
    adminApi.patch(`/admin/testimonials/${id}/feature`, { is_featured }),

  promotions: (params) => adminApi.get(`/admin/promotions${qs(params)}`),
  createPromotion: (body) => adminApi.post('/admin/promotions', body),
  updatePromotion: (id, body) => adminApi.put(`/admin/promotions/${id}`, body),
  deletePromotion: (id) => adminApi.delete(`/admin/promotions/${id}`),
  duplicatePromotion: (id) => adminApi.post(`/admin/promotions/${id}/duplicate`),
  togglePromotion: (id, is_active) => adminApi.patch(`/admin/promotions/${id}/active`, { is_active }),

enquiries: (params) => adminApi.get(`/admin/enquiries${qs(params)}`),
setEnquiryStatus: (id, status) => adminApi.patch(`/admin/enquiries/${id}/status`, { status }),
deleteEnquiry: (id) => adminApi.delete(`/admin/enquiries/${id}`),
logWhatsAppContact: (id) => adminApi.post(`/admin/enquiries/${id}/whatsapp`),
activity: (id) => adminApi.get(`/admin/enquiries/${id}/activity`),
  settings: () => adminApi.get('/admin/settings'),
  saveSettings: (settings) => adminApi.put('/admin/settings', { settings }),
  sendTestEmail: (to) => adminApi.post('/admin/settings/test-email', { to }),

  upload: (file, folder) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('folder', folder);
    return adminApi.post('/admin/uploads', fd);
  },
};

export default publicApi;
