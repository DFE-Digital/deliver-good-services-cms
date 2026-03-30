import type { Schema, Struct } from '@strapi/strapi';

export interface CollectionDetailedGuidePageRef extends Struct.ComponentSchema {
  collectionName: 'components_collection_detailed_guide_page_refs';
  info: {
    description: 'One detailed guide page in a section';
    displayName: 'Detailed guide page ref';
  };
  attributes: {
    detailed_guide_page: Schema.Attribute.Relation<
      'manyToOne',
      'api::detailed-guide-page.detailed-guide-page'
    >;
  };
}

export interface CollectionDetailedGuideRef extends Struct.ComponentSchema {
  collectionName: 'components_collection_detailed_guide_refs';
  info: {
    description: 'One detailed guide in a section';
    displayName: 'Detailed guide ref';
  };
  attributes: {
    detailed_guide: Schema.Attribute.Relation<
      'manyToOne',
      'api::detailed-guide.detailed-guide'
    >;
  };
}

export interface CollectionExternalLinkRef extends Struct.ComponentSchema {
  collectionName: 'components_collection_external_link_refs';
  info: {
    description: 'One external link in a section';
    displayName: 'External link ref';
  };
  attributes: {
    external_link: Schema.Attribute.Relation<
      'manyToOne',
      'api::external-link.external-link'
    >;
  };
}

export interface CollectionJobFamily extends Struct.ComponentSchema {
  collectionName: 'components_collection_job_families';
  info: {
    displayName: 'job_family';
  };
  attributes: {
    job_specifications: Schema.Attribute.Relation<
      'oneToMany',
      'api::job-specification.job-specification'
    >;
  };
}

