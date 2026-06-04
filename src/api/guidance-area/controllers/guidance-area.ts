/**
 * guidance-area controller
 */

import { factories } from '@strapi/strapi';
import { documentServicePublishedSlice } from '../../../utils/document-query-status';

type RawTag = {
	title?: string;
	slug?: string;
	plural?: string;
};

type RawSection = {
	detailed_guides?: unknown[];
	detailed_guide_pages?: unknown[];
	external_links?: unknown[];
	job_descriptions?: Array<{ job_specifications?: unknown[] }>;
};

type RawCollection = {
	title?: string;
	slug?: string;
	metaDescription?: string;
	documentId?: string;
	applicableProfessions?: RawTag[];
	sections?: RawSection[];
};

type RawDetailedGuide = {
	title?: string;
	slug?: string;
	metaDescription?: string;
	applicableProfessions?: RawTag[];
	detailed_guide_pages?: unknown[];
};

type RawCollectionProfessionRef = {
	slug?: string;
	applicableProfessions?: RawTag[];
};

type RawPlacement = {
	order?: number;
	featured?: boolean;
	cardDescriptionOverride?: string;
	collection?: RawCollection;
	detailedGuide?: RawDetailedGuide;
};

type RawArea = {
	name?: string;
	slug?: string;
	summary?: string;
	description?: string;
	colourHex?: string;
	order?: number;
	featuredProfessions?: RawTag[];
	guidance_area_collections?: RawPlacement[];
	/** Strapi 5 / API may camelCase the repeatable component field name. */
	guidanceAreaCollections?: RawPlacement[];
};

