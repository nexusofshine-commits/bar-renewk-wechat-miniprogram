function findMatches(selections, cocktails) {
  const { base, flavors, strength } = selections;
  const rules = {
    baseTagWeight: 3,
    flavorTagWeight: 2,
    strengthTagWeight: 2
  };

  const scoredCocktails = cocktails.map(cocktail => {
    let score = 0;

    if (base && cocktail.base_tags.includes(base)) {
      score += rules.baseTagWeight;
    }

    if (flavors.length > 0) {
      const matchedFlavors = cocktail.flavor_tags.filter(tag => 
        flavors.includes(tag)
      );
      score += matchedFlavors.length * rules.flavorTagWeight;
    }

    if (strength && cocktail.strength === strength) {
      score += rules.strengthTagWeight;
    }

    return { ...cocktail, score };
  });

  scoredCocktails.sort((a, b) => b.score - a.score);
  return scoredCocktails;
}

function rerollSameBase(matchedCocktails, base, currentIndex) {
  const sameBaseCocktails = matchedCocktails.filter(cocktail => 
    cocktail.base_tags.includes(base)
  );
  
  if (sameBaseCocktails.length <= 1) {
    return currentIndex;
  }

  const currentCocktailId = matchedCocktails[currentIndex].id;
  const alternatives = sameBaseCocktails.filter(cocktail => 
    cocktail.id !== currentCocktailId
  );
  
  if (alternatives.length === 0) {
    return currentIndex;
  }

  const randomIndex = Math.floor(Math.random() * alternatives.length);
  const newCocktail = alternatives[randomIndex];
  return matchedCocktails.findIndex(c => c.id === newCocktail.id);
}

module.exports = {
  findMatches,
  rerollSameBase
};
