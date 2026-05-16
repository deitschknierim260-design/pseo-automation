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
    <article class="post-preview">
      <h2><a href="${article.slug}.html">${article.title}</a></h2>
      <p class="meta">${article.date} | ${article.tags.join(', ')}</p>
      <p class="excerpt">${article.excerpt}</p>
    </article>
  `).join('');

  const html = template
    .replace('{{title}}', '技术学习指南 - 编程教程汇总')
    .replace('{{description}}', '专注于编程技术学习，提供Python、JavaScript、React等技术教程和学习路线')
    .replace('{{content}}', `
      <h1>技术学习指南</h1>
      <p class="lead">欢迎来到技术学习指南！这里汇集了最新的编程教程和学习资源。</p>
      <div class="post-list">${articleList}</div>
    `);

  await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), html, 'utf-8');
  console.log('Generated: index.html');
};

const buildArticle = async (article, template) => {
  const htmlContent = marked(article.content);
  
  const html = template
    .replace('{{title}}', article.title)
    .replace('{{description}}', article.excerpt)
    .replace('{{content}}', htmlContent);

  await fs.writeFile(path.join(OUTPUT_DIR, `${article.slug}.html`), html, 'utf-8');
  console.log(`Generated: ${article.slug}.html`);
};

const generateSitemap = async (articles) => {
  const urlset = articles.map(article => `
    <url>
      <loc>https://example.com/${article.slug}.html</loc>
      <lastmod>${article.date}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

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
Sitemap: https://example.com/sitemap.xml`;

  await fs.writeFile(path.join(OUTPUT_DIR, 'robots.txt'), robots, 'utf-8');
  console.log('Generated: robots.txt');
};

const main = async () => {
  await fs.emptyDir(OUTPUT_DIR);
  await fs.copy('static', OUTPUT_DIR);
  
  const template = await loadTemplate('base');
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
        slug: file.replace('.md', ''),
        date: data.date,
        tags: data.tags || [],
        content: mdContent,
        excerpt: mdContent.substring(0, 100) + '...'
      });
    }
  }
  
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  await buildIndex(articles, template);
  
  for (const article of articles) {
    await buildArticle(article, template);
  }
  
  await generateSitemap(articles);
  await generateRobots();
  
  console.log(`\n✅ Successfully built ${articles.length + 3} pages!`);
  if (skippedForReview > 0) {
    console.log(`⚠️ 跳过 ${skippedForReview} 篇待审核文章`);
  }
};

main().catch(console.error);