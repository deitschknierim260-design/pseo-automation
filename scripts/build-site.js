import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = 'content';
const EN_CONTENT_DIR = 'content/en';
const TEMPLATE_DIR = 'templates';
const OUTPUT_DIR = 'dist';
const EN_OUTPUT_DIR = 'dist/en';

const affiliateLinks = {
  cloud: {
    digitalocean: 'https://m.do.co/c/c9c6aa51c904',
    vultr: 'https://www.vultr.com/?ref=9903747',
    linode: 'https://www.linode.com/lp/refer/?r=YOUR_REF'
  },
  courses: {
    udemy: 'https://www.udemy.com/?aff_code=YOUR_CODE',
  },
  tools: {
    github: 'https://github.com/features/copilot',
    vercel: 'https://vercel.com/signup'
  }
};

const topicAffiliateMap = {
  docker: affiliateLinks.cloud.vultr,
  kubernetes: affiliateLinks.cloud.vultr,
  nginx: affiliateLinks.cloud.vultr,
  deployment: affiliateLinks.cloud.vultr,
  k8s: affiliateLinks.cloud.vultr,
  container: affiliateLinks.cloud.vultr,
  
  react: affiliateLinks.cloud.digitalocean,
  vue: affiliateLinks.cloud.digitalocean,
  javascript: affiliateLinks.cloud.digitalocean,
  typescript: affiliateLinks.cloud.digitalocean,
  python: affiliateLinks.cloud.digitalocean,
  git: affiliateLinks.cloud.digitalocean,
  sql: affiliateLinks.cloud.digitalocean,
  security: affiliateLinks.cloud.digitalocean,
  performance: affiliateLinks.cloud.digitalocean,
  web: affiliateLinks.cloud.digitalocean,
  
  learn: affiliateLinks.courses.udemy,
  tutorial: affiliateLinks.courses.udemy,
  guide: affiliateLinks.courses.udemy,
  beginners: affiliateLinks.courses.udemy,
  introduction: affiliateLinks.courses.udemy
};

const getAffiliateUrl = (title, tags) => {
  const lowerTitle = title.toLowerCase();
  for (const [topic, url] of Object.entries(topicAffiliateMap)) {
    if (lowerTitle.includes(topic)) return url;
    if (tags.some(tag => tag.toLowerCase().includes(topic))) return url;
  }
  return affiliateLinks.cloud.digitalocean;
};

const getAffiliateCta = (title, tags) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('docker')) {
    return '部署Docker容器，Vultr高性能云服务器';
  }
  if (lowerTitle.includes('kubernetes') || lowerTitle.includes('k8s')) {
    return 'K8s集群部署，Vultr云主机优惠';
  }
  if (lowerTitle.includes('nginx')) {
    return 'Nginx服务器配置，Vultr专属优惠';
  }
  if (lowerTitle.includes('deployment') || lowerTitle.includes('部署') || lowerTitle.includes('container') || lowerTitle.includes('容器')) {
    return '云服务器部署，Vultr新用户优惠';
  }
  
  if (lowerTitle.includes('python')) {
    return 'Python项目部署，DigitalOcean云服务器';
  }
  if (lowerTitle.includes('javascript') || lowerTitle.includes('js')) {
    return 'JS应用托管，DigitalOcean优惠';
  }
  if (lowerTitle.includes('react')) {
    return 'React应用部署，DigitalOcean入门';
  }
  if (lowerTitle.includes('typescript') || lowerTitle.includes('ts')) {
    return 'TypeScript项目，DigitalOcean云服务';
  }
  if (lowerTitle.includes('sql') || lowerTitle.includes('数据库')) {
    return '数据库服务器，DigitalOcean优惠';
  }
  if (lowerTitle.includes('security') || lowerTitle.includes('安全')) {
    return '安全服务器配置，DigitalOcean';
  }
  if (lowerTitle.includes('git') || lowerTitle.includes('版本控制')) {
    return 'Git仓库托管，DigitalOcean云主机';
  }
  
  return '开始你的项目，DigitalOcean新用户$200额度';
};

const loadTemplate = async (name) => {
  const templatePath = path.join(TEMPLATE_DIR, `${name}.html`);
  return await fs.readFile(templatePath, 'utf-8');
};

