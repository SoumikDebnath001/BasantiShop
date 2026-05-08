export declare const homepageService: {
    get(): Promise<{
        id: string;
        updatedAt: Date;
        heroHeadline: string;
        heroSubtext: string;
        heroCta: string;
        announcementBanner: string | null;
        announcementEnabled: boolean;
        aboutTitle: string;
        aboutText: string;
    }>;
    update(data: {
        heroHeadline?: string;
        heroSubtext?: string;
        heroCta?: string;
        announcementBanner?: string | null;
        announcementEnabled?: boolean;
        aboutTitle?: string;
        aboutText?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        heroHeadline: string;
        heroSubtext: string;
        heroCta: string;
        announcementBanner: string | null;
        announcementEnabled: boolean;
        aboutTitle: string;
        aboutText: string;
    }>;
};
//# sourceMappingURL=homepage.service.d.ts.map