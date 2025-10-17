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
    getPublicMenuUrl: (menuId: string) => `https://querox.me/menu-public?menu_id=${menuId}`,
    
    // Génère l'URL publique d'un site web
    getPublicWebsiteUrl: (slug: string) => `https://querox.me/w/${slug}`,
    
    // Génère le sous-domaine d'un restaurant
    getSubdomain: (slug: string) => `${slug}.querox.me`,
  },
  
  // Contact
  contact: {
    email: 'contact@querox.me',
    phone: '+33 1 23 45 67 89',
  },
  
  // Limites
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxImageWidth: 2000,
    maxImageHeight: 2000,
  },
} as const;