const buildIndex = async (articles, template) => {
  const articleList = articles.map(article => `
    <article class="post-card">
      <div class="card-content">
        <div class="card-tags">
          ${article.tags.slice(0, 3).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
        </div>
        <h2><a href="${article.slug}.html">${article.title}</a></h2>
        <p class="excerpt">${article.excerpt}</p>
        <div class="card-footer">
          <span class="card-date">📅 ${article.date}</span>
          <a href="${article.slug}.html" class="read-more">阅读更多 →</a>
        </div>
      </div>
    </article>
  `).join('');

  const html = template
    .replace('{{title}}', '技术学习指南 - 编程教程汇总')
    .replace('{{description}}', '专注于编程技术学习，提供Python、JavaScript、React等技术教程和学习路线')
    .replace('{{canonicalUrl}}', '')
    .replace('{{content}}', `
      <div class="page-header">
        <h1>技术学习指南</h1>
        <p class="lead">专注于编程技术学习，提供最新的编程教程和学习资源</p>
      </div>
      <div class="post-grid">${articleList}</div>
    `);

  await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), html, 'utf-8');
  console.log('Generated: index.html');
};

const buildArticle = async (article, template) => {
  const htmlContent = marked(article.content);
  const tagsHtml = article.tags.slice(0, 3).map(tag => 
    `<span class="article-tag">${tag}</span>`
  ).join('');
  
  const relatedArticles = getRelatedArticles(article.title);
  
  const affiliateUrl = article.affiliateUrl || getAffiliateUrl(article.title, article.tags);
  const affiliateCta = article.affiliateCtaText || getAffiliateCta(article.title, article.tags);
  
  const html = template
    .replaceAll('{{title}}', article.title)
    .replaceAll('{{description}}', article.excerpt)
    .replaceAll('{{canonicalUrl}}', `${article.slug}.html`)
    .replaceAll('{{date}}', article.date)
    .replaceAll('{{slug}}', article.slug)
    .replaceAll('{{tags}}', tagsHtml)
    .replaceAll('{{content}}', htmlContent)
    .replaceAll('{{author}}', article.author || '技术专家')
    .replaceAll('{{authorTitle}}', article.authorTitle || '资深开发者')
    .replaceAll('{{authorAvatar}}', article.authorAvatar || '👨‍💻')
    .replaceAll('{{affiliateUrl}}', affiliateUrl)
    .replaceAll('{{affiliateCtaText}}', affiliateCta)
    .replaceAll('{{affiliate2Url}}', article.affiliate2Url || affiliateLinks.tools.github)
    .replaceAll('{{affiliate2Description}}', article.affiliate2Description || '提升开发效率？GitHub Copilot AI编程助手让你的编码速度翻倍！')
    .replaceAll('{{affiliate2CtaText}}', article.affiliate2CtaText || '免费试用')
    .replaceAll('{{relatedArticles}}', relatedArticles)
    .replaceAll('{{lang}}', 'zh-CN')
    .replaceAll('{{ogLocale}}', 'zh_CN')
    .replaceAll('{{siteName}}', '技术学习指南')
    .replaceAll('{{keywords}}', '编程,技术,教程,学习,Python,JavaScript,React,Node.js')
    .replaceAll('{{homeText}}', '首页')
    .replaceAll('{{homeUrl}}', '')
    .replaceAll('{{categoryText}}', '技术教程');

  await fs.writeFile(path.join(OUTPUT_DIR, `${article.slug}.html`), html, 'utf-8');
  console.log(`Generated: ${article.slug}.html`);
};

