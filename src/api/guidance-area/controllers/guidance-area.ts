/**
 * guidance-area controller
 */

import { factories } from '@strapi/strapi';

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

type RawCollectionProfessionRef = {
	slug?: string;
	applicableProfessions?: RawTag[];
};

type RawPlacement = {
	order?: number;
	featured?: boolean;
	cardDescriptionOverride?: string;
	collection?: RawCollection;
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

export default factories.createCoreController('api::guidance-area.guidance-area', ({ strapi }) => ({
	async findIndex(ctx) {
		const areas = (await strapi.documents('api::guidance-area.guidance-area').findMany({
			status: 'published',
			filters: { isActive: { $ne: false } },
			populate: {
				featuredProfessions: {
					fields: ['title', 'slug', 'plural'],
				},
				guidance_area_collections: {
					populate: {
						collection: {
							fields: ['title', 'slug', 'metaDescription'],
							populate: {
								applicableProfessions: {
									fields: ['title', 'slug', 'plural'],
								},
								sections: {
									populate: [
										'detailed_guides',
										'detailed_guide_pages',
										'external_links',
										'job_descriptions',
										'job_descriptions.job_specifications',
									] as const,
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
				status: 'published',
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

		const collectionAreas = new Map<string, Array<{ title: string; slug: string }>>();
		for (const area of sortedAreas) {
			for (const placement of area.guidance_area_collections ?? []) {
				const collection = placement.collection;
				const slug = collection?.slug?.trim();
				const title = area.name?.trim();
				const areaSlug = area.slug?.trim();
				if (!slug || !title || !areaSlug) continue;

				const existing = collectionAreas.get(slug) ?? [];
				existing.push({ title, slug: areaSlug });
				collectionAreas.set(slug, existing);
			}
		}

		const data = sortedAreas.map((area) => {
			const placements = [...(area.guidance_area_collections ?? [])]
				.filter((placement) => placement.collection?.slug && placement.collection?.title)
				.sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

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
				collections: placements.map((placement) => {
					const collection = placement.collection as RawCollection;
					const slug = collection.slug ?? '';
					const alsoInAreas = (collectionAreas.get(slug) ?? []).filter((otherArea) => otherArea.slug !== area.slug);
					const applicableProfessions =
						(collection.applicableProfessions ?? []).length > 0
							? (collection.applicableProfessions ?? [])
							: (collectionProfessionLookup.get(slug) ?? []);

					return {
						title: collection.title ?? '',
						slug,
						description: placement.cardDescriptionOverride?.trim() || (collection.metaDescription ?? ''),
						itemCount: countCollectionItems(collection.sections),
						featured: placement.featured ?? false,
						tags: deriveCollectionTags(collection.sections),
						applicableProfessions: applicableProfessions.map((profession) => ({
							title: profession.title ?? '',
							slug: profession.slug ?? '',
							plural: profession.plural ?? null,
						})),
						alsoInAreas,
					};
				}),
			};
		});

		ctx.body = { data };
	},
}));
