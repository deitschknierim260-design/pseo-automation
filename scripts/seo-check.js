import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(path.dirname(import.meta.url).replace('file:///', ''), '../dist');
const CONTENT_DIR = path.join(path.dirname(import.meta.url).replace('file:///', ''), '../content');

async function runChecks() {
    console.log('🔍 开始 SEO 健康检查...\n');
    
    let allPassed = true;
    let indexContent = '';

    // 检查 1: 验证 Sitemap 存在且有效
    console.log('📋 检查 1: Sitemap 验证');
    try {
        const sitemapContent = fs.readFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), 'utf-8');
        const urlCount = (sitemapContent.match(/<url>/g) || []).length;
        if (urlCount > 0) {
            console.log(`   ✅ Sitemap 包含 ${urlCount} 个 URL`);
        } else {
            console.log('   ❌ Sitemap 为空');
            allPassed = false;
        }
    } catch (error) {
        console.log('   ❌ Sitemap 文件不存在');
        allPassed = false;
    }

    // 检查 2: 验证 Robots.txt
    console.log('\n📋 检查 2: Robots.txt 验证');
    try {
        const robotsContent = fs.readFileSync(path.join(OUTPUT_DIR, 'robots.txt'), 'utf-8');
        if (robotsContent.includes('Allow: /') && robotsContent.includes('Sitemap:')) {
            console.log('   ✅ Robots.txt 配置正确');
        } else {
            console.log('   ⚠️ Robots.txt 配置不完整');
        }
    } catch (error) {
        console.log('   ❌ Robots.txt 文件不存在');
        allPassed = false;
    }

    // 检查 3: 验证文章数量
    console.log('\n📋 检查 3: 内容数量验证');
    const mdFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const htmlFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html'));
    console.log(`   ✅ Markdown 文章: ${mdFiles.length} 篇`);
    console.log(`   ✅ HTML 页面: ${htmlFiles.length} 个`);

    // 检查 4: 验证页面结构
    console.log('\n📋 检查 4: 页面结构验证');
    try {
        indexContent = fs.readFileSync(path.join(OUTPUT_DIR, 'index.html'), 'utf-8');
        const hasMeta = indexContent.includes('<meta') && indexContent.includes('<title');
        const hasCanonical = indexContent.includes('rel="canonical"');
        const hasOg = indexContent.includes('og:title') || indexContent.includes('og:description');
        
        if (hasMeta && hasCanonical && hasOg) {
            console.log('   ✅ 首页 SEO 标签完整');
        } else {
            console.log('   ⚠️ 首页 SEO 标签不完整');
            console.log(`      - Meta/Title: ${hasMeta ? '✅' : '❌'}`);
            console.log(`      - Canonical: ${hasCanonical ? '✅' : '❌'}`);
            console.log(`      - Open Graph: ${hasOg ? '✅' : '❌'}`);
        }
    } catch (error) {
        console.log('   ❌ 首页文件不存在');
        allPassed = false;
    }

    // 检查 5: 验证 Affiliate 链接
    console.log('\n📋 检查 5: Affiliate 链接验证');
    const firstArticle = htmlFiles.find(f => !f.startsWith('index') && !f.startsWith('sitemap'));
    if (firstArticle) {
        const articleContent = fs.readFileSync(path.join(OUTPUT_DIR, firstArticle), 'utf-8');
        const hasAffiliate = articleContent.includes('m.do.co');
        const hasNoFollow = articleContent.includes('rel="nofollow noopener"');
        
        if (hasAffiliate && hasNoFollow) {
            console.log('   ✅ Affiliate 链接配置正确');
        } else {
            console.log('   ⚠️ Affiliate 链接配置需要检查');
            console.log(`      - 推广链接: ${hasAffiliate ? '✅' : '❌'}`);
            console.log(`      - Nofollow: ${hasNoFollow ? '✅' : '❌'}`);
        }
    }

    // 检查 6: 验证 JSON-LD 结构化数据
    console.log('\n📋 检查 6: 结构化数据验证');
    if (indexContent && indexContent.includes('application/ld+json')) {
        console.log('   ✅ JSON-LD 结构化数据已添加');
    } else {
        console.log('   ⚠️ JSON-LD 结构化数据缺失');
    }

    // 输出总结
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
        console.log('🎉 所有检查通过！SEO 配置健康');
    } else {
        console.log('⚠️ 部分检查未通过，请检查日志并修复');
    }
    console.log('='.repeat(50));

    return allPassed;
}

runChecks().catch(console.error);