/**
 * Configuration centralisée de l'application
 * Ce fichier contient toutes les constantes et URLs de l'application
 */

export const APP_CONFIG = {
  // Domaines
  domains: {
    main: 'querox.me',
    publicMenu: 'querox.me/menu',
    publicWebsite: 'querox.me/w',
  },
  
  // URLs
  urls: {
    // Génère l'URL publique d'un menu
    getPublicMenuUrl: (menuId: string) => `https://querox.me/menu/${menuId}`,
    
    // Génère l'URL publique d'un site web
    getPublicWebsiteUrl: (slug: string) => `https://querox.me/w/${slug}`,
    
    // Génère le sous-domaine d'un restaurant
    getSubdomain: (slug: string) => `${slug}.querox.me`,
  },
  
  // Images par défaut
  images: {
    defaultMenuItem: '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png',
    defaultLogo: '/lovable-uploads/logo-querox.png',
    defaultAvatar: '/lovable-uploads/a3efddc0-fd23-4923-9d99-aca95a7a152a.png',
    fallbackPlaceholder: '/lovable-uploads/a2262c2b-4c9e-4359-bc71-081861dfbd12.png',
  },
  
  // Contact
  contact: {
    email: 'contact@querox.me',
    phone: '+242 05 010 3710',
    whatsapp: '+242 05 010 3710',
  },
  
  // Limites
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxImageWidth: 2000,
    maxImageHeight: 2000,
  },
} as const;
