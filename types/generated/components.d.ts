import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAbout extends Struct.ComponentSchema {
  collectionName: 'components_blocks_abouts';
  info: {
    displayName: 'about';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    features: Schema.Attribute.Component<'shared.bullet', true>;
    stats: Schema.Attribute.Component<'shared.stat', true>;
    teamMembers: Schema.Attribute.Component<'shared.team-member', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksArticleGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_article_grids';
  info: {
    description: 'Zeigt alle Artikel aus /api/articles/public als Karten';
    displayName: 'Article Grid';
    icon: 'grid';
  };
  attributes: {
    columns: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksButtonGroup extends Struct.ComponentSchema {
  collectionName: 'components_blocks_button_groups';
  info: {
    description: 'A row of buttons with alignment';
    displayName: 'Button Group';
  };
  attributes: {
    align: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    buttons: Schema.Attribute.Component<'shared.button', true> &
      Schema.Attribute.Required;
  };
}

export interface BlocksCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_card_grids';
  info: {
    description: 'Grid of cards with optional title';
    displayName: 'Card Grid';
  };
  attributes: {
    columns: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3>;
    items: Schema.Attribute.Component<'blocks.card-item', true> &
      Schema.Attribute.Required;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksCardItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_card_items';
  info: {
    description: 'Single card for Card Grid';
    displayName: 'Card Item';
  };
  attributes: {
    badge: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    media: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksContact extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contacts';
  info: {
    displayName: 'contact';
  };
  attributes: {
    contactInfo: Schema.Attribute.Component<'shared.contact-info', false>;
    formFields: Schema.Attribute.Component<'shared.form-field', true>;
    socialMedia: Schema.Attribute.Component<'shared.social-link', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_ctas';
  info: {
    displayName: 'cta';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksEventGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_event_grids';
  info: {
    displayName: 'Event Grid';
    icon: 'grid';
  };
  attributes: {
    columns: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3>;
    featuredOnly: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    includePast: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 24;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<6>;
    sort: Schema.Attribute.Enumeration<['asc', 'desc']> &
      Schema.Attribute.DefaultTo<'asc'>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksEventList extends Struct.ComponentSchema {
  collectionName: 'components_blocks_event_lists';
  info: {
    displayName: 'Event List';
    icon: 'list';
  };
  attributes: {
    featuredOnly: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    includePast: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksGallery extends Struct.ComponentSchema {
  collectionName: 'components_blocks_galleries';
  info: {
    displayName: 'gallery';
  };
  attributes: {
    categories: Schema.Attribute.Component<'shared.category', true>;
    cta: Schema.Attribute.Component<'shared.dual-cta', false>;
    rings: Schema.Attribute.Component<'shared.ring', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heros';
  info: {
    displayName: 'hero';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    badge: Schema.Attribute.String;
    features: Schema.Attribute.Component<'shared.feature', true>;
    primaryButtonLink: Schema.Attribute.String;
    primaryButtonText: Schema.Attribute.String;
    secondaryButtonLink: Schema.Attribute.String;
    secondaryButtonText: Schema.Attribute.String;
    stats: Schema.Attribute.Component<'shared.stat', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksImage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_images';
  info: {
    displayName: 'image';
  };
  attributes: {
    altText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media & Schema.Attribute.Required;
  };
}

export interface BlocksMediaText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_texts';
  info: {
    description: 'Image/Video beside text and CTAs';
    displayName: 'Media & Text';
  };
  attributes: {
    buttons: Schema.Attribute.Component<'shared.button', true>;
    media: Schema.Attribute.Media<'images' | 'videos'>;
    mediaPosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    richText: Schema.Attribute.RichText;
    title: Schema.Attribute.String;
  };
}

export interface BlocksNewsList extends Struct.ComponentSchema {
  collectionName: 'components_blocks_news_lists';
  info: {
    displayName: 'News List';
    icon: 'list';
  };
  attributes: {
    featuredOnly: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksPricingFeature extends Struct.ComponentSchema {
  collectionName: 'components_blocks_pricing_features';
  info: {
    description: 'Feature row for a plan';
    displayName: 'Pricing Feature';
  };
  attributes: {
    included: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksPricingPlan extends Struct.ComponentSchema {
  collectionName: 'components_blocks_pricing_plans';
  info: {
    description: 'Single pricing plan';
    displayName: 'Pricing Plan';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.button', false>;
    features: Schema.Attribute.Component<'blocks.pricing-feature', true> &
      Schema.Attribute.Required;
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    period: Schema.Attribute.String;
    price: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksPricingTable extends Struct.ComponentSchema {
  collectionName: 'components_blocks_pricing_tables';
  info: {
    description: 'Table of multiple plans';
    displayName: 'Pricing Table';
  };
  attributes: {
    plans: Schema.Attribute.Component<'blocks.pricing-plan', true> &
      Schema.Attribute.Required;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksProductSlider extends Struct.ComponentSchema {
  collectionName: 'components_blocks_productsliders';
  info: {
    description: 'Zeigt bis zu 10 Produkte aus Meilisearch als Slider an.';
    displayName: 'Product Slider';
    icon: 'shopping-bag';
  };
  attributes: {
    attributesToRetrieve: Schema.Attribute.JSON;
    button: Schema.Attribute.Component<'blocks.button-group', true>;
    description: Schema.Attribute.Text;
    displayMode: Schema.Attribute.Enumeration<['Slider', 'List', 'Grid']> &
      Schema.Attribute.DefaultTo<'Slider'>;
    filters: Schema.Attribute.Text;
    indexName: Schema.Attribute.String & Schema.Attribute.Required;
    maxItems: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
    query: Schema.Attribute.String;
    sort: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksQuote extends Struct.ComponentSchema {
  collectionName: 'components_blocks_quotes';
  info: {
    displayName: 'quote';
  };
  attributes: {
    author: Schema.Attribute.String;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
    role: Schema.Attribute.String;
  };
}

export interface BlocksRichtextColumn extends Struct.ComponentSchema {
  collectionName: 'components_blocks_richtext_column';
  info: {
    description: 'Einzelne Spalte mit Breite & Inhalt';
    displayName: 'Richtext Column';
    icon: 'columns';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.DefaultTo<''>;
    width: Schema.Attribute.Enumeration<
      ['1/6', '1/4', '1/3', '1/2', '2/3', '3/4', '5/6', '1']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'1/2'>;
  };
}

export interface BlocksRichtextColumns extends Struct.ComponentSchema {
  collectionName: 'components_blocks_richtext_columns';
  info: {
    description: 'Mehrspaltiger Richtext mit w\u00E4hlbaren Spaltenbreiten';
    displayName: 'Richtext Columns';
    icon: 'layer-group';
  };
  attributes: {
    backgorund: Schema.Attribute.Boolean;
    columns: Schema.Attribute.Component<'blocks.richtext-column', true> &
      Schema.Attribute.Required;
    gap: Schema.Attribute.Enumeration<['sm', 'md', 'lg', 'xl']> &
      Schema.Attribute.DefaultTo<'md'>;
    title: Schema.Attribute.String;
  };
}

export interface BlocksServices extends Struct.ComponentSchema {
  collectionName: 'components_blocks_services';
  info: {
    displayName: 'services';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta', false>;
    services: Schema.Attribute.Component<'shared.service', true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksSpace extends Struct.ComponentSchema {
  collectionName: 'components_blocks_space';
  info: {
    description: 'Vertikaler Abstand (xs/s/m/l/xl)';
    displayName: 'Space';
    icon: 'expand';
  };
  attributes: {
    size: Schema.Attribute.Enumeration<['xs', 's', 'm', 'l', 'xl']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'m'>;
  };
}

export interface BlocksStepItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_step_items';
  info: {
    description: 'One step in a process';
    displayName: 'Step Item';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksSteps extends Struct.ComponentSchema {
  collectionName: 'components_blocks_steps';
  info: {
    description: 'List of steps / timeline';
    displayName: 'Steps';
  };
  attributes: {
    items: Schema.Attribute.Component<'blocks.step-item', true> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String;
  };
}

export interface BlocksText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_texts';
  info: {
    displayName: 'text';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    title: Schema.Attribute.String;
  };
}

export interface SharedAddress extends Struct.ComponentSchema {
  collectionName: 'components_shared_addresses';
  info: {
    displayName: 'Address';
  };
  attributes: {
    city: Schema.Attribute.String;
    company: Schema.Attribute.String;
    country: Schema.Attribute.String;
    mapLink: Schema.Attribute.String;
    postalCode: Schema.Attribute.String;
    street: Schema.Attribute.String;
  };
}

export interface SharedAiSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_ai_seos';
  info: {
    description: 'Prompt- und Ergebnisdaten f\u00FCr AI-unterst\u00FCtzte Meta-Texte';
    displayName: 'AI SEO';
    icon: 'robot';
  };
  attributes: {
    callToAction: Schema.Attribute.String;
    confidenceScore: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      >;
    generatedDescription: Schema.Attribute.Text;
    generatedKeywords: Schema.Attribute.JSON;
    generatedTitle: Schema.Attribute.String;
    lastGeneratedAt: Schema.Attribute.DateTime;
    model: Schema.Attribute.String;
    primaryKeyword: Schema.Attribute.String;
    prompt: Schema.Attribute.Text;
    provider: Schema.Attribute.String;
    secondaryKeywords: Schema.Attribute.JSON;
    targetAudience: Schema.Attribute.String;
    toneOfVoice: Schema.Attribute.Enumeration<
      [
        'informational',
        'conversational',
        'professional',
        'playful',
        'urgent',
        'authoritative',
        'friendly',
        'luxury',
        'technical',
      ]
    > &
      Schema.Attribute.DefaultTo<'informational'>;
  };
}

export interface SharedBullet extends Struct.ComponentSchema {
  collectionName: 'components_shared_bullets';
  info: {
    displayName: 'bullet';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    description: 'Reusable CTA button';
    displayName: 'Button';
  };
  attributes: {
    ariaLabel: Schema.Attribute.String;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    newTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    size: Schema.Attribute.Enumeration<['sm', 'default', 'lg', 'icon']> &
      Schema.Attribute.DefaultTo<'default'>;
    variant: Schema.Attribute.Enumeration<
      ['default', 'secondary', 'outline', 'ghost', 'link']
    > &
      Schema.Attribute.DefaultTo<'default'>;
  };
}

export interface SharedCategory extends Struct.ComponentSchema {
  collectionName: 'components_shared_categories';
  info: {
    displayName: 'category';
  };
  attributes: {
    name: Schema.Attribute.String;
    slug: Schema.Attribute.String;
  };
}

export interface SharedContactInfo extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_infos';
  info: {
    displayName: 'contact-info';
  };
  attributes: {
    address: Schema.Attribute.Component<'shared.address', false>;
    email: Schema.Attribute.Email;
    openingHours: Schema.Attribute.Component<'shared.opening-hour', true>;
    phone: Schema.Attribute.String;
  };
}

export interface SharedContactMethod extends Struct.ComponentSchema {
  collectionName: 'components_shared_contact_methods';
  info: {
    displayName: 'Contact Method';
  };
  attributes: {
    href: Schema.Attribute.String;
    kind: Schema.Attribute.Enumeration<
      ['phone', 'email', 'whatsapp', 'fax', 'other']
    > &
      Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String;
  };
}

export interface SharedCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta';
  info: {
    displayName: 'cta';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedCtaLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_links';
  info: {
    displayName: 'cta-link';
  };
  attributes: {
    href: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface SharedDualCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_dual_ctas';
  info: {
    displayName: 'dual-cta';
  };
  attributes: {
    description: Schema.Attribute.Text;
    primaryButtonLink: Schema.Attribute.String;
    primaryButtonText: Schema.Attribute.String;
    secondaryButtonLink: Schema.Attribute.String;
    secondaryButtonText: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    displayName: 'feature';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Enumeration<
      [
        'ring',
        'quality',
        'heart',
        'consultation',
        'engraving',
        'design',
        'repair',
        'custom',
      ]
    >;
    title: Schema.Attribute.String;
  };
}

export interface SharedFormField extends Struct.ComponentSchema {
  collectionName: 'components_shared_form_fields';
  info: {
    displayName: 'form-field';
  };
  attributes: {
    label: Schema.Attribute.String;
    name: Schema.Attribute.String;
    options: Schema.Attribute.JSON;
    placeholder: Schema.Attribute.String;
    required: Schema.Attribute.Boolean;
    type: Schema.Attribute.Enumeration<
      ['text', 'email', 'tel', 'select', 'textarea']
    >;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedMetaSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_socials';
  info: {
    description: 'Individuelle Social/Open-Graph Metadaten pro Netzwerk';
    displayName: 'Meta Social';
    icon: 'share-alt';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    imageAlt: Schema.Attribute.String;
    socialNetwork: Schema.Attribute.Enumeration<
      [
        'facebook',
        'instagram',
        'linkedin',
        'pinterest',
        'twitter',
        'x',
        'whatsapp',
        'threads',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'facebook'>;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    displayName: 'Navigation Item';
  };
  attributes: {
    children: Schema.Attribute.Component<'shared.nav-subitem', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 0;
        },
        number
      >;
    href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavSubitem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_subitems';
  info: {
    displayName: 'Navigation Sub Item';
  };
  attributes: {
    children: Schema.Attribute.Component<'shared.nav-tertiary-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 0;
        },
        number
      >;
    href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavTertiaryItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_tertiary_items';
  info: {
    displayName: 'Navigation Tertiary Item';
  };
  attributes: {
    href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedOpeningHour extends Struct.ComponentSchema {
  collectionName: 'components_shared_opening_hours';
  info: {
    displayName: 'Opening Hour';
  };
  attributes: {
    close: Schema.Attribute.String;
    day: Schema.Attribute.Enumeration<
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    > &
      Schema.Attribute.Required;
    note: Schema.Attribute.String;
    open: Schema.Attribute.String;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedRichtextHtml extends Struct.ComponentSchema {
  collectionName: 'components_shared_richtext_htmls';
  info: {
    displayName: 'Richtext HTML';
  };
  attributes: {
    Text: Schema.Attribute.Blocks;
  };
}

export interface SharedRing extends Struct.ComponentSchema {
  collectionName: 'components_shared_rings';
  info: {
    displayName: 'ring';
  };
  attributes: {
    category: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'State-of-the-art Meta-, OG- und AI-Einstellungen';
    displayName: 'SEO Suite';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    aiAssistant: Schema.Attribute.Component<'shared.ai-seo', false>;
    canonicalUrl: Schema.Attribute.String;
    contentType: Schema.Attribute.Enumeration<
      [
        'website',
        'webpage',
        'article',
        'news',
        'event',
        'product',
        'faq',
        'custom',
      ]
    > &
      Schema.Attribute.DefaultTo<'webpage'>;
    extraMeta: Schema.Attribute.JSON;
    focusKeyword: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 165;
      }>;
    metaKeywords: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    metaLanguage: Schema.Attribute.String & Schema.Attribute.DefaultTo<'de-DE'>;
    metaRobots: Schema.Attribute.Enumeration<
      ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow']
    > &
      Schema.Attribute.DefaultTo<'index,follow'>;
    metaSocial: Schema.Attribute.Component<'shared.meta-social', true>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    metaViewport: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'width=device-width, initial-scale=1'>;
    ogDescription: Schema.Attribute.Text;
    ogLocale: Schema.Attribute.String & Schema.Attribute.DefaultTo<'de_DE'>;
    ogModifiedTime: Schema.Attribute.DateTime;
    ogPublishedTime: Schema.Attribute.DateTime;
    ogTitle: Schema.Attribute.String;
    ogType: Schema.Attribute.Enumeration<
      ['website', 'article', 'event', 'profile', 'product', 'book']
    > &
      Schema.Attribute.DefaultTo<'website'>;
    ogUrl: Schema.Attribute.String;
    schemaType: Schema.Attribute.Enumeration<
      [
        'WebPage',
        'Article',
        'NewsArticle',
        'BlogPosting',
        'Event',
        'Product',
        'FAQPage',
        'HowTo',
        'VideoObject',
        'Custom',
      ]
    > &
      Schema.Attribute.DefaultTo<'WebPage'>;
    shareImage: Schema.Attribute.Media<'images'>;
    shareImageAlt: Schema.Attribute.String;
    sitemapChangeFreq: Schema.Attribute.Enumeration<
      ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
    >;
    sitemapPriority: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      >;
    structuredData: Schema.Attribute.JSON;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image', 'player', 'app']
    > &
      Schema.Attribute.DefaultTo<'summary_large_image'>;
    twitterCreator: Schema.Attribute.String;
  };
}

export interface SharedService extends Struct.ComponentSchema {
  collectionName: 'components_shared_services';
  info: {
    displayName: 'service';
  };
  attributes: {
    description: Schema.Attribute.Text;
    features: Schema.Attribute.Component<'shared.bullet', true>;
    icon: Schema.Attribute.Enumeration<
      ['design', 'consultation', 'engraving', 'repair', 'custom']
    >;
    title: Schema.Attribute.String;
  };
}

export interface SharedSimpleLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_simple_links';
  info: {
    displayName: 'Simple Link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'social-link';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<
      ['facebook', 'instagram', 'pinterest', 'custom']
    >;
    name: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'stat';
  };
  attributes: {
    label: Schema.Attribute.String;
    number: Schema.Attribute.String;
  };
}

export interface SharedTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_shared_team_members';
  info: {
    displayName: 'team-member';
  };
  attributes: {
    initials: Schema.Attribute.String;
    name: Schema.Attribute.String;
    role: Schema.Attribute.String;
    teamimage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface SidebarAdBanner extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_ad_banners';
  info: {
    description: 'Wide promotional banner for topbar or sidebar placements';
    displayName: 'Ad Banner';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.button', false>;
    media: Schema.Attribute.Media<'images'>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SidebarAdSlider extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_ad_sliders';
  info: {
    description: 'Slider that cycles through promotional slides';
    displayName: 'Ad Slider';
  };
  attributes: {
    autoplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    autoplayInterval: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5>;
    headline: Schema.Attribute.String;
    slides: Schema.Attribute.Component<'sidebar.slide-item', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SidebarAdTile extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_ad_tiles';
  info: {
    description: 'Compact promotional tile component';
    displayName: 'Ad Tile';
  };
  attributes: {
    badge: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.button', false>;
    description: Schema.Attribute.Text;
    media: Schema.Attribute.Media<'images' | 'files'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SidebarEventBanner extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_event_banners';
  info: {
    description: 'Large banner featuring a selected event';
    displayName: 'Event Banner';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    cta: Schema.Attribute.Component<'shared.button', true>;
    event: Schema.Attribute.Relation<'oneToOne', 'api::event.event'>;
    kicker: Schema.Attribute.String;
    overlayColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'rgba(0,0,0,0.5)'>;
    titleOverride: Schema.Attribute.String;
  };
}

export interface SidebarEventList extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_event_lists';
  info: {
    description: 'Shows upcoming events in the sidebar';
    displayName: 'Event List';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta-link', false>;
    featuredOnly: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    includePast: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    showLocation: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showStartDate: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SidebarEventTile extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_event_tiles';
  info: {
    description: 'Highlights a selected event with key facts';
    displayName: 'Event Tile';
  };
  attributes: {
    badge: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.button', false>;
    event: Schema.Attribute.Relation<'oneToOne', 'api::event.event'>;
    showDates: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showLocation: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    summaryOverride: Schema.Attribute.Text;
    titleOverride: Schema.Attribute.String;
  };
}

export interface SidebarNewsBanner extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_news_banners';
  info: {
    description: 'Large banner featuring a selected news article';
    displayName: 'News Banner';
  };
  attributes: {
    article: Schema.Attribute.Relation<'oneToOne', 'api::article.article'>;
    backgroundImage: Schema.Attribute.Media<'images'>;
    cta: Schema.Attribute.Component<'shared.button', true>;
    kicker: Schema.Attribute.String;
    overlayColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'rgba(0,0,0,0.5)'>;
    titleOverride: Schema.Attribute.String;
  };
}

export interface SidebarNewsList extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_news_lists';
  info: {
    description: 'Automatically lists recent news/articles in the sidebar';
    displayName: 'News List';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.cta-link', false>;
    featuredOnly: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    showImages: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showPublicationDate: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showSummaries: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SidebarNewsTile extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_news_tiles';
  info: {
    description: 'Highlights a single selected news article';
    displayName: 'News Tile';
  };
  attributes: {
    article: Schema.Attribute.Relation<'oneToOne', 'api::article.article'>;
    badge: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.button', false>;
    showImage: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showPublicationDate: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    summaryOverride: Schema.Attribute.Text;
    titleOverride: Schema.Attribute.String;
  };
}

export interface SidebarRichtextTile extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_richtext_tiles';
  info: {
    description: 'Rich text advertising block with optional buttons';
    displayName: 'Richtext Tile';
  };
  attributes: {
    backgroundVariant: Schema.Attribute.Enumeration<
      ['default', 'muted', 'accent', 'contrast']
    > &
      Schema.Attribute.DefaultTo<'default'>;
    body: Schema.Attribute.RichText;
    buttons: Schema.Attribute.Component<'shared.button', true>;
    title: Schema.Attribute.String;
  };
}

export interface SidebarSlideItem extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_slide_items';
  info: {
    description: 'Single slide within a sidebar slider';
    displayName: 'Slide Item';
  };
  attributes: {
    cta: Schema.Attribute.Component<'shared.button', false>;
    description: Schema.Attribute.Text;
    media: Schema.Attribute.Media<'images' | 'videos' | 'files'>;
    title: Schema.Attribute.String;
  };
}

export interface SidebarTopbarImage extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_topbar_images';
  info: {
    description: 'Minimal topbar variant that renders only an image';
    displayName: 'Topbar Image';
  };
  attributes: {
    altText: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SidebarTopbarOverlay extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_topbar_overlays';
  info: {
    description: 'Full-width topbar banner with background image and overlay';
    displayName: 'Topbar Overlay Banner';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    badge: Schema.Attribute.String;
    buttons: Schema.Attribute.Component<'shared.button', true>;
    description: Schema.Attribute.Text;
    overlayColor: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'rgba(0,0,0,0.5)'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.about': BlocksAbout;
      'blocks.article-grid': BlocksArticleGrid;
      'blocks.button-group': BlocksButtonGroup;
      'blocks.card-grid': BlocksCardGrid;
      'blocks.card-item': BlocksCardItem;
      'blocks.contact': BlocksContact;
      'blocks.cta': BlocksCta;
      'blocks.event-grid': BlocksEventGrid;
      'blocks.event-list': BlocksEventList;
      'blocks.gallery': BlocksGallery;
      'blocks.hero': BlocksHero;
      'blocks.image': BlocksImage;
      'blocks.media-text': BlocksMediaText;
      'blocks.news-list': BlocksNewsList;
      'blocks.pricing-feature': BlocksPricingFeature;
      'blocks.pricing-plan': BlocksPricingPlan;
      'blocks.pricing-table': BlocksPricingTable;
      'blocks.product-slider': BlocksProductSlider;
      'blocks.quote': BlocksQuote;
      'blocks.richtext-column': BlocksRichtextColumn;
      'blocks.richtext-columns': BlocksRichtextColumns;
      'blocks.services': BlocksServices;
      'blocks.space': BlocksSpace;
      'blocks.step-item': BlocksStepItem;
      'blocks.steps': BlocksSteps;
      'blocks.text': BlocksText;
      'shared.address': SharedAddress;
      'shared.ai-seo': SharedAiSeo;
      'shared.bullet': SharedBullet;
      'shared.button': SharedButton;
      'shared.category': SharedCategory;
      'shared.contact-info': SharedContactInfo;
      'shared.contact-method': SharedContactMethod;
      'shared.cta': SharedCta;
      'shared.cta-link': SharedCtaLink;
      'shared.dual-cta': SharedDualCta;
      'shared.feature': SharedFeature;
      'shared.form-field': SharedFormField;
      'shared.media': SharedMedia;
      'shared.meta-social': SharedMetaSocial;
      'shared.nav-item': SharedNavItem;
      'shared.nav-subitem': SharedNavSubitem;
      'shared.nav-tertiary-item': SharedNavTertiaryItem;
      'shared.opening-hour': SharedOpeningHour;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.richtext-html': SharedRichtextHtml;
      'shared.ring': SharedRing;
      'shared.seo': SharedSeo;
      'shared.service': SharedService;
      'shared.simple-link': SharedSimpleLink;
      'shared.slider': SharedSlider;
      'shared.social-link': SharedSocialLink;
      'shared.stat': SharedStat;
      'shared.team-member': SharedTeamMember;
      'sidebar.ad-banner': SidebarAdBanner;
      'sidebar.ad-slider': SidebarAdSlider;
      'sidebar.ad-tile': SidebarAdTile;
      'sidebar.event-banner': SidebarEventBanner;
      'sidebar.event-list': SidebarEventList;
      'sidebar.event-tile': SidebarEventTile;
      'sidebar.news-banner': SidebarNewsBanner;
      'sidebar.news-list': SidebarNewsList;
      'sidebar.news-tile': SidebarNewsTile;
      'sidebar.richtext-tile': SidebarRichtextTile;
      'sidebar.slide-item': SidebarSlideItem;
      'sidebar.topbar-image': SidebarTopbarImage;
      'sidebar.topbar-overlay': SidebarTopbarOverlay;
    }
  }
}
