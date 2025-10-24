/**
 * Retourne l'image par défaut selon la catégorie du plat
 */
export function getCategoryDefaultImage(categoryName: string | undefined): string {
  if (!categoryName) return '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png';
  
  const category = categoryName.toLowerCase();
  
  // Entrées et Apéritifs
  if (category.includes('entrée') || category.includes('apéritif') || 
      category.includes('amuse') || category.includes('tapas') || 
      category.includes('mezzé') || category.includes('antipasti')) {
    return '/lovable-uploads/category-entrees.jpg';
  }
  
  // Viandes
  if (category.includes('viande') || category.includes('grillade') || 
      category.includes('volaille') || category.includes('gibier')) {
    return '/lovable-uploads/category-viandes.jpg';
  }
  
  // Poissons et fruits de mer
  if (category.includes('poisson') || category.includes('fruit de mer') || 
      category.includes('sushi') || category.includes('sashimi')) {
    return '/lovable-uploads/category-poissons.jpg';
  }
  
  // Pâtes et Pizzas
  if (category.includes('pâte') || category.includes('pizza') || 
      category.includes('risotto') || category.includes('calzone')) {
    return '/lovable-uploads/category-pates.jpg';
  }
  
  // Burgers et Sandwichs
  if (category.includes('burger') || category.includes('sandwich') || 
      category.includes('wrap') || category.includes('hot-dog')) {
    return '/lovable-uploads/category-burgers.jpg';
  }
  
  // Tacos et spécialités mexicaines
  if (category.includes('taco') || category.includes('quesadilla') || 
      category.includes('fajita')) {
    return '/lovable-uploads/category-tacos.jpg';
  }
  
  // Soupes et Salades
  if (category.includes('soupe') || category.includes('potage') || 
      category.includes('bouillon') || category.includes('salade') || 
      category.includes('bowl') || category.includes('poke')) {
    return '/lovable-uploads/category-salades.jpg';
  }
  
  // Desserts
  if (category.includes('dessert') || category.includes('pâtisserie') || 
      category.includes('gâteau') || category.includes('tarte') || 
      category.includes('crêpe') || category.includes('gaufre') || 
      category.includes('glace') || category.includes('sorbet') || 
      category.includes('mousse') || category.includes('crème')) {
    return '/lovable-uploads/category-desserts.jpg';
  }
  
  // Boissons chaudes
  if (category.includes('café') || category.includes('thé') || 
      category.includes('infusion') || category.includes('chocolat chaud') || 
      category.includes('boisson chaude')) {
    return '/lovable-uploads/category-boissons-chaudes.jpg';
  }
  
  // Boissons froides non alcoolisées
  if (category.includes('jus') || category.includes('smoothie') || 
      category.includes('milkshake') || category.includes('soda') || 
      category.includes('boisson froide')) {
    return '/lovable-uploads/category-boissons-froides.jpg';
  }
  
  // Vins
  if (category.includes('vin') || category.includes('champagne')) {
    return '/lovable-uploads/category-vins.jpg';
  }
  
  // Bières
  if (category.includes('bière')) {
    return '/lovable-uploads/category-bieres.jpg';
  }
  
  // Cocktails
  if (category.includes('cocktail') || category.includes('mocktail')) {
    return '/lovable-uploads/category-cocktails.jpg';
  }
  
  // Spiritueux
  if (category.includes('whisky') || category.includes('rhum') || 
      category.includes('vodka') || category.includes('gin') || 
      category.includes('tequila') || category.includes('cognac') || 
      category.includes('cognacs') || category.includes('spiritueux') || 
      category.includes('digestif')) {
    return '/lovable-uploads/category-spiritueux.jpg';
  }
  
  // Vermouth et Verre
  if (category.includes('vermouth') || category.includes('verre')) {
    return '/lovable-uploads/category-verres.jpg';
  }
  
  // Fromages
  if (category.includes('fromage') || category.includes('fondue') || 
      category.includes('raclette')) {
    return '/lovable-uploads/category-fromages.jpg';
  }
  
  // Par défaut
  return '/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png';
}