const getRelatedArticles = (title) => {
  const relatedMap = {
    'Python': [
      { title: 'Python异步编程指南', slug: 'async-python-programming' },
      { title: 'Python设计模式详解', slug: 'python-design-patterns' },
      { title: 'Django框架实战', slug: 'django-framework-guide' }
    ],
    'JavaScript': [
      { title: 'ES6+新特性详解', slug: 'es6-features-explained' },
      { title: 'Promise与async/await入门', slug: 'javascript-async-guide' },
      { title: 'JavaScript性能优化', slug: 'frontend-performance-optimization' }
    ],
    'React': [
      { title: 'React Hooks完全指南', slug: 'react-hooks-guide' },
      { title: 'Redux状态管理详解', slug: 'redux-state-management' },
      { title: 'React性能优化实战', slug: 'react-performance-tips' }
    ],
    'Node.js': [
      { title: 'Express框架入门', slug: 'express-framework-intro' },
      { title: 'Node.js性能调优', slug: 'nodejs-performance-tuning' },
      { title: 'Socket.IO实时通信', slug: 'socketio-realtime' }
    ],
    'CSS': [
      { title: 'Flexbox布局完全指南', slug: 'css-flexbox-guide' },
      { title: 'CSS Grid布局详解', slug: 'css-grid-layout' },
      { title: 'CSS动画实战', slug: 'css-animations-guide' }
    ],
    'Git': [
      { title: 'Git工作流最佳实践', slug: 'git-workflow-best-practices' },
      { title: '代码审查流程', slug: 'code-review-process' },
      { title: 'GitHub协作指南', slug: 'github-collaboration-guide' }
    ],
    'Docker': [
      { title: 'Docker Compose实战', slug: 'docker-compose-guide' },
      { title: 'Kubernetes入门', slug: 'kubernetes-introduction' },
      { title: 'CI/CD流水线搭建', slug: 'cicd-pipeline-setup' }
    ],
    'SQL': [
      { title: 'SQL查询优化技巧', slug: 'sql-query-optimization' },
      { title: '数据库索引设计', slug: 'database-index-design' },
      { title: '事务处理详解', slug: 'database-transactions-guide' }
    ],
    'TypeScript': [
      { title: 'TypeScript类型体操', slug: 'typescript-type-gymnastics' },
      { title: '泛型编程入门', slug: 'typescript-generics-guide' },
      { title: '与React配合使用', slug: 'typescript-react-guide' }
    ],
    'Vue': [
      { title: 'Vue3组合式API详解', slug: 'vue3-composition-api' },
      { title: 'Pinia状态管理', slug: 'pinia-state-management' },
      { title: 'Vue Router实战', slug: 'vue-router-guide' }
    ],
    'Linux': [
      { title: 'Shell脚本编程', slug: 'shell-scripting-guide' },
      { title: '服务器运维基础', slug: 'server-administration-basics' },
      { title: 'Nginx配置详解', slug: 'nginx-configuration-guide' }
    ],
    'HTTP': [
      { title: 'HTTPS原理详解', slug: 'https-explained' },
      { title: 'HTTP缓存策略', slug: 'http-caching-strategies' },
      { title: 'RESTful API设计', slug: 'restful-api-design-principles' }
    ],
    '算法': [
      { title: '排序算法详解', slug: 'sorting-algorithms-explained' },
      { title: '动态规划入门', slug: 'dynamic-programming-intro' },
      { title: 'LeetCode刷题指南', slug: 'leetcode-study-guide' }
    ],
    '单元测试': [
      { title: 'Jest测试框架', slug: 'jest-testing-framework' },
      { title: '测试覆盖率指南', slug: 'test-coverage-guide' },
      { title: 'Mock技术详解', slug: 'mock-techniques-guide' }
    ]
  };
  
  const matchedKey = Object.keys(relatedMap).find(key => title.includes(key));
  const articles = matchedKey ? relatedMap[matchedKey] : [
    { title: '编程入门指南', slug: 'programming-introduction' },
    { title: '开发最佳实践', slug: 'development-best-practices' },
    { title: '技术学习路线', slug: 'learning-path-guide' }
  ];
  
  return articles.map(article => `
    <div class="related-item">
      <a href="${article.slug}.html">${article.title}</a>
    </div>
  `).join('');
};

const SITE_URL = 'https://pseobuilder.net';