export interface CollectionSection extends Struct.ComponentSchema {
  collectionName: 'components_collection_sections';
  info: {
    description: 'One section in a collection: title, description, and links (detailed guide, external links)';
    displayName: 'Section';
  };
  attributes: {
    description: Schema.Attribute.Text;
    detailed_guide_pages: Schema.Attribute.Component<
      'collection.detailed-guide-page-ref',
      true
    >;
    detailed_guides: Schema.Attribute.Component<
      'collection.detailed-guide-ref',
      true
    >;
    external_links: Schema.Attribute.Component<
      'collection.external-link-ref',
      true
    >;
    job_descriptions: Schema.Attribute.Component<'collection.job-family', true>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContentContentSection extends Struct.ComponentSchema {
  collectionName: 'components_content_content_sections';
  info: {
    displayName: 'content section';
  };
  attributes: {
    detailed_guides: Schema.Attribute.Relation<
      'oneToMany',
      'api::detailed-guide.detailed-guide'
    >;
  };
}

export interface ContentRelatedContent extends Struct.ComponentSchema {
  collectionName: 'components_content_related_contents';
  info: {
    displayName: 'Related content';
  };
  attributes: {
    Content: Schema.Attribute.RichText;
    Header: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContentUserNeed extends Struct.ComponentSchema {
  collectionName: 'components_content_user_needs';
  info: {
    displayName: 'User need';
    icon: 'user';
  };
  attributes: {
    as_a: Schema.Attribute.String & Schema.Attribute.Required;
    i_need: Schema.Attribute.Text;
    so_that: Schema.Attribute.Text;
    validated: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface LifecycleHubSection extends Struct.ComponentSchema {
  collectionName: 'components_lifecycle_hub_sections';
  info: {
    description: 'Repeatable content section on the lifecycle hub (intro, key messages)';
    displayName: 'Lifecycle hub section';
  };
  attributes: {
    body: Schema.Attribute.RichText;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LifecycleProfessionSidebarLink extends Struct.ComponentSchema {
  collectionName: 'components_lifecycle_profession_sidebar_links';
  info: {
    description: "Link for the lifecycle hub 'DDaT professions' sidebar";
    displayName: 'DDaT profession sidebar link';
  };
  attributes: {
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LifecycleRelatedGuidanceLink extends Struct.ComponentSchema {
  collectionName: 'components_lifecycle_related_guidance_links';
  info: {
    description: "Link for the lifecycle hub 'Related guidance' sidebar (e.g. Service Standard, Delivery checklist)";
    displayName: 'Related guidance link';
  };
  attributes: {
    external_link: Schema.Attribute.Relation<
      'manyToOne',
      'api::external-link.external-link'
    >;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface PhasePhaseActivity extends Struct.ComponentSchema {
  collectionName: 'components_phase_phase_activities';
  info: {
    description: 'Task/activity in a phase with profession tags, track, guidance and resources';
    displayName: 'Phase activity';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    guidanceContent: Schema.Attribute.RichText;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    professionTags: Schema.Attribute.Relation<
      'manyToMany',
      'api::tags-profession.tags-profession'
    >;
    related_content: Schema.Attribute.Relation<
      'manyToMany',
      'api::detailed-guide.detailed-guide'
    >;
    resources: Schema.Attribute.Component<
      'phase.phase-activity-resource',
      true
    >;
    shortDescription: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    trackTag: Schema.Attribute.Relation<
      'manyToOne',
      'api::tags-track.tags-track'
    >;
  };
}

export interface PhasePhaseActivityResource extends Struct.ComponentSchema {
  collectionName: 'components_phase_phase_activity_resources';
  info: {
    description: 'Download, artefact, template, case study or link for a lifecycle task';
    displayName: 'Phase activity resource';
  };
  attributes: {
    description: Schema.Attribute.Text;
    media: Schema.Attribute.Media<'files'>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    resourceType: Schema.Attribute.Enumeration<
      ['download', 'artefact', 'template', 'case_study', 'link']
    > &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface PhasePhaseAssurance extends Struct.ComponentSchema {
  collectionName: 'components_phase_phase_assurances';
  info: {
    description: 'Assurance and governance for the phase';
    displayName: 'Phase assurance';
  };
  attributes: {
    assurance_type: Schema.Attribute.Enumeration<
      ['Peer review', 'Service assessment', 'None']
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.RichText;
    governance_body: Schema.Attribute.String;
    preparation_guidance: Schema.Attribute.Relation<
      'manyToOne',
      'api::detailed-guide.detailed-guide'
    >;
  };
}

export interface PhasePhaseOutput extends Struct.ComponentSchema {
  collectionName: 'components_phase_phase_outputs';
  info: {
    description: 'Output or artefact with optional template link';
    displayName: 'Phase output';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    is_mandatory: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    output_name: Schema.Attribute.String & Schema.Attribute.Required;
    template_link: Schema.Attribute.Relation<
      'manyToOne',
      'api::detailed-guide.detailed-guide'
    >;
  };
}

export interface PhasePhaseRequirement extends Struct.ComponentSchema {
  collectionName: 'components_phase_phase_requirements';
  info: {
    description: 'Mandatory requirement with evidence and optional linked standard';
    displayName: 'Phase requirement';
  };
  attributes: {
    description: Schema.Attribute.RichText & Schema.Attribute.Required;
    evidence_examples: Schema.Attribute.RichText;
    related_standard: Schema.Attribute.Relation<
      'manyToOne',
      'api::standard.standard'
    >;
    requirement_title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface PhaseRelatedLink extends Struct.ComponentSchema {
  collectionName: 'components_phase_related_links';
  info: {
    description: 'External link for phase related guidance, standards, tools or training';
    displayName: 'Phase related link';
  };
  attributes: {
    external_link: Schema.Attribute.Relation<
      'manyToOne',
      'api::external-link.external-link'
    >;
  };
}

export interface ProfessionGroup extends Struct.ComponentSchema {
  collectionName: 'components_profession_groups';
  info: {
    displayName: 'Group';
  };
  attributes: {
    profession: Schema.Attribute.Enumeration<
      [
        'Accessibility specialists',
        'Analytics engineers',
        'Application operations engineers',
        'Architects',
        'Business analysts',
        'Business architects',
        'Business relationship managers',
        'Change and release managers',
        'Chief data officers',
        'Chief digital and information officers',
        'Chief information security officers',
        'Chief technology officers',
        'Command and control centre managers',
        'Content designers',
        'Content strategists',
        'Data analysts',
        'Data architects',
        'Data engineers',
        'Data ethicists',
        'Data governance managers',
        'Data scientists',
        'Delivery managers',
        'Development operations engineers',
        'Digital evaluators',
        'Digital portfolio managers',
        'End user computing engineers',
        'Enterprise architects',
        'Frontend developers',
        'Graphic designers',
        'Incident managers',
        'Infrastructure engineers',
        'Infrastructure operations engineers',
        'Interaction designers',
        'IT service managers',
        'Machine learning engineers',
        'Network architects',
        'Performance analysts',
        'Problem managers',
        'Product managers',
        'Programme delivery managers',
        'Quality assurance test analysts',
        'Security architects',
        'Service desk managers',
        'Service designers',
        'Service owners',
        'Service transition managers',
        'Software developers',
        'Solution architects',
        'Technical architects',
        'Technical writers',
        'Test engineers',
        'Test managers',
        'User researchers',
      ]
    >;
  };
}

export interface SharedLinkCard extends Struct.ComponentSchema {
  collectionName: 'components_shared_link_cards';
  info: {
    description: 'Card-style link (e.g. for Lucid resources) with label, description, url, icon, bg colour';
    displayName: 'Link card';
  };
  attributes: {
    bgColourHex: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLinkItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_link_items';
  info: {
    description: 'Single link with label, url, optional source and new-tab flag';
    displayName: 'Link item';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    opensInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    sourceLabel: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface TaskHowStep extends Struct.ComponentSchema {
  collectionName: 'components_task_how_steps';
  info: {
    description: 'Single step in the How section of a task';
    displayName: 'How step';
  };
  attributes: {
    stepText: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface ToolTools extends Struct.ComponentSchema {
  collectionName: 'components_tool_tools';
  info: {
    displayName: 'Tools';
    icon: 'cog';
  };
  attributes: {
    description: Schema.Attribute.Text;
    internalOnly: Schema.Attribute.Boolean;
    openInNewTab: Schema.Attribute.Boolean;
    title: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'collection.detailed-guide-page-ref': CollectionDetailedGuidePageRef;
      'collection.detailed-guide-ref': CollectionDetailedGuideRef;
      'collection.external-link-ref': CollectionExternalLinkRef;
      'collection.job-family': CollectionJobFamily;
      'collection.section': CollectionSection;
      'content.content-section': ContentContentSection;
      'content.related-content': ContentRelatedContent;
      'content.user-need': ContentUserNeed;
      'lifecycle.hub-section': LifecycleHubSection;
      'lifecycle.profession-sidebar-link': LifecycleProfessionSidebarLink;
      'lifecycle.related-guidance-link': LifecycleRelatedGuidanceLink;
      'phase.phase-activity': PhasePhaseActivity;
      'phase.phase-activity-resource': PhasePhaseActivityResource;
      'phase.phase-assurance': PhasePhaseAssurance;
      'phase.phase-output': PhasePhaseOutput;
      'phase.phase-requirement': PhasePhaseRequirement;
      'phase.related-link': PhaseRelatedLink;
      'profession.group': ProfessionGroup;
      'shared.link-card': SharedLinkCard;
      'shared.link-item': SharedLinkItem;
      'task.how-step': TaskHowStep;
      'tool.tools': ToolTools;
    }
  }
}