function normaliseHex(value: string | undefined): string {
	const trimmed = (value ?? '').trim();
	if (!trimmed) return '#1d70b8';
	return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function countCollectionItems(sections: RawSection[] | undefined): number {
	return (sections ?? []).reduce((total, section) => {
		const jobSpecs = (section.job_descriptions ?? []).reduce(
			(jobTotal, family) => jobTotal + (family.job_specifications?.length ?? 0),
			0
		);

		return (
			total +
			(section.detailed_guides?.length ?? 0) +
			(section.detailed_guide_pages?.length ?? 0) +
			(section.external_links?.length ?? 0) +
			jobSpecs
		);
	}, 0);
}

function deriveCollectionTags(sections: RawSection[] | undefined): string[] {
	const tags = new Set<string>();

	for (const section of sections ?? []) {
		if ((section.detailed_guides?.length ?? 0) > 0 || (section.detailed_guide_pages?.length ?? 0) > 0) {
			tags.add('Guides');
		}
		if ((section.external_links?.length ?? 0) > 0) {
			tags.add('Resources');
		}
		const jobSpecs = (section.job_descriptions ?? []).some((family) => (family.job_specifications?.length ?? 0) > 0);
		if (jobSpecs) {
			tags.add('Job descriptions');
		}
	}

	return [...tags];
}

function contentKey(contentType: string, slug: string): string {
	return `${contentType}:${slug}`.toLowerCase();
}

/** Repeatable placements: schema uid vs Strapi JSON keys differ by version / formatter. */
function areaPlacements(area: RawArea): RawPlacement[] {
	const raw = area.guidance_area_collections ?? area.guidanceAreaCollections;
	return Array.isArray(raw) ? raw : [];
}

/** Relation keys on each placement may be camelCase or snake_case. */
function placementCollection(p: RawPlacement): RawCollection | undefined {
	const q = p as Record<string, unknown>;
	const c = q.collection ?? q.Collection;
	return (c ?? undefined) as RawCollection | undefined;
}

function placementDetailedGuide(p: RawPlacement): RawDetailedGuide | undefined {
	const q = p as Record<string, unknown>;
	const g = q.detailedGuide ?? q.detailed_guide;
	return (g ?? undefined) as RawDetailedGuide | undefined;
}

/** Collection type may expose repeatable sections under different API keys. */
function collectionSectionList(c: RawCollection): RawSection[] | undefined {
	const q = c as Record<string, unknown>;
	const s = q.sections ?? q.collection_sections ?? q.collectionSections;
	return Array.isArray(s) ? (s as RawSection[]) : undefined;
}

export default factories.createCoreController('api::guidance-area.guidance-area', ({ strapi }) => ({
	async findIndex(ctx) {
		const areas = (await strapi.documents('api::guidance-area.guidance-area').findMany({
			...documentServicePublishedSlice(ctx),
			filters: { isActive: { $ne: false } },
			populate: {
				featuredProfessions: {
					fields: ['title', 'slug', 'plural'],
				},
				guidance_area_collections: {
					populate: {
						// Same draft vs published as the parent query so placements resolve draft collections/guides in preview.
						collection: {
							...documentServicePublishedSlice(ctx),
							fields: ['title', 'slug', 'metaDescription'],
							populate: {
								applicableProfessions: {
									fields: ['title', 'slug', 'plural'],
								},
								// Same dot-path populate as collection controller so join rows + relation targets resolve (draft-only guides/pages count).
								sections: {
									populate: [
										'detailed_guides',
										'detailed_guides.detailed_guide',
										'detailed_guide_pages',
										'detailed_guide_pages.detailed_guide_page',
										'detailed_guide_pages.detailed_guide_page.detailed_guide',
										'external_links',
										'external_links.external_link',
										'job_descriptions',
										'job_descriptions.job_specifications',
									] as const,
								},
							},
						},
						detailedGuide: {
							...documentServicePublishedSlice(ctx),
							fields: ['title', 'slug', 'metaDescription'],
							populate: {
								applicableProfessions: {
									fields: ['title', 'slug', 'plural'],
								},
								detailed_guide_pages: {
									...documentServicePublishedSlice(ctx),
									fields: ['slug'],
								},
							},
						},
					},
				},
			},
		})) as RawArea[];

		const collectionProfessionRefs = (await strapi
			.documents('api::collection.collection')
			.findMany({
				...documentServicePublishedSlice(ctx),
				fields: ['slug'],
				populate: {
					applicableProfessions: {
						fields: ['title', 'slug', 'plural'],
					},
				},
			})) as RawCollectionProfessionRef[];

		const collectionProfessionLookup = new Map<string, RawTag[]>();
		for (const ref of collectionProfessionRefs) {
			const slug = ref.slug?.trim();
			if (!slug) continue;
			collectionProfessionLookup.set(slug, ref.applicableProfessions ?? []);
		}

		const sortedAreas = [...areas].sort(
			(left, right) => (left.order ?? 0) - (right.order ?? 0) || (left.name ?? '').localeCompare(right.name ?? '')
		);

		const contentAreas = new Map<string, Array<{ title: string; slug: string }>>();
		for (const area of sortedAreas) {
			for (const placement of areaPlacements(area)) {
				const title = area.name?.trim();
				const areaSlug = area.slug?.trim();
				if (!title || !areaSlug) continue;

				const collectionSlug = placementCollection(placement)?.slug?.trim();
				if (collectionSlug) {
					const key = contentKey('collection', collectionSlug);
					const existing = contentAreas.get(key) ?? [];
					existing.push({ title, slug: areaSlug });
					contentAreas.set(key, existing);
				}

				const guideSlug = placementDetailedGuide(placement)?.slug?.trim();
				if (guideSlug) {
					const key = contentKey('detailed_guide', guideSlug);
					const existing = contentAreas.get(key) ?? [];
					existing.push({ title, slug: areaSlug });
					contentAreas.set(key, existing);
				}
			}
		}

		const data = sortedAreas.map((area) => {
			const placements = [...areaPlacements(area)].sort(
				(left, right) => (left.order ?? 0) - (right.order ?? 0),
			);

			const cards = placements.flatMap((placement) => {
				const items: Array<Record<string, unknown>> = [];

				const collection = placementCollection(placement);
				if (collection?.slug && collection.title) {
					const slug = collection.slug;
					const key = contentKey('collection', slug);
					const alsoInAreas = (contentAreas.get(key) ?? []).filter((otherArea) => otherArea.slug !== area.slug);
					const applicableProfessions =
						(collection.applicableProfessions ?? []).length > 0
							? (collection.applicableProfessions ?? [])
							: (collectionProfessionLookup.get(slug) ?? []);

					items.push({
						title: collection.title ?? '',
						slug,
						url: `/guidance/collections/${slug}`,
						contentType: 'Collection',
						description: placement.cardDescriptionOverride?.trim() || (collection.metaDescription ?? ''),
						itemCount: countCollectionItems(collectionSectionList(collection)),
						featured: placement.featured ?? false,
						tags: deriveCollectionTags(collectionSectionList(collection)),
						applicableProfessions: applicableProfessions.map((profession) => ({
							title: profession.title ?? '',
							slug: profession.slug ?? '',
							plural: profession.plural ?? null,
						})),
						alsoInAreas,
					});
				}

				const detailedGuide = placementDetailedGuide(placement);
				if (detailedGuide?.slug && detailedGuide.title) {
					const slug = detailedGuide.slug;
					const key = contentKey('detailed_guide', slug);
					const alsoInAreas = (contentAreas.get(key) ?? []).filter((otherArea) => otherArea.slug !== area.slug);

					items.push({
						title: detailedGuide.title ?? '',
						slug,
						url: `/guidance/guides/${slug}`,
						contentType: 'Detailed guide',
						description: placement.cardDescriptionOverride?.trim() || (detailedGuide.metaDescription ?? ''),
						itemCount: Math.max(1, (detailedGuide.detailed_guide_pages?.length ?? 0) + 1),
						featured: placement.featured ?? false,
						tags: ['Guidance'],
						applicableProfessions: (detailedGuide.applicableProfessions ?? []).map((profession) => ({
							title: profession.title ?? '',
							slug: profession.slug ?? '',
							plural: profession.plural ?? null,
						})),
						alsoInAreas,
					});
				}

				return items;
			});

			return {
				name: area.name ?? '',
				slug: area.slug ?? '',
				summary: area.summary ?? null,
				description: area.description ?? null,
				colourHex: normaliseHex(area.colourHex),
				featuredProfessions: (area.featuredProfessions ?? []).map((profession) => ({
					title: profession.title ?? '',
					slug: profession.slug ?? '',
					plural: profession.plural ?? null,
				})),
				collections: cards,
			};
		});

		ctx.body = { data };
	},
}));
