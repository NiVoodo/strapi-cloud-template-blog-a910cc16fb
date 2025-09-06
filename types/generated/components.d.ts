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
    backgroundImage: Schema.Attribute.Media;
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
    displayName: 'address';
  };
  attributes: {
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    postalCode: Schema.Attribute.String;
    street: Schema.Attribute.String;
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

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    displayName: 'nav-item';
  };
  attributes: {
    href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean;
    label: Schema.Attribute.String;
  };
}

export interface SharedOpeningHour extends Struct.ComponentSchema {
  collectionName: 'components_shared_opening_hours';
  info: {
    displayName: 'opening-hour';
  };
  attributes: {
    day: Schema.Attribute.String;
    hours: Schema.Attribute.String;
    isClosed: Schema.Attribute.Boolean;
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
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
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
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.about': BlocksAbout;
      'blocks.contact': BlocksContact;
      'blocks.cta': BlocksCta;
      'blocks.gallery': BlocksGallery;
      'blocks.hero': BlocksHero;
      'blocks.image': BlocksImage;
      'blocks.quote': BlocksQuote;
      'blocks.services': BlocksServices;
      'blocks.text': BlocksText;
      'shared.address': SharedAddress;
      'shared.bullet': SharedBullet;
      'shared.category': SharedCategory;
      'shared.contact-info': SharedContactInfo;
      'shared.cta': SharedCta;
      'shared.cta-link': SharedCtaLink;
      'shared.dual-cta': SharedDualCta;
      'shared.feature': SharedFeature;
      'shared.form-field': SharedFormField;
      'shared.media': SharedMedia;
      'shared.nav-item': SharedNavItem;
      'shared.opening-hour': SharedOpeningHour;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.ring': SharedRing;
      'shared.seo': SharedSeo;
      'shared.service': SharedService;
      'shared.slider': SharedSlider;
      'shared.social-link': SharedSocialLink;
      'shared.stat': SharedStat;
      'shared.team-member': SharedTeamMember;
    }
  }
}
