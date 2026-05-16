export { techTutorials } from './tech-tutorials.js';
export { homeImprovement } from './home-improvement.js';
export { healthFitness } from './health-fitness.js';

export const niches = {
  tech: {
    name: "技术教程",
    keywords: techTutorials,
    description: "编程技术教程和开发技巧",
    adValue: "high",
    competition: "medium"
  },
  home: {
    name: "家居改造",
    keywords: homeImprovement,
    description: "家居装修和生活技巧",
    adValue: "high",
    competition: "medium"
  },
  health: {
    name: "健康健身",
    keywords: healthFitness,
    description: "健身和健康生活方式",
    adValue: "high",
    competition: "high"
  }
};

export const getNiche = (name) => {
  return niches[name] || niches.tech;
};