const generateSitemap = async (articles) => {
  const urlset = articles.map(article => {
    const date = typeof article.date === 'string' ? article.date : new Date().toISOString().split('T')[0];
    return `
    <url>
      <loc>${SITE_URL}/${article.slug}.html</loc>
      <lastmod>${date}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap, 'utf-8');
  console.log('Generated: sitemap.xml');
};

const generateRobots = async () => {
  const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'robots.txt'), robots, 'utf-8');
  console.log('Generated: robots.txt');
};

const buildEnArticle = async (article, template) => {
  const htmlContent = marked(article.content);
  const tagsHtml = article.tags.slice(0, 3).map(tag => 
    `<span class="article-tag">${tag}</span>`
  ).join('');
  
  const relatedArticles = getRelatedArticles(article.title);
  
  const affiliateUrl = article.affiliateUrl || getAffiliateUrl(article.title, article.tags);
  const affiliateCta = article.affiliateCtaText || getAffiliateCta(article.title, article.tags);
  
  const cleanSlug = article.slug.replace(/^en\//, '');
  
  const html = template
    .replaceAll('{{title}}', article.title)
    .replaceAll('{{description}}', article.excerpt)
    .replaceAll('{{canonicalUrl}}', `en/${cleanSlug}.html`)
    .replaceAll('{{date}}', article.date)
    .replaceAll('{{slug}}', cleanSlug)
    .replaceAll('{{tags}}', tagsHtml)
    .replaceAll('{{content}}', htmlContent)
    .replaceAll('{{author}}', article.author || 'Technical Expert')
    .replaceAll('{{authorTitle}}', article.authorTitle || 'Senior Developer')
    .replaceAll('{{authorAvatar}}', article.authorAvatar || '👨‍💻')
    .replaceAll('{{affiliateUrl}}', affiliateUrl)
    .replaceAll('{{affiliateCtaText}}', affiliateCta)
    .replaceAll('{{affiliate2Url}}', article.affiliate2Url || affiliateLinks.tools.github)
    .replaceAll('{{affiliate2Description}}', article.affiliate2Description || 'Boost your productivity with GitHub Copilot AI coding assistant!')
    .replaceAll('{{affiliate2CtaText}}', article.affiliate2CtaText || 'Try for free')
    .replaceAll('{{relatedArticles}}', relatedArticles)
    .replaceAll('{{lang}}', 'en')
    .replaceAll('{{ogLocale}}', 'en_US')
    .replaceAll('{{siteName}}', 'Tech Learning Guide')
    .replaceAll('{{keywords}}', 'programming,tech,tutorial,learning,Python,JavaScript,React,Node.js')
    .replaceAll('{{homeText}}', 'Home')
    .replaceAll('{{homeUrl}}', 'en/')
    .replaceAll('{{categoryText}}', 'Tech Tutorials');

  await fs.writeFile(path.join(EN_OUTPUT_DIR, `${cleanSlug}.html`), html, 'utf-8');
  console.log(`Generated: en/${cleanSlug}.html`);
};

const buildEnIndex = async (articles, template) => {
  const articleList = articles.map(article => {
    const cleanSlug = article.slug.replace(/^en\//, '');
    return `
    <article class="post-card">
      <div class="card-content">
        <div class="card-tags">
          ${article.tags.slice(0, 3).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
        </div>
        <h2><a href="${cleanSlug}.html">${article.title}</a></h2>
        <p class="excerpt">${article.excerpt}</p>
        <div class="card-footer">
          <span class="card-date">📅 ${article.date}</span>
          <a href="${cleanSlug}.html" class="read-more">Read more →</a>
        </div>
      </div>
    </article>
  `;
  }).join('');

  const html = template
    .replace('{{title}}', 'Tech Learning Guide - Programming Tutorials')
    .replace('{{description}}', 'Learn programming with tutorials on Python, JavaScript, React and more')
    .replace('{{canonicalUrl}}', 'en/')
    .replace('{{content}}', `
      <div class="page-header">
        <h1>Tech Learning Guide</h1>
        <p class="lead">Master programming skills with comprehensive tutorials and resources</p>
      </div>
      <div class="post-grid">${articleList}</div>
    `);

  await fs.writeFile(path.join(EN_OUTPUT_DIR, 'index.html'), html, 'utf-8');
  console.log('Generated: en/index.html');
};

const main = async () => {
  await fs.emptyDir(OUTPUT_DIR);
  await fs.copy('static', OUTPUT_DIR);
  
  const baseTemplate = await loadTemplate('base');
  const articleTemplate = await loadTemplate('article');
  
  const articles = [];
  const enArticles = [];
  let skippedForReview = 0;
  
  const files = await fs.readdir(CONTENT_DIR);
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: mdContent } = matter(content);
      
      if (data.needsHumanReview) {
        skippedForReview++;
        console.log(`⚠️ 跳过待审核: ${file}`);
        continue;
      }
      
      articles.push({
        title: data.title,
        slug: data.slug || file.replace('.md', '').toLowerCase().replace(/[^\w\s\u4e00-\u9fa5]/g, '').replace(/\s+/g, '-'),
        date: data.date,
        description: data.description || '',
        tags: data.tags || [],
        content: mdContent,
        excerpt: data.description || mdContent.substring(0, 100) + '...'
      });
    }
  }
  
  await fs.ensureDir(EN_OUTPUT_DIR);
  const enFiles = await fs.readdir(EN_CONTENT_DIR);
  for (const file of enFiles) {
    if (file.endsWith('.md')) {
      const filePath = path.join(EN_CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: mdContent } = matter(content);
      
      enArticles.push({
        title: data.title,
        slug: data.slug || file.replace('.md', '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
        date: data.date,
        description: data.description || '',
        tags: data.tags || [],
        content: mdContent,
        excerpt: data.description || mdContent.substring(0, 100) + '...'
      });
    }
  }
  
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  enArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  await buildIndex(articles, baseTemplate);
  await buildEnIndex(enArticles, baseTemplate);
  
  for (const article of articles) {
    await buildArticle(article, articleTemplate);
  }
  
  for (const article of enArticles) {
    await buildEnArticle(article, articleTemplate);
  }
  
  const allArticles = [...articles, ...enArticles.map(a => ({...a, slug: `en/${a.slug.replace(/^en\//, '')}`}))];
  await generateSitemap(allArticles);
  await generateRobots();
  
  await fs.copy('static', EN_OUTPUT_DIR, { overwrite: true });
  
  console.log(`\n✅ Successfully built ${articles.length + enArticles.length + 4} pages!`);
  console.log(`   - 中文文章: ${articles.length} 篇`);
  console.log(`   - 英文文章: ${enArticles.length} 篇`);
  if (skippedForReview > 0) {
    console.log(`⚠️ 跳过 ${skippedForReview} 篇待审核文章`);
  }
};

main().catch(console.error);