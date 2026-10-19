import { useCallback, useEffect, useState } from 'react';
import { admin } from '../../api/resources';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import Seo from '../../components/seo/Seo';
import { AdminPageHead } from '../../components/admin/AdminLayout';
import {
  AdminButton,
  AdminField,
  AdminTextArea,
  Alert,
  Card,
  CardHead,
  ConfirmDialog,
  SortableList,
  StatusBadge,
  Tabs,
  Toast,
} from '../../components/admin/widgets';
import SingleImageField from '../../components/admin/SingleImageField';
import { Spinner } from '../../components/ui';
import s from '../../components/admin/admin.module.css';

const PAGES = [
  { value: 'home', label: 'Homepage' },
  { value: 'about', label: 'About' },
  { value: 'footer', label: 'Footer' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'terms', label: 'Terms' },
  { value: 'impressum', label: 'Impressum' },
];

/**
 * Which blocks to show per page, and how to render each one.
 * `list` blocks hold repeating items as pipe-delimited text; the hint explains
 * the format rather than hiding it behind a bespoke repeater UI.
 */
const FIELDS = {
  home: [
    { key: 'hero_eyebrow', label: 'Hero eyebrow' },
    {
      key: 'hero_headline',
      label: 'Hero headline',
      hint: 'Text after the last comma is shown in gold italic, e.g. “Arrive in quiet luxury, anywhere in Switzerland.”',
    },
    { key: 'hero_text', label: 'Hero text', type: 'textarea', rows: 3 },
    { key: 'hero_image', label: 'Hero photo', type: 'image', folder: 'content' },
    { key: 'hero_primary_label', label: 'Hero WhatsApp button label' },
    { key: 'hero_secondary_label', label: 'Hero secondary button label' },

    { key: 'quick_booking_heading', label: 'Quick booking bar heading' },

    {
      key: 'trust_items',
      label: 'Trust strip items',
      type: 'textarea',
      rows: 5,
      hint: 'One item per line. {rating} and {count} are replaced with your Google rating settings.',
      list: 'single',
    },

    { key: 'categories_eyebrow', label: 'Categories eyebrow' },
    { key: 'categories_heading', label: 'Categories heading' },

    { key: 'vehicles_eyebrow', label: 'Vehicles eyebrow' },
    { key: 'vehicles_heading', label: 'Vehicles heading' },

    { key: 'services_eyebrow', label: 'Services eyebrow' },
    { key: 'services_heading', label: 'Services heading' },

    { key: 'why_eyebrow', label: 'Why choose us eyebrow' },
    { key: 'why_heading', label: 'Why choose us heading' },
    {
      key: 'why_items',
      label: 'Why choose us items',
      type: 'textarea',
      rows: 8,
      hint: 'One per line as “Title | Text”.',
      list: 'pair',
    },

    { key: 'how_eyebrow', label: 'How booking works eyebrow' },
    { key: 'how_heading', label: 'How booking works heading' },
    {
      key: 'how_steps',
      label: 'Booking steps',
      type: 'textarea',
      rows: 5,
      hint: 'One per line as “Title | Text”.',
      list: 'pair',
    },

    { key: 'reviews_eyebrow', label: 'Reviews eyebrow' },
    { key: 'reviews_heading', label: 'Reviews heading' },

    { key: 'gallery_eyebrow', label: 'Gallery eyebrow' },
    { key: 'gallery_heading', label: 'Gallery heading' },

    { key: 'faq_eyebrow', label: 'FAQ eyebrow' },
    { key: 'faq_heading', label: 'FAQ heading' },

    { key: 'cta_heading', label: 'Final CTA heading' },
    { key: 'cta_text', label: 'Final CTA text', type: 'textarea', rows: 3 },
    { key: 'cta_primary_label', label: 'Final CTA WhatsApp label' },
    { key: 'cta_secondary_label', label: 'Final CTA secondary label' },
  ],
  about: [
    { key: 'heading', label: 'Page heading' },
    { key: 'intro', label: 'Intro', type: 'textarea', rows: 3 },
    { key: 'body', label: 'Body', type: 'textarea', rows: 12, hint: 'Leave a blank line between paragraphs.' },
    { key: 'image', label: 'Page image', type: 'image', folder: 'content' },
    {
      key: 'stat_items',
      label: 'Statistics',
      type: 'textarea',
      rows: 5,
      hint: 'One per line as “Value | Label”.',
      list: 'pair',
    },
  ],
  footer: [
    { key: 'tagline', label: 'Tagline' },
    { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
  ],
  privacy: [
    { key: 'heading', label: 'Page heading' },
    { key: 'body', label: 'Body', type: 'textarea', rows: 16 },
  ],
  terms: [
    { key: 'heading', label: 'Page heading' },
    { key: 'body', label: 'Body', type: 'textarea', rows: 16 },
  ],
  impressum: [
    { key: 'heading', label: 'Page heading' },
    { key: 'body', label: 'Body', type: 'textarea', rows: 12 },
  ],
};

const HOME_FIELD_GROUPS = [
  {
    title: 'Hero and booking',
    description: 'The first section visitors see and the quick-booking bar.',
    keys: ['hero_eyebrow', 'hero_headline', 'hero_text', 'hero_image', 'hero_primary_label', 'hero_secondary_label', 'quick_booking_heading', 'trust_items'],
  },
  {
    title: 'Explore the fleet',
    description: 'Headings for the homepage categories, vehicles, and services.',
    keys: ['categories_eyebrow', 'categories_heading', 'vehicles_eyebrow', 'vehicles_heading', 'services_eyebrow', 'services_heading'],
  },
  {
    title: 'Why choose us',
    description: 'The benefits and proof points shown to visitors.',
    keys: ['why_eyebrow', 'why_heading', 'why_items'],
  },
  {
    title: 'Booking steps',
    description: 'Explain how customers book a transfer.',
    keys: ['how_eyebrow', 'how_heading', 'how_steps'],
  },
  {
    title: 'Reviews, gallery and FAQ',
    description: 'Section headings for customer reviews, photos, and questions.',
    keys: ['reviews_eyebrow', 'reviews_heading', 'gallery_eyebrow', 'gallery_heading', 'faq_eyebrow', 'faq_heading'],
  },
  {
    title: 'Final call to action',
    description: 'The closing message and buttons at the bottom of the homepage.',
    keys: ['cta_heading', 'cta_text', 'cta_primary_label', 'cta_secondary_label'],
  },
];

/* The DB stores repeating blocks pipe-delimited; the textarea shows one per line. */
const toLines = (value, kind) => {
  if (!value) return '';
  if (kind === 'pair') return String(value).split('||').join('\n');
  return String(value).split('|').join('\n');
};

const fromLines = (value, kind) => {
  const lines = String(value || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return kind === 'pair' ? lines.join('||') : lines.join('|');
};

export default function Content() {
  const toast = useToast();
  const [page, setPage] = useState('home');
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [faqConfirm, setFaqConfirm] = useState(null);

  const load = useCallback(
    () => Promise.all([admin.content(page), admin.sections(), admin.faqs()]),
    [page],
  );
  const { data, loading, error, refetch, setData } = useFetch(load, [page]);

  const content = data?.[0]?.content ?? {};
  const sections = data?.[1]?.sections ?? [];
  const faqs = data?.[2]?.faqs ?? [];

  // Reset the draft whenever a different page loads.
  useEffect(() => {
    setDraft({});
  }, [page]);

  const fields = FIELDS[page] || [];
  const valueOf = (field) => {
    if (draft[field.key] !== undefined) return draft[field.key];
    return field.list ? toLines(content[field.key], field.list) : content[field.key] ?? '';
  };

  const setField = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  const renderField = (field) => {
    if (field.type === 'image') {
      return (
        <SingleImageField
          key={field.key}
          label={field.label}
          folder={field.folder || 'content'}
          value={valueOf(field)}
          onChange={(path) => setDraft((prev) => ({ ...prev, [field.key]: path }))}
          onError={toast.error}
          hint={field.hint}
        />
      );
    }
    if (field.type === 'textarea') {
      return (
        <AdminTextArea
          key={field.key}
          label={field.label}
          rows={field.rows || 4}
          hint={field.hint}
          value={valueOf(field)}
          onChange={setField(field.key)}
        />
      );
    }
    return (
      <AdminField
        key={field.key}
        label={field.label}
        hint={field.hint}
        value={valueOf(field)}
        onChange={setField(field.key)}
      />
    );
  };

  async function save() {
    setSaving(true);
    try {
      const blocks = {};
      for (const field of fields) {
        if (draft[field.key] === undefined) continue;
        blocks[field.key] = field.list ? fromLines(draft[field.key], field.list) : draft[field.key];
      }
      if (Object.keys(blocks).length === 0) {
        toast.info('Nothing changed.');
        return;
      }
      await admin.saveContent(page, blocks);
      setDraft({});
      refetch();
      toast.success('Content saved and published.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------- sections */

  async function reorderSections(next) {
    setData((prev) => [prev[0], { sections: next }, prev[2]]);
    try {
      await admin.reorderSections(next.map((x) => x.id));
      toast.success('Homepage order updated.');
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  }

  async function toggleSection(section) {
    try {
      await admin.toggleSection(section.section_key, section.is_visible ? 0 : 1);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  /* -------------------------------------------------------------- faqs */

  const [faqDraft, setFaqDraft] = useState(null);

  async function saveFaq() {
    if (!faqDraft.question.trim() || !faqDraft.answer.trim()) {
      toast.error('A question and an answer are both required.');
      return;
    }
    try {
      if (faqDraft.id) await admin.updateFaq(faqDraft.id, faqDraft);
      else await admin.createFaq(faqDraft);
      setFaqDraft(null);
      refetch();
      toast.success('FAQ saved.');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteFaq() {
    try {
      await admin.deleteFaq(faqConfirm.id);
      refetch();
      toast.success('FAQ deleted.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFaqConfirm(null);
    }
  }

  async function reorderFaqs(next) {
    setData((prev) => [prev[0], prev[1], { faqs: next }]);
    try {
      await admin.reorderFaqs(next.map((f) => f.id));
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  }

  const dirty = Object.keys(draft).length > 0;

  return (
    <>
      <Seo title="Website content · Admin" noindex bare />

      <AdminPageHead
        title="Website content"
        subtitle="Edit the text and images on each page, and show, hide or reorder the homepage sections."
      >
        <AdminButton variant="outline" onClick={() => window.open('/', '_blank')}>
          Preview site
        </AdminButton>
        <AdminButton variant="gold" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : dirty ? 'Save & publish' : 'Saved'}
        </AdminButton>
      </AdminPageHead>

      {error && <Alert tone="error">{error.message}</Alert>}

      <div className={s.toolbar}>
        <Tabs options={PAGES} value={page} onChange={setPage} />
      </div>

      {loading ? (
        <Spinner label="Loading content" />
      ) : (
        <div className={page === 'home' ? s.contentLayout : undefined}>
          <div className={page === 'home' ? s.contentEditor : undefined}>
            {page === 'home' ? (
              HOME_FIELD_GROUPS.map((group) => (
                <Card className={s.contentGroup} key={group.title}>
                  <CardHead title={group.title} />
                  <div className={s.cardPad}>
                    <p className={s.contentGroupDescription}>{group.description}</p>
                    <div className={s.contentFieldGrid}>
                      {group.keys
                        .map((key) => fields.find((field) => field.key === key))
                        .filter(Boolean)
                        .map(renderField)}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <CardHead title={PAGES.find((p) => p.value === page)?.label || 'Page'} />
                <div className={s.cardPad}>
                  <div className={s.formGrid}>{fields.map(renderField)}</div>
                </div>
              </Card>
            )}
            <div className={s.contentSaveBar}>
              <span className={dirty ? s.contentUnsaved : s.contentSaved}>
                {dirty ? 'You have unpublished changes.' : 'All changes are published.'}
              </span>
              <AdminButton variant="gold" onClick={save} disabled={saving || !dirty}>
                {saving ? 'Saving…' : 'Save & publish'}
              </AdminButton>
            </div>
          </div>

          {page === 'home' && (
            <aside className={s.contentSidebar}>
              <Card>
                <CardHead title="Homepage sections" />
                <div className={s.cardPad}>
                  <p className={s.hint} style={{ marginBottom: 14 }}>
                    Drag to reorder. Hidden sections disappear from the live homepage immediately.
                  </p>
                  <SortableList
                    items={sections}
                    onReorder={reorderSections}
                    renderItem={(x) => (
                      <>
                        <div className={s.sortName}>{x.label}</div>
                        <div className={s.sortNote}>{x.description}</div>
                      </>
                    )}
                    right={(x) => (
                      <div className={s.contentSectionActions}>
                        <StatusBadge on={x.is_visible} onLabel="Shown" offLabel="Hidden" />
                        <button type="button" className={s.actionLink} onClick={() => toggleSection(x)}>
                          {x.is_visible ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    )}
                  />
                </div>
              </Card>

              <Card className={s.contentFaqCard}>
                <CardHead title="FAQ">
                  <button
                    type="button"
                    className={s.actionLink}
                    onClick={() => setFaqDraft({ question: '', answer: '', is_visible: true })}
                  >
                    + Add question
                  </button>
                </CardHead>
                <div className={s.cardPad}>
                  {faqDraft && (
                    <div style={{ marginBottom: 18 }}>
                      <div className={s.formGrid}>
                        <AdminField
                          label="Question"
                          value={faqDraft.question}
                          onChange={(e) => setFaqDraft((p) => ({ ...p, question: e.target.value }))}
                        />
                        <AdminTextArea
                          label="Answer"
                          rows={4}
                          value={faqDraft.answer}
                          onChange={(e) => setFaqDraft((p) => ({ ...p, answer: e.target.value }))}
                        />
                      </div>
                      <div className={s.formFoot}>
                        <div className={s.formFootActions}>
                          <AdminButton variant="outline" size="sm" onClick={() => setFaqDraft(null)}>
                            Cancel
                          </AdminButton>
                          <AdminButton variant="gold" size="sm" onClick={saveFaq}>
                            Save FAQ
                          </AdminButton>
                        </div>
                      </div>
                    </div>
                  )}

                  {faqs.length ? (
                    <SortableList
                      items={faqs}
                      onReorder={reorderFaqs}
                      renderItem={(f) => (
                        <>
                          <div className={s.sortName}>{f.question}</div>
                          <div className={s.sortNote}>{f.answer.slice(0, 90)}{f.answer.length > 90 ? '…' : ''}</div>
                        </>
                      )}
                      right={(f) => (
                        <div className={s.contentFaqActions}>
                          <button type="button" className={s.actionLink} onClick={() => setFaqDraft(f)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`${s.actionLink} ${s.actionDanger}`}
                            onClick={() => setFaqConfirm(f)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    />
                  ) : (
                    <div className={s.empty}>No FAQs yet.</div>
                  )}
                </div>
              </Card>
            </aside>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(faqConfirm)}
        title="Delete this question?"
        text={faqConfirm?.question}
        onConfirm={deleteFaq}
        onCancel={() => setFaqConfirm(null)}
      />

      <Toast toast={toast.toast} onDismiss={toast.dismiss} />
    </>
  );
}
