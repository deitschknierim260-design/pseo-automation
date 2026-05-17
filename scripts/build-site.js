import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_DIR = 'content';
const TEMPLATE_DIR = 'templates';
const OUTPUT_DIR = 'dist';

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
    .replace('{{content}}', `
      <div class="page-header">
        <h1>技术学习指南</h1>
        <p class="lead">全网首个基于AI驱动的自动化技术教程知识库，汇集最新的编程教程和学习资源</p>
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
  
  const html = template
    .replaceAll('{{title}}', article.title)
    .replaceAll('{{description}}', article.excerpt)
    .replaceAll('{{date}}', article.date)
    .replaceAll('{{slug}}', article.slug)
    .replaceAll('{{tags}}', tagsHtml)
    .replaceAll('{{content}}', htmlContent)
    .replaceAll('{{author}}', article.author || '技术专家')
    .replaceAll('{{authorTitle}}', article.authorTitle || '资深开发者')
    .replaceAll('{{authorAvatar}}', article.authorAvatar || '👨‍💻')
    .replaceAll('{{affiliateUrl}}', article.affiliateUrl || 'https://m.do.co/c/c9c6aa51c904')
    .replaceAll('{{affiliateCtaText}}', article.affiliateCtaText || '获取云服务器优惠')
    .replaceAll('{{relatedArticles}}', relatedArticles);

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

const generateSitemap = async (articles) => {
  const urlset = articles.map(article => {
    const date = typeof article.date === 'string' ? article.date : new Date().toISOString().split('T')[0];
    return `
    <url>
      <loc>https://pseo-automation.vercel.app/${article.slug}.html</loc>
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
Sitemap: https://pseo-automation.vercel.app/sitemap.xml`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'robots.txt'), robots, 'utf-8');
  console.log('Generated: robots.txt');
};

const main = async () => {
  await fs.emptyDir(OUTPUT_DIR);
  await fs.copy('static', OUTPUT_DIR);
  
  const baseTemplate = await loadTemplate('base');
  const articleTemplate = await loadTemplate('article');
  const files = await fs.readdir(CONTENT_DIR);
  
  const articles = [];
  let skippedForReview = 0;
  
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
  
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  await buildIndex(articles, baseTemplate);
  
  for (const article of articles) {
    await buildArticle(article, articleTemplate);
  }
  
  await generateSitemap(articles);
  await generateRobots();
  
  console.log(`\n✅ Successfully built ${articles.length + 3} pages!`);
  if (skippedForReview > 0) {
    console.log(`⚠️ 跳过 ${skippedForReview} 篇待审核文章`);
  }
};

main().catch(console.error